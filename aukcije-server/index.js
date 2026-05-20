const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { join } = require("path");
const path = require("path");
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");
const config = require("../aukcije-server/auth.config.js");
const authJwt = require("../aukcije-server/authJwt.js");

const app = express();
const port = 3000;

// Parser za JSON podatke
app.use(bodyParser.json());

// Parser za podatke iz formi
app.use(bodyParser.urlencoded({ extended: true }));

// Postavke direktorija za statičke datoteke
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: "*" }));

const connection = mysql.createConnection({
  host: "student.veleri.hr",
  user: "iooa-aukcije",
  password: "11",
  database: "iooa-aukcije1",
});

app.use(express.urlencoded({ extended: true }));

connection.connect();

connection.query(`
  CREATE TABLE IF NOT EXISTS transakcija (
    id_transakcije INT AUTO_INCREMENT PRIMARY KEY,
    id_predmeta INT NOT NULL,
    id_korisnika INT NOT NULL,
    iznos_transakcije DECIMAL(10,2) NOT NULL,
    vrijeme_transakcije DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'završena',
    FOREIGN KEY (id_predmeta) REFERENCES predmet(id_predmeta),
    FOREIGN KEY (id_korisnika) REFERENCES korisnik(id_korisnika)
  )
`, (error) => {
  if (error) {
    console.error('Greška pri kreiranju tablice transakcija:', error);
  } else {
    console.log('Tablica transakcija kreirana ili već postoji.');
  }
});

app.get("/api/korisnici", authJwt.verifyTokenAdmin, (req, res) => {
  console.log('Admin users requested by user:', req.userId);
  const search = (req.query.search || '').trim().toLowerCase();
  const role = (req.query.role || 'all').toLowerCase();

  let whereClause = "WHERE ime_korisnika != 'obrisani' AND prezime_korisnika != 'korisnik'";
  const params = [];

  if (search) {
    whereClause += " AND (LOWER(ime_korisnika) LIKE ? OR LOWER(prezime_korisnika) LIKE ? OR LOWER(email_korisnika) LIKE ?)";
    const searchParam = %${search}%;
    params.push(searchParam, searchParam, searchParam);
  }

  if (role === 'admin' || role === 'user') {
    whereClause += " AND LOWER(uloga) = ?";
    params.push(role);
  }

  const query = SELECT id_korisnika, ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, uloga FROM korisnik ${whereClause};

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Greška pri dohvaćanju korisnika:', error);
      return res.status(500).json({ error: true, message: 'Greška pri dohvaćanju korisnika.' });
    }
    res.json(results);
  });
});

app.put("/api/korisnici/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const idKorisnika = req.params.id;
  const { ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, uloga } = req.body;

  if (!ime_korisnika || !prezime_korisnika || !email_korisnika || !uloga) {
    return res.status(400).json({ error: true, message: 'Sva obavezna polja moraju biti popunjena.' });
  }

  connection.query(
    "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, adresa_korisnika = ?, uloga = ? WHERE id_korisnika = ?",
    [ime_korisnika.trim(), prezime_korisnika.trim(), email_korisnika.trim(), adresa_korisnika?.trim() || '', uloga.trim().toLowerCase(), idKorisnika],
    (error, results) => {
      if (error) {
        console.error('Greška pri ažuriranju korisnika:', error);
        return res.status(500).json({ error: true, message: 'Greška pri ažuriranju korisnika.' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
      }
      res.send({ error: false, message: 'Korisnik uspješno ažuriran.' });
    }
  );
});

app.delete("/api/korisnici/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const idKorisnika = req.params.id;
  const deletedEmail = obrisani_${idKorisnika}_${Date.now()}@example.com;
  const deletedPassword = require('crypto').randomBytes(64).toString('hex');

  connection.query(
    "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, adresa_korisnika = ?, lozinka_korisnika = ?, uloga = ? WHERE id_korisnika = ?",
    ['obrisani', 'korisnik', deletedEmail, 'obrisani korisnik', deletedPassword, 'user', idKorisnika],
    (error, results) => {
      if (error) {
        console.error('Greška pri brisanju korisnika:', error);
        return res.status(500).json({ error: true, message: 'Greška pri brisanju korisnika.' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
      }
      res.send({ error: false, message: 'Korisnik uspješno obrisan.' });
    }
  );
});

app.get("/getUnosPredmeta", authJwt.verifyTokenUser, function (request, response) {
  connection.query("SELECT * FROM korisnik", function (error, korisniciResults) {
    if (error) throw error;

    connection.query("SELECT * FROM kategorija", function (error, kategorijeResults) {
      if (error) throw error;

      response.send({
        korisnici: korisniciResults,
        kategorije: kategorijeResults,
      });
    });
  });
});

app.post("/unosPredmeta", upload.none(), authJwt.verifyTokenUser, function (request, response) {
  const data = request.body;
  const predmet = [[data.naziv_predmeta, data.opis_predmeta, data.vrijeme_pocetka, data.vrijeme_zavrsetka, data.pocetna_cijena, data.id_korisnika, data.id_kategorije]];

  connection.query("INSERT INTO predmet (naziv_predmeta, opis_predmeta, vrijeme_pocetka, vrijeme_zavrsetka, pocetna_cijena, id_korisnika, id_kategorije) VALUES ?", [predmet], function (error, results) {
    if (error) throw error;
    const insertedPredmetId = results.insertId;

    const keys = Object.keys(data).filter(key => key.startsWith("file"));
    let completed = 0;

    if (keys.length === 0) {
      return response.send({ error: false, message: "Predmet dodan bez slika.", insertedPredmetId: insertedPredmetId });
    }

    keys.forEach((key) => {
      const base64String = data[key];
      connection.query("INSERT INTO slika (slika, id_predmeta) VALUES (?, ?)", [base64String, insertedPredmetId], function (error) {
        if (error) throw error;
        completed++;
        if (completed === keys.length) {
          return response.send({ error: false, message: "Predmet i slike su dodani.", insertedPredmetId: insertedPredmetId });
        }
      });
    });
  });
});

app.get("/api/all-predmet", (req, res) => {
  const query = `
    SELECT
        p.id_predmeta,
        p.opis_predmeta,
        p.naziv_predmeta,
        p.pocetna_cijena,
        p.vrijeme_pocetka,
        p.vrijeme_zavrsetka,
        CONCAT(
            FLOOR(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) / (24 * 3600)),
            ' dana, ',
            TIME_FORMAT(
                SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) % (24 * 3600)),
                '%H:%i:%s'
            )
        ) AS preostalo_vrijeme,
        (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
        COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
    FROM predmet p
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
    WHERE p.vrijeme_zavrsetka > NOW()
    GROUP BY p.id_predmeta
    ORDER BY preostalo_vrijeme DESC;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    res.send(results);
  });
});



app.get("/api/pretrazi-predmet", (req, res) => {
  const keyword = (req.query.keyword || "").trim();

  if (!keyword) {
    return res.status(400).send({ message: "Ključna riječ je obavezna." });
  }

  const searchKeyword = %${keyword.toLowerCase()}%;

  const query = `
    SELECT
        p.id_predmeta,
        p.opis_predmeta,
        p.naziv_predmeta,
        p.pocetna_cijena,
        p.vrijeme_pocetka,
        p.vrijeme_zavrsetka,
        CONCAT(
            FLOOR(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) / (24 * 3600)),
            ' dana, ',
            TIME_FORMAT(
                SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) % (24 * 3600)),
                '%H:%i:%s'
            )
        ) AS preostalo_vrijeme,
        (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
        COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
    FROM predmet p
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
    WHERE p.vrijeme_zavrsetka > NOW()
      AND (
        LOWER(p.naziv_predmeta) LIKE ?
        OR LOWER(p.opis_predmeta) LIKE ?
      )
    GROUP BY p.id_predmeta
    ORDER BY p.vrijeme_zavrsetka ASC;
  `;

  connection.query(query, [searchKeyword, searchKeyword], (error, results) => {
    if (error) {
      console.error("Greška kod pretrage aukcija:", error);
      return res.status(500).send({ message: "Greška kod pretrage aukcija." });
    }

    res.send(results);
  });
});

app.get("/api/get-predmet/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    `SELECT p.naziv_predmeta, p.id_predmeta, p.pocetna_cijena, p.vrijeme_pocetka, p.vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, p.vrijeme_pocetka, p.vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme, p.opis_predmeta, COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS vrijednost_ponude, GROUP_CONCAT(DISTINCT s.slika SEPARATOR '|||') AS slike
    FROM predmet p 
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta 
    LEFT JOIN slika s ON p.id_predmeta = s.id_predmeta 
    WHERE p.id_predmeta = ? 
    GROUP BY p.id_predmeta`,
    [id],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0 && results[0].slike) {
        results[0].slike = results[0].slike.split("|||");
      }
      res.send(results);
    }
  );
});

app.get("/api/get-kategorija-predmet/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    `
    SELECT
    p.id_predmeta,
    p.opis_predmeta,
    p.naziv_predmeta,
    p.pocetna_cijena,
    p.vrijeme_pocetka,
    p.vrijeme_zavrsetka,
    CONCAT(
        FLOOR(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) / (24 * 3600)),
        ' dana, ',
        TIME_FORMAT(
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) % (24 * 3600)),
            '%H:%i:%s'
        )
    ) AS preostalo_vrijeme,
    (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
    COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
FROM predmet p
LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
WHERE p.id_kategorije = ? AND p.vrijeme_zavrsetka > NOW()
GROUP BY p.id_predmeta
ORDER BY preostalo_vrijeme DESC;

  `,
    [id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.get("/api/all-kategorija", authJwt.verifyTokenAdmin, (req, res) => {
  console.log('Admin categories requested by user:', req.userId);
  connection.query("SELECT * FROM kategorija", (error, results) => {
    if (error) {
      console.error('Greška pri dohvaćanju kategorija:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

app.get("/all-kategorija", (req, res) => {
  connection.query("SELECT * FROM kategorija", (error, results) => {
    if (error) {
      console.error('Greška pri dohvaćanju kategorija (alias):', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

/* 

app.get("/api/pretrazi-predmet", (req, res) => {
  const keyword = (req.query.keyword || "").trim();

  if (!keyword) {
    return res.status(400).send({ message: "Ključna riječ je obavezna." });
  }

  const searchKeyword = %${keyword.toLowerCase()}%;

  const query = `
    SELECT
        p.id_predmeta,
        p.opis_predmeta,
        p.naziv_predmeta,
        p.pocetna_cijena,
        p.vrijeme_pocetka,
        p.vrijeme_zavrsetka,
        CONCAT(
            FLOOR(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) / (24 * 3600)),
            ' dana, ',
            TIME_FORMAT(
                SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) % (24 * 3600)),
                '%H:%i:%s'
            )
        ) AS preostalo_vrijeme,
        (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
        COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
    FROM predmet p
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
    WHERE p.vrijeme_zavrsetka > NOW()
      AND (
        LOWER(p.naziv_predmeta) LIKE ?
        OR LOWER(p.opis_predmeta) LIKE ?
      )
    GROUP BY p.id_predmeta
    ORDER BY p.vrijeme_zavrsetka ASC;
  `;

  connection.query(query, [searchKeyword, searchKeyword], (error, results) => {
    if (error) {
      console.error("Greška kod pretrage aukcija:", error);
      return res.status(500).send({ message: "Greška kod pretrage aukcija." });
    }

    res.send(results);
  });
});

app.get("/api/get-predmet/:id", (req, res) => {
  const { id } = req.params;

  connection.query("SELECT id_predmeta, naziv_predmeta,pocetna_cijena, vrijeme_pocetka, vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme FROM predmet WHERE id_predmeta = ?", [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
}); */

app.get("/api/get-ponuda/:id", (req, res) => {
  const { id } = req.params;

  connection.query('SELECT id_ponude, vrijednost_ponude, DATE_FORMAT(vrijeme_ponude, "%Y-%m-%d %H:%i:%s") as vrijeme_ponude, id_korisnika FROM ponuda WHERE id_predmeta = ?', [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.post("/unostrenutnaponuda", authJwt.verifyTokenUser, function (request, response) {
  const data = request.body;
  const ponuda = [[data.vrijednost_ponude, data.vrijeme_ponude, data.id_korisnika, data.id_predmeta]];
  connection.query("INSERT INTO ponuda (vrijednost_ponude, vrijeme_ponude, id_korisnika, id_predmeta) VALUES ?", [ponuda], function (error, results, fields) {
    if (error) throw error;
    return response.send({ error: false, data: results, message: "Dodana je trenutna ponuda." });
  });
});

app.get("/api/vlastita-ponuda-korisnik/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    `SELECT p., pr., s.*
    FROM ponuda p
    JOIN predmet pr ON p.id_predmeta = pr.id_predmeta
    LEFT JOIN slika s ON pr.id_predmeta = s.id_predmeta
    WHERE p.id_korisnika = ?
    GROUP BY p.id_ponude, pr.id_predmeta, s.id_slike
    ORDER BY p.vrijeme_ponude DESC;`,
    [id],
    (error, results) => {
      if (error) throw error;
      res.json(results);
    }
  );
});

app.post("/api/unos-slike", authJwt.verifyTokenUser, function (req, res) {
  const data = req.body;
  const slika = data.slika;

  connection.query("INSERT INTO slika (slika) VALUES (?)", [slika], function (error, results, fields) {
    if (error) {
      console.error(error);
      return res.status(500).send({
        error: true,
        message: "Dogodila se greška prilikom dodavanja teksta.",
      });
    }
    return res.send({
      error: false,
      data: results,
      message: "Slika je dodana.",
    });
  });
});

app.get("/api/all-predmet-with-current-price", (req, res) => {
  connection.query("SELECT p.id_predmeta, p.naziv_predmeta,  p.opis_predmeta, p.pocetna_cijena, p.vrijeme_pocetka, p.vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme, COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena FROM predmet p LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta WHERE p.vrijeme_zavrsetka > NOW() GROUP BY p.id_predmeta ORDER BY preostalo_vrijeme DESC", (error, results) => {
    if (error) throw error;

    res.send(results);
  });
});

app.get("/api/get-predmet-trenutna-cijena/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT MAX(vrijednost_ponude) AS max_vrijednost_ponude FROM ponuda WHERE id_predmeta = ?", [id], (error, results) => {
    if (error) {
      return res.status(500).send({ error: "Database error" });
    }
    if (results && results.length > 0) {
      res.send({ max_vrijednost_ponude: results[0].max_vrijednost_ponude });
    } else {
      res.status(404).send({ message: "No offers found for the given id_predmeta" });
    }
  });
});

// Kreiraj tablicu transakcija ako ne postoji
const createTransactionTableSQL = `
  CREATE TABLE IF NOT EXISTS transakcija (
    id_transakcije INT PRIMARY KEY AUTO_INCREMENT,
    iznos_transakcije DECIMAL(10,2),
    vrijeme_transakcije DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_korisnika INT,
    id_predmeta INT,
    status VARCHAR(20) DEFAULT 'završena',
    FOREIGN KEY (id_korisnika) REFERENCES korisnik(id_korisnika),
    FOREIGN KEY (id_predmeta) REFERENCES predmet(id_predmeta)
  )
`;

connection.query(createTransactionTableSQL, (error) => {
  if (error && error.code !== 'ER_TABLE_EXISTS_USING_CREATE') {
    console.error("Greška pri kreiranju tablice transakcija:", error);
  } else {
    console.log("Tablica transakcija je sprema.");
  }
});

// GET /api/admin/auctions - Lista aukcija sa filterima
app.get("/api/admin/auctions", authJwt.verifyTokenAdmin, (req, res) => {
  console.log('Admin auctions requested by user:', req.userId);
  const search = (req.query.search || '').trim();
  const status = (req.query.status || 'all').toLowerCase();
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  let whereClause = '1=1';
  const params = [];

  if (search) {
    const searchParam = %${search.toLowerCase()}%;
    whereClause += ' AND (LOWER(p.naziv_predmeta) LIKE ? OR LOWER(k.ime_korisnika) LIKE ? OR LOWER(k.prezime_korisnika) LIKE ?)';
    params.push(searchParam, searchParam, searchParam);
  }

  if (status === 'active') {
    whereClause += ' AND p.vrijeme_zavrsetka > NOW()';
  } else if (status === 'ended') {
    whereClause += ' AND p.vrijeme_zavrsetka <= NOW()';
  }

  const query = `
    SELECT
      p.id_predmeta,
      p.naziv_predmeta,
      CONCAT(k.ime_korisnika, ' ', k.prezime_korisnika) AS prodavac,
      COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena,
      COUNT(DISTINCT po.id_ponude) AS broj_ponuda,
      CASE WHEN p.vrijeme_zavrsetka > NOW() THEN 'Aktivna' ELSE 'Završena' END AS status,
      p.vrijeme_zavrsetka
    FROM predmet p
    JOIN korisnik k ON p.id_korisnika = k.id_korisnika
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
    WHERE ${whereClause}
    GROUP BY p.id_predmeta
    ORDER BY p.vrijeme_zavrsetka ASC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM predmet p
    JOIN korisnik k ON p.id_korisnika = k.id_korisnika
    WHERE ${whereClause}
  `;

  connection.query(countQuery, params, (error, countResults) => {
    if (error) {
      console.error('Greška kod brojanja aukcija:', error);
      return res.status(500).json({ message: 'Greška kod brojanja aukcija', error });
    }

    const total = countResults[0]?.total || 0;

    connection.query(query, [...params, limit, offset], (error, results) => {
      if (error) {
        console.error('Greška kod dohvaćanja aukcija:', error);
        return res.status(500).json({ message: 'Greška kod dohvaćanja aukcija', error });
      }

      console.log('Auctions results:', results.length, 'rows');
      res.json({ rows: results, total, page, limit, totalPages: Math.ceil(total / limit) });
    });
  });
});

// GET /api/admin/transactions - Lista transakcija sa filterima
app.get("/api/admin/transactions", authJwt.verifyTokenAdmin, (req, res) => {
  console.log('Admin transactions requested by user:', req.userId);
  const search = (req.query.search || '').trim();
  const status = (req.query.status || '').trim();
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  let whereClause = '1=1';
  const params = [];

  if (search) {
    const searchParam = %${search.toLowerCase()}%;
    whereClause += ' AND (LOWER(p.naziv_predmeta) LIKE ? OR LOWER(kupac.ime_korisnika) LIKE ? OR LOWER(kupac.prezime_korisnika) LIKE ?)';
    params.push(searchParam, searchParam, searchParam);
  }

  if (status) {
    whereClause += ' AND t.status = ?';
    params.push(status);
  }

  const query = `
    SELECT
      t.id_transakcije,
      t.iznos_transakcije,
      t.vrijeme_transakcije,
      p.naziv_predmeta AS aukcija,
      CONCAT(kupac.ime_korisnika, ' ', kupac.prezime_korisnika) AS kupac,
      CONCAT(prodavac.ime_korisnika, ' ', prodavac.prezime_korisnika) AS prodavac,
      'Završena' AS status
    FROM transakcija t
    JOIN predmet p ON t.id_predmeta = p.id_predmeta
    JOIN korisnik kupac ON t.id_korisnika = kupac.id_korisnika
    JOIN korisnik prodavac ON p.id_korisnika = prodavac.id_korisnika
    WHERE ${whereClause}
    ORDER BY t.vrijeme_transakcije DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM transakcija t
    JOIN predmet p ON t.id_predmeta = p.id_predmeta
    JOIN korisnik kupac ON t.id_korisnika = kupac.id_korisnika
    JOIN korisnik prodavac ON p.id_korisnika = prodavac.id_korisnika
    WHERE ${whereClause}
  `;

  connection.query(countQuery, params, (error, countResults) => {
    if (error) {
      console.error('Greška kod brojanja transakcija:', error);
      return res.status(500).json({ message: 'Greška kod brojanja transakcija', error });
    }

    const total = countResults[0]?.total || 0;
    connection.query(query, [...params, limit, offset], (error, results) => {
      if (error) {
        console.error('Greška kod dohvaćanja transakcija:', error);
        return res.status(500).json({ message: 'Greška kod dohvaćanja transakcija', error });
      }

      console.log('Transactions results:', results.length, 'rows');
      res.json({ rows: results || [], total, page, limit, totalPages: Math.ceil(total / limit) });
    });
  });
});

// GET /api/admin/stats - Admin statistika
app.get("/api/admin/stats", authJwt.verifyTokenAdmin, (req, res) => {
  console.log('Admin stats requested by user:', req.userId);

  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM predmet) AS totalAuctions,
      (SELECT COUNT(*) FROM predmet WHERE vrijeme_zavrsetka > NOW()) AS activeAuctions,
      (SELECT COALESCE(SUM(iznos_transakcije), 0) FROM transakcija) AS totalRevenue,
      (SELECT COALESCE(SUM(iznos_transakcije), 0) FROM transakcija WHERE MONTH(vrijeme_transakcije) = MONTH(CURRENT_DATE()) AND YEAR(vrijeme_transakcije) = YEAR(CURRENT_DATE())) AS monthlyRevenue,
      (SELECT COUNT(*) FROM transakcija) AS totalTransactions,
      (SELECT COUNT(*) FROM transakcija WHERE vrijeme_transakcije >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS last30DaysTransactions,
      (SELECT COUNT(*) FROM transakcija) AS successfulTransactions
  `;

  connection.query(statsQuery, (error, results) => {
    if (error) {
      console.error('Greška kod dohvaćanja statistike:', error);
      return res.status(500).json({ message: 'Greška kod dohvaćanja statistike', error });
    }

    const row = results[0] || {};
    const totalTransactions = Number(row.totalTransactions) || 0;
    const successfulTransactions = Number(row.successfulTransactions) || 0;
    const successRate = totalTransactions > 0 ? Number(((successfulTransactions / totalTransactions) * 100).toFixed(1)) : 0;

    console.log('Stats row:', row);

    res.json({
      totalAuctions: Number(row.totalAuctions) || 0,
      activeAuctions: Number(row.activeAuctions) || 0,
      totalRevenue: Number(row.totalRevenue) || 0,
      monthlyRevenue: Number(row.monthlyRevenue) || 0,
      totalTransactions: Number(row.totalTransactions) || 0,
      last30DaysTransactions: Number(row.last30DaysTransactions) || 0,
      successfulTransactions: Number(row.successfulTransactions) || 0,
      successRate,
    });
  });
});

app.listen(port, () => {
  console.log("Server running at port: " + port);
});
app.post("/regaKorisnika", function (request, response) {
  const data = request.body;
  const saltRounds = 10;

  bcrypt.hash(data.lozinka, saltRounds, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return response.status(500).json({ error: true, message: "Error hashing password." });
    }

    const korisnik = [[data.ime, data.prezime, data.email, hash, data.adresa, "user"]];

    connection.query("INSERT INTO korisnik (ime_korisnika, prezime_korisnika, email_korisnika, lozinka_korisnika, adresa_korisnika, uloga) VALUES ?", [korisnik], function (error, results, fields) {
      if (error) {
        console.error("Registracija korisnika neuspješna.", error);
        return response.status(500).json({ error: true, message: "Registracija korisnika neuspješna." });
      }
      console.log("data", data);
      return response.send({ error: false, data: results, message: "Uspješna registracija!" });
    });
  });
});

app.post("/login", function (req, res) {
  const data = req.body;
  const email = data.email;
  const password = data.password;

  connection.query("SELECT * FROM korisnik WHERE email_korisnika = ?", [email], function (err, result) {
    if (err) {
      res.status(500).json({ success: false, message: "Internal server error" });
    } else if (result.length > 0) {
      // Compare passwords
      bcrypt.compare(password, result[0].lozinka_korisnika, function (err, bcryptRes) {
        if (bcryptRes) {
          // Generate JWT token
          const token = jwt.sign({ id: result[0].id_korisnika, prezime: result[0].prezime_korisnika, ime: result[0].ime_korisnika, uloga: result[0].uloga }, config.secret);
          res.status(200).json({ success: true, message: "Login successful", token: token });
        } else {
          res.status(401).json({ success: false, message: "Invalid email or password " });
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });
});

app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.status(200).json({ message: "Logout successful" });
    }
  });
});

app.get("/api/korisnikinfo/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const id = req.params.id;

  connection.query("SELECT ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, lozinka_korisnika FROM korisnik WHERE id_korisnika = ?", [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/korisnikinfo1/:id", (req, res) => {
  const id = req.params.id;

  connection.query("SELECT ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, lozinka_korisnika FROM korisnik WHERE id_korisnika = ?", [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.put("/api/izmjenakorisnika/", authJwt.verifyTokenAdmin, (req, res) => {
  korisnik = req.body;

  if (korisnik.lozinka_izmijenjena) {
    //ako nova lozinka JE unesena
    const saltRounds = 10;
    bcrypt.hash(korisnik.lozinka_korisnika, saltRounds, function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return response.status(500).json({ error: true, message: "Error hashing password." });
      }
      connection.query("UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?", [korisnik.ime_korisnika, korisnik.prezime_korisnika, korisnik.email_korisnika, hash, korisnik.adresa_korisnika, korisnik.id_korisnika], (error, results) => {
        if (error) throw error;
        res.send(results);
      });
    });
  } else {
    //ako lozinka nije unesena
    connection.query("UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?", [korisnik.ime_korisnika, korisnik.prezime_korisnika, korisnik.email_korisnika, korisnik.lozinka_korisnika, korisnik.adresa_korisnika, korisnik.id_korisnika], (error, results) => {
      if (error) throw error;
      res.send(results);
    });
  }
});

app.put("/api/izmjenakorisnika1/", (req, res) => {
  const korisnik = req.body;

  if (korisnik.lozinka_izmijenjena == 1) {
    const saltRounds = 10;
    bcrypt.hash(korisnik.lozinka_korisnika, saltRounds, function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ error: true, message: "Error hashing password." });
      }
      connection.query("UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?", [korisnik.ime_korisnika, korisnik.prezime_korisnika, korisnik.email_korisnika, hash, korisnik.adresa_korisnika, korisnik.id_korisnika], (error, results) => {
        if (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({ error: true, message: "Error updating user." });
        }
        res.json({ success: true, message: "User updated successfully." });
      });
    });
  } else {
    // Handle the case where the password is not changed
    // Assuming you also want to update other fields even if the password is not changed
    connection.query("UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?", [korisnik.ime_korisnika, korisnik.prezime_korisnika, korisnik.email_korisnika, korisnik.adresa_korisnika, korisnik.id_korisnika], (error, results) => {
      if (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: true, message: "Error updating user." });
      }
      res.json({ success: true, message: "User updated successfully." });
    });
  }
});

app.put("/api/brisanjekorisnika/:idKorisnika", authJwt.verifyTokenAdmin, (req, res) => {
  let rnd_lozinka = require("crypto").randomBytes(64).toString("hex");
  connection.query("UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?", ["obrisani", "korisnik", rnd_lozinka, rnd_lozinka, "obrisani korisnik", req.params.idKorisnika], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/api/kategorijainfo/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const id = req.params.id;

  connection.query("SELECT naziv_kategorije FROM kategorija WHERE id_kategorije = ?", [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.put("/api/izmjenaKategorije", authJwt.verifyTokenAdmin, (req, res) => {
  kategorija = req.body;
  connection.query("UPDATE kategorija SET naziv_kategorije = ? WHERE id_kategorije= ?", [kategorija.naziv_kategorije, kategorija.id_kategorije], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.post("/api/dodajKategoriju", authJwt.verifyTokenAdmin, (req, res) => {
  const data = req.body;
  const naziv_kategorije = data.naziv_kategorije;

  connection.query("INSERT INTO kategorija (naziv_kategorije) VALUES (?)", [naziv_kategorije], (error, results) => {
    if (error) {
      console.error("Neuspjeh unosa nove kategorije.", error);
      return res.status(500).json({ error: true, message: "Neuspjeh unosa nove kategorije." });
    }
    return res.send({ error: false, data: results, message: "Kategorija unešena uspješno." });
  });
});

app.post("/api/kategorije", authJwt.verifyTokenAdmin, (req, res) => {
  const { naziv_kategorije } = req.body;

  if (!naziv_kategorije || !naziv_kategorije.trim()) {
    return res.status(400).json({ error: true, message: "Naziv kategorije je obavezan." });
  }

  connection.query(
    "INSERT INTO kategorija (naziv_kategorije) VALUES (?)",
    [naziv_kategorije.trim()],
    (error, results) => {
      if (error) {
        console.error("Neuspjeh unosa nove kategorije.", error);
        return res.status(500).json({ error: true, message: "Neuspjeh unosa nove kategorije." });
      }
      return res.send({ error: false, data: results, message: "Kategorija unesena uspješno." });
    }
  );
});

app.put("/api/kategorije/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const idKat = req.params.id;
  const { naziv_kategorije } = req.body;

  if (!naziv_kategorije || !naziv_kategorije.trim()) {
    return res.status(400).json({ error: true, message: "Naziv kategorije je obavezan." });
  }

  connection.query(
    "UPDATE kategorija SET naziv_kategorije = ? WHERE id_kategorije = ?",
    [naziv_kategorije.trim(), idKat],
    (error, results) => {
      if (error) {
        console.error("Neuspješna izmjena kategorije.", error);
        return res.status(500).json({ error: true, message: "Neuspješna izmjena kategorije." });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: true, message: "Kategorija nije pronađena." });
      }
      return res.send({ error: false, data: results, message: "Kategorija ažurirana uspješno." });
    }
  );
});

app.delete("/api/deleteKategoriju/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const idKat = req.params.id;

  connection.query(
    "SELECT COUNT(*) AS count FROM predmet WHERE id_kategorije = ?",
    [idKat],
    (countError, countResults) => {
      if (countError) {
        console.error("Greška kod provjere predmeta za kategoriju:", countError);
        return res.status(500).json({ error: true, message: "Greška pri provjeri kategorije." });
      }

      const count = countResults[0]?.count || 0;
      if (count > 0) {
        return res.status(400).json({
          error: true,
          message: "Kategorija sadrži predmete. Obrišite prvo predmete ili ih premjestite.",
        });
      }

      connection.query("DELETE FROM kategorija WHERE id_kategorije = ?", [idKat], (error, results) => {
        if (error) {
          console.error("Neuspješno brisanje kategorije:", error);
          return res.status(500).json({ error: true, message: "Neuspješno brisanje kategorije." });
        }
        console.log("Brisanje uspješno.");
        return res.send({ error: false, message: "Kategorija uspješno obrisana." });
      });
    }
  );
});

app.get("/api/vlastiti-predmeti/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    `SELECT
    p.id_predmeta,
    p.opis_predmeta,
    p.naziv_predmeta,
    p.pocetna_cijena,
    p.vrijeme_pocetka,
    p.vrijeme_zavrsetka,
    CONCAT(
        FLOOR(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) / (24 * 3600)),
        ' dana, ',
        TIME_FORMAT(
            SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka) % (24 * 3600)),
            '%H:%i:%s'
        )
    ) AS preostalo_vrijeme,
    (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
    COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
FROM predmet p
LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
WHERE p.id_korisnika = ?
GROUP BY p.id_predmeta
ORDER BY preostalo_vrijeme DESC;`,
    [req.params.id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    }
  );
});

app.delete("/api/brisanjePredmeta/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query("DELETE FROM predmet WHERE id_predmeta = ?", [req.params.id], (error, results) => {
    if (error) {
      console.error("Neuspješno brisanje.");
      return res.status(500).json({ error: true, message: "Neuspješno brisanje " + error });
    }
    console.log("Brisanje uspješno.");
    return res.send({ error: false, message: "." });
  });
});

app.put("/api/izmjenaPredmeta/:id", authJwt.verifyTokenUser, (req, res) => {
  const izmjena = req.body;

  izmjena.vrijeme_pocetka = new Date(izmjena.vrijeme_pocetka).toISOString().replace("T", " ").replace("Z", "");
  izmjena.vrijeme_zavrsetka = new Date(izmjena.vrijeme_zavrsetka).toISOString().replace("T", " ").replace("Z", "");

  connection.query("UPDATE predmet SET naziv_predmeta = ?, opis_predmeta = ?, pocetna_cijena = ?, vrijeme_pocetka = ?, vrijeme_zavrsetka = ?, id_kategorije = ? WHERE id_predmeta = ?", [izmjena.naziv_predmeta, izmjena.opis_predmeta, izmjena.pocetna_cijena, izmjena.vrijeme_pocetka, izmjena.vrijeme_zavrsetka, izmjena.id_kategorije, req.params.id], (error, results) => {
    if (error) throw error;
    if (results.length > 0 && results[0].slike) {
      results[0].slike = results[0].slike.split("|||");
    }
    res.send(results);
  });
});

app.get("/api/get-predmet2/:id", (req, res) => {
  //razlika izmedu ovog i obicnog get-predmet je što ovaj lovi i id kategorije i id slika.
  const { id } = req.params;

  connection.query(
    `SELECT p.naziv_predmeta, p.id_predmeta, p.id_kategorije, p.pocetna_cijena, p.vrijeme_pocetka, p.vrijeme_zavrsetka, p.opis_predmeta, COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS vrijednost_ponude, GROUP_CONCAT(DISTINCT s.id_slike SEPARATOR '|||') AS id_slika, GROUP_CONCAT(DISTINCT s.slika SEPARATOR '|||') AS slike
    FROM predmet p 
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta 
    LEFT JOIN slika s ON p.id_predmeta = s.id_predmeta 
    WHERE p.id_predmeta = ? 
    GROUP BY p.id_predmeta`,
    [id],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0 && results[0].slike) {
        results[0].slike = results[0].slike.split("|||");
        results[0].id_slika = results[0].id_slika.split("|||");
      }
      res.send(results);
    }
  );
});

app.delete("/api/brisanjeSlike/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query("DELETE FROM slika WHERE id_slike = ?", [req.params.id], (error, results) => {
    if (error) {
      console.error("Neuspješno brisanje.");
      return res.status(500).json({ error: true, message: "Neuspješno brisanje " + error });
    }
    return res.send({ error: false, message: "." });
  });
});

app.post("/api/dodavanjeSlika", upload.none(), authJwt.verifyTokenUser, function (request, response) {
  const data = request.body;
  const id_predmeta = data.id_predmeta;
  Object.keys(data).forEach((key) => {
    if (key.startsWith("file")) {
      const base64String = data[key];
      connection.query("INSERT INTO slika (slika, id_predmeta) VALUES (?, ?)", [base64String, id_predmeta], function (error) {
        if (error) throw error;
      });
    }
  });
  return response.send({ error: false, message: "Slike su uspješno dodane." });
});