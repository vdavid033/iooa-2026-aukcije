const express = require("express");
const http = require("http");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Server } = require("socket.io");
const { join } = require("path");
const path = require("path");
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");
const config = require("../aukcije-server/auth.config.js");
const authJwt = require("../aukcije-server/authJwt.js");
const {
  calculateAutoBidWinner,
  normalizeMoney,
  BID_INCREMENT,
} = require("./autoBidCalculator");
const {
  REALTIME_ROOMS,
  REALTIME_CLIENT_EVENTS,
  emitCijenaAzurirana,
} = require("./realtimeContract");

const app = express();
const port = 3000;
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:9000",
  "http://127.0.0.1:9000",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

function getSocketPredmetId(payload) {
  const id_predmeta =
    payload && typeof payload === "object" ? payload.id_predmeta : payload;

  if (id_predmeta === undefined || id_predmeta === null || id_predmeta === "") {
    return null;
  }

  const normalizedId = Number(id_predmeta);

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    return null;
  }

  return normalizedId;
}

io.on("connection", (socket) => {
  socket.on(REALTIME_CLIENT_EVENTS.joinPredmet, (payload) => {
    const id_predmeta = getSocketPredmetId(payload);
    if (!id_predmeta) return;

    socket.join(REALTIME_ROOMS.predmet(id_predmeta));
  });

  socket.on(REALTIME_CLIENT_EVENTS.leavePredmet, (payload) => {
    const id_predmeta = getSocketPredmetId(payload);
    if (!id_predmeta) return;

    socket.leave(REALTIME_ROOMS.predmet(id_predmeta));
  });
});
// Parser za JSON podatke
app.use(bodyParser.json());

// Parser za podatke iz formi
app.use(bodyParser.urlencoded({ extended: true }));

// Postavke direktorija za statiÄŤke datoteke
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "student.veleri.hr",
  user: "iooa-aukcije",
  password: "11",
  database: "iooa-aukcije1",
});

app.use(express.urlencoded({ extended: true }));

connection.connect();

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(results);
    });
  });
}

function beginTransactionAsync() {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function commitAsync() {
  return new Promise((resolve, reject) => {
    connection.commit((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function rollbackAsync() {
  return new Promise((resolve) => {
    connection.rollback(() => resolve());
  });
}

async function getCurrentPrice(id_predmeta) {
  const rows = await queryAsync(
    `SELECT
       p.pocetna_cijena,
       COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena
     FROM predmet p
     LEFT JOIN ponuda po ON po.id_predmeta = p.id_predmeta
     WHERE p.id_predmeta = ?
     GROUP BY p.id_predmeta, p.pocetna_cijena`,
    [id_predmeta],
  );

  if (rows.length === 0) {
    return null;
  }

  return normalizeMoney(rows[0].trenutna_cijena);
}

async function getPonudaRealtimeData(id_ponude) {
  const rows = await queryAsync(
    `SELECT id_ponude, id_predmeta, id_korisnika,
            DATE_FORMAT(vrijeme_ponude, "%Y-%m-%d %H:%i:%s") AS vrijeme_ponude
     FROM ponuda
     WHERE id_ponude = ?`,
    [id_ponude],
  );

  return rows[0] || null;
}

async function createNotification(id_korisnika, message) {
  await queryAsync(
    `INSERT INTO obavijest (id_korisnika, poruka, procitano, vrijeme_obavijesti)
     VALUES (?, ?, 0, NOW())`,
    [id_korisnika, message],
  );
}

async function validateAutoBidInput(
  id_korisnika,
  id_predmeta,
  maksimalni_iznos,
) {
  const normalizedMaxAmount = normalizeMoney(maksimalni_iznos);

  if (Number.isNaN(normalizedMaxAmount) || normalizedMaxAmount <= 0) {
    const invalidAmountError = new Error(
      "Maksimalni iznos auto-bida nije ispravan.",
    );
    invalidAmountError.status = 400;
    throw invalidAmountError;
  }

  const predmetRows = await queryAsync(
    `SELECT id_predmeta, id_korisnika, pocetna_cijena
     FROM predmet
     WHERE id_predmeta = ?`,
    [id_predmeta],
  );

  if (predmetRows.length === 0) {
    const notFoundError = new Error("Predmet nije pronađen.");
    notFoundError.status = 404;
    throw notFoundError;
  }

  if (Number(predmetRows[0].id_korisnika) === Number(id_korisnika)) {
    const ownerError = new Error(
      "Vlasnik predmeta ne može postaviti auto-bid na vlastitu aukciju.",
    );
    ownerError.status = 400;
    throw ownerError;
  }

  const currentPrice = await getCurrentPrice(id_predmeta);

  if (currentPrice === null) {
    const priceError = new Error("Trenutna cijena nije dostupna.");
    priceError.status = 400;
    throw priceError;
  }

  if (normalizedMaxAmount <= currentPrice) {
    const validationError = new Error(
      `Maksimalni auto-bid mora biti veći od trenutne cijene (${currentPrice}$).`,
    );
    validationError.status = 400;
    throw validationError;
  }

  return {
    predmet: predmetRows[0],
    currentPrice,
    normalizedMaxAmount,
  };
}

// Returns all active, non-limit-reached auto-bids for an item, excluding the user
// who triggered the current bid cycle.
async function getActiveAutoBidsForItem(id_predmeta, excludedUserId) {
  return queryAsync(
    `SELECT id_auto_bid, id_korisnika, id_predmeta, maksimalni_iznos, aktivan, limit_dosegnut, vrijeme_postavljanja
     FROM auto_bid
     WHERE id_predmeta = ?
       AND id_korisnika <> ?
       AND aktivan = 1
       AND COALESCE(limit_dosegnut, 0) = 0
     ORDER BY maksimalni_iznos DESC, vrijeme_postavljanja ASC`,
    [id_predmeta, excludedUserId],
  );
}

// Marks a single auto-bid as limit-reached and persists a notification.
async function markAutoBidLimitReached(id_auto_bid, id_korisnika) {
  await queryAsync(
    `UPDATE auto_bid SET limit_dosegnut = 1 WHERE id_auto_bid = ?`,
    [id_auto_bid],
  );

  await createNotification(
    id_korisnika,
    "Vaš Auto-bid limit za aukciju je dosegnut.",
  );
}

// Handles the full multi-user auto-bid cycle after a manual (or auto) bid is placed.
//
// Algorithm (proxy-bidding):
//   1. Fetch all active auto-bids for the item, excluding the triggering user.
//   2. Any whose max <= currentBidAmount are already beaten — mark them immediately.
//   3. From the remaining competitive bids, pick a winner using calculateAutoBidWinner:
//        winner  = highest maksimalni_iznos (tie-break: earliest vrijeme_postavljanja)
//        winning bid = min(secondBest.max + increment, winner.max)
//   4. Insert the winning bid into ponuda.
//   5. Mark all non-winning auto-bids whose max <= winning bid as limit reached.
//   6. If the winning bid equals the winner's max, mark the winner as limit reached too.
async function processMultipleAutoBids(id_predmeta, currentBidAmount, triggeringUserId) {
  const normalizedCurrent = normalizeMoney(currentBidAmount);
  const allActiveBids = await getActiveAutoBidsForItem(id_predmeta, triggeringUserId);

  // Split: auto-bids already surpassed by the current bid vs still competitive.
  const beaten = allActiveBids.filter(
    (ab) => normalizeMoney(ab.maksimalni_iznos) <= normalizedCurrent,
  );
  const competitive = allActiveBids.filter(
    (ab) => normalizeMoney(ab.maksimalni_iznos) > normalizedCurrent,
  );

  for (const ab of beaten) {
    await markAutoBidLimitReached(ab.id_auto_bid, ab.id_korisnika);
  }

  if (competitive.length === 0) {
    return { triggered: false, autoBid: null };
  }

  const { winner, winningBid, losers } = calculateAutoBidWinner(
    competitive,
    normalizedCurrent,
  );

  if (!winner || winningBid === null) {
    return { triggered: false, autoBid: null };
  }

  const insertResult = await queryAsync(
    `INSERT INTO ponuda (vrijednost_ponude, vrijeme_ponude, id_korisnika, id_predmeta)
     VALUES (?, NOW(), ?, ?)`,
    [winningBid, winner.id_korisnika, id_predmeta],
  );

  for (const loser of losers) {
    await markAutoBidLimitReached(loser.id_auto_bid, loser.id_korisnika);
  }

  let winnerLimitReached = false;
  if (winningBid >= normalizeMoney(winner.maksimalni_iznos)) {
    winnerLimitReached = true;
    await markAutoBidLimitReached(winner.id_auto_bid, winner.id_korisnika);
  }

  return {
    triggered: true,
    autoBid: {
      id_ponude: insertResult.insertId,
      id_korisnika: winner.id_korisnika,
      id_predmeta,
      vrijednost_ponude: winningBid,
      limit_dosegnut: winnerLimitReached,
    },
  };
}

async function disableAutoBidForUser(id_predmeta, id_korisnika) {
  return queryAsync(
    `UPDATE auto_bid
     SET aktivan = 0
     WHERE id_predmeta = ? AND id_korisnika = ?`,
    [id_predmeta, id_korisnika],
  );
}

app.get("/api/korisnici", authJwt.verifyTokenAdmin, (req, res) => {
  connection.query(
    "SELECT id_korisnika, ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika FROM korisnik WHERE ime_korisnika != 'obrisani' AND prezime_korisnika != 'korisnik'",
    (error, results) => {
      if (error) throw error;

      res.send(results);
    },
  );
});

app.get(
  "/getUnosPredmeta",
  authJwt.verifyTokenUser,
  function (request, response) {
    connection.query(
      "SELECT * FROM korisnik",
      function (error, korisniciResults) {
        if (error) {
          console.error(
            "Error fetching korisnici for /getUnosPredmeta:",
            error,
          );
          return response.status(500).send({
            message: "Dogodila se greska pri dohvatu korisnika.",
          });
        }

        connection.query(
          "SELECT * FROM kategorija",
          function (error, kategorijeResults) {
            if (error) {
              console.error(
                "Error fetching kategorije for /getUnosPredmeta:",
                error,
              );
              return response.status(500).send({
                message: "Dogodila se greska pri dohvatu kategorija.",
              });
            }

            response.send({
              korisnici: korisniciResults,
              kategorije: kategorijeResults,
            });
          },
        );
      },
    );
  },
);

app.post(
  "/unosPredmeta",
  upload.none(),
  authJwt.verifyTokenUser,
  function (request, response) {
    const data = request.body;
    const predmet = [
      [
        data.naziv_predmeta,
        data.opis_predmeta,
        data.vrijeme_pocetka,
        data.vrijeme_zavrsetka,
        data.pocetna_cijena,
        data.id_korisnika,
        data.id_kategorije,
      ],
    ];

    connection.query(
      "INSERT INTO predmet (naziv_predmeta, opis_predmeta, vrijeme_pocetka, vrijeme_zavrsetka, pocetna_cijena, id_korisnika, id_kategorije) VALUES ?",
      [predmet],
      function (error, results) {
        if (error) throw error;
        const insertedPredmetId = results.insertId;

        connection.query(
          "INSERT IGNORE INTO lista_pracenja (id_korisnika, id_predmeta) VALUES (?, ?)",
          [data.id_korisnika, insertedPredmetId],
          () => {}
        );

        const keys = Object.keys(data).filter((key) => key.startsWith("file"));
        let completed = 0;

        if (keys.length === 0) {
          return response.send({
            error: false,
            message: "Predmet dodan bez slika.",
            insertedPredmetId: insertedPredmetId,
          });
        }

        keys.forEach((key) => {
          const base64String = data[key];
          connection.query(
            "INSERT INTO slika (slika, id_predmeta) VALUES (?, ?)",
            [base64String, insertedPredmetId],
            function (error) {
              if (error) throw error;
              completed++;
              if (completed === keys.length) {
                return response.send({
                  error: false,
                  message: "Predmet i slike su dodani.",
                  insertedPredmetId: insertedPredmetId,
                });
              }
            },
          );
        });
      },
    );
  },
);

app.get("/api/all-predmet", (req, res) => {
  const query = `
    SELECT
        p.id_predmeta,
        p.opis_predmeta,
        p.naziv_predmeta,
        p.naziv_predmeta_en,
        p.opis_en,
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

app.get("/api/get-predmet/:id", async (req, res) => {
  const { id } = req.params;

  connection.query(
    `SELECT p.naziv_predmeta, p.id_predmeta, p.id_korisnika AS id_prodavatelja, p.pocetna_cijena, p.vrijeme_pocetka, p.vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, p.vrijeme_pocetka, p.vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme, p.opis_predmeta, p.naziv_predmeta_en, p.opis_en, COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS vrijednost_ponude, GROUP_CONCAT(DISTINCT s.slika SEPARATOR '|||') AS slike
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
    },
  );
});

app.get("/api/recenzije-prodavatelja/:id", (req, res) => {
  const idProdavatelja = req.params.id;

  connection.query(
    `SELECT 
        p.naziv_predmeta,
        p.naziv_predmeta_en,
        op.ocjena,
        op.komentar,
        DATE_FORMAT(op.datum_ocjene, "%Y-%m-%d %H:%i:%s") AS datum_ocjene
      FROM ocjena_prodavatelja op
      JOIN transakcija t ON op.id_transakcije = t.id_transakcije
      JOIN predmet p ON t.id_predmeta = p.id_predmeta
      WHERE p.id_korisnika = ?
      ORDER BY op.datum_ocjene DESC`,
    [idProdavatelja],
    (error, recenzije) => {
      if (error) throw error;

      const brojRecenzija = recenzije.length;
      const prosjecnaOcjena =
        brojRecenzija > 0
          ? recenzije.reduce((sum, r) => sum + Number(r.ocjena), 0) /
            brojRecenzija
          : null;

      res.send({
        prosjecnaOcjena,
        brojRecenzija,
        recenzije,
      });
    },
  );
});

app.get(
  "/api/auto-bid/:id_predmeta",
  authJwt.verifyTokenUser,
  async (req, res) => {
    const { id_predmeta } = req.params;

    try {
      const autoBidRows = await queryAsync(
        `SELECT maksimalni_iznos, aktivan, limit_dosegnut
       FROM auto_bid
       WHERE id_predmeta = ? AND id_korisnika = ?
       ORDER BY vrijeme_postavljanja DESC, id_auto_bid DESC
       LIMIT 1`,
        [id_predmeta, req.userId],
      );

      if (autoBidRows.length === 0) {
        res.send(null);
        return;
      }

      res.send({
        maksimalni_iznos: normalizeMoney(autoBidRows[0].maksimalni_iznos),
        aktivan: autoBidRows[0].aktivan,
        limit_dosegnut: autoBidRows[0].limit_dosegnut,
      });
    } catch (error) {
      console.error("GreĹˇka pri dohvaÄ‡anju auto-bida:", error);
      res.status(500).send({ message: "GreĹˇka pri dohvaÄ‡anju auto-bida." });
    }
  },
);

app.post("/api/auto-bid", authJwt.verifyTokenUser, async (req, res) => {
  const { id_predmeta, maksimalni_iznos } = req.body;

  if (!id_predmeta || maksimalni_iznos === undefined) {
    res.status(400).send({
      message: "Potrebno je poslati ispravan predmet i maksimalni iznos.",
    });
    return;
  }

  try {
    const validation = await validateAutoBidInput(
      req.userId,
      id_predmeta,
      maksimalni_iznos,
    );

    const existingRows = await queryAsync(
      `SELECT id_auto_bid
       FROM auto_bid
       WHERE id_predmeta = ? AND id_korisnika = ?
       ORDER BY vrijeme_postavljanja DESC, id_auto_bid DESC`,
      [id_predmeta, req.userId],
    );

    if (existingRows.length > 0) {
      await queryAsync(
        `UPDATE auto_bid
         SET maksimalni_iznos = ?, aktivan = 1, limit_dosegnut = 0, vrijeme_postavljanja = NOW()
         WHERE id_auto_bid = ?`,
        [validation.normalizedMaxAmount, existingRows[0].id_auto_bid],
      );

      res.send({
        error: false,
        updated: true,
        message: "Auto-bid je ažuriran.",
      });
      return;
    }

    await queryAsync(
      `INSERT INTO auto_bid (
         id_korisnika,
         id_predmeta,
         maksimalni_iznos,
         aktivan,
         limit_dosegnut,
         vrijeme_postavljanja
       ) VALUES (?, ?, ?, 1, 0, NOW())`,
      [req.userId, id_predmeta, validation.normalizedMaxAmount],
    );

    res.send({
      error: false,
      created: true,
      message: "Auto-bid je uspješno kreiran.",
    });
  } catch (error) {
    console.error("GreĹˇka pri spremanju auto-bida:", error);
    res.status(error.status || 500).send({
      message: error.message || "GreĹˇka pri spremanju auto-bida.",
    });
  }
});

app.put("/api/auto-bid", authJwt.verifyTokenUser, async (req, res) => {
  const { id_predmeta, maksimalni_iznos } = req.body;

  if (!id_predmeta || maksimalni_iznos === undefined) {
    res.status(400).send({
      message: "Potrebno je poslati predmet i maksimalni iznos.",
    });
    return;
  }

  try {
    const validation = await validateAutoBidInput(
      req.userId,
      id_predmeta,
      maksimalni_iznos,
    );

    const existingRows = await queryAsync(
      `SELECT id_auto_bid
       FROM auto_bid
       WHERE id_predmeta = ? AND id_korisnika = ?
       ORDER BY vrijeme_postavljanja DESC, id_auto_bid DESC
       LIMIT 1`,
      [id_predmeta, req.userId],
    );

    if (existingRows.length === 0) {
      res.status(404).send({ message: "Auto-bid nije pronađen." });
      return;
    }

    await queryAsync(
      `UPDATE auto_bid
       SET maksimalni_iznos = ?, aktivan = 1, limit_dosegnut = 0, vrijeme_postavljanja = NOW()
       WHERE id_auto_bid = ?`,
      [validation.normalizedMaxAmount, existingRows[0].id_auto_bid],
    );

    res.send({
      error: false,
      message: "Auto-bid je ažuriran.",
    });
  } catch (error) {
    console.error("Greška pri ažuriranju auto-bida:", error);
    res.status(error.status || 500).send({
      message: error.message || "Greška pri ažuriranju auto-bida.",
    });
  }
});

app.put("/api/auto-bid/disable", authJwt.verifyTokenUser, async (req, res) => {
  const { id_predmeta } = req.body;

  if (!id_predmeta) {
    res.status(400).send({ message: "Potrebno je poslati id predmeta." });
    return;
  }

  try {
    const result = await disableAutoBidForUser(id_predmeta, req.userId);

    if (result.affectedRows === 0) {
      res.status(404).send({ message: "Auto-bid nije pronađen." });
      return;
    }

    res.send({
      error: false,
      message: "Auto-bid je onemogućen.",
    });
  } catch (error) {
    console.error("GreĹˇka pri gaĹˇenju auto-bida:", error);
    res.status(500).send({ message: "GreĹˇka pri gaĹˇenju auto-bida." });
  }
});

app.delete(
  "/api/auto-bid/:id_predmeta",
  authJwt.verifyTokenUser,
  async (req, res) => {
    try {
      const result = await disableAutoBidForUser(
        req.params.id_predmeta,
        req.userId,
      );

      if (result.affectedRows === 0) {
        res.status(404).send({ message: "Auto-bid nije pronađen." });
        return;
      }

      res.send({
        error: false,
        message: "Auto-bid je onemogućen.",
      });
    } catch (error) {
      console.error("Greška pri gašenju auto-bida:", error);
      res.status(500).send({ message: "Greška pri gašenju auto-bida." });
    }
  },
);

app.get("/api/get-kategorija-predmet/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    `
    SELECT
    p.id_predmeta,
    p.opis_predmeta,
    p.naziv_predmeta,
    p.naziv_predmeta_en,
    p.opis_en,
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
    },
  );
});

app.get("/api/all-kategorija", (req, res) => {
  const query = `
    SELECT 
      k.id_kategorije,
      k.naziv_kategorije,
      k.naziv_kategorije_en,
      k.slika,

      COUNT(p.id_predmeta) AS count

    FROM kategorija k

    LEFT JOIN predmet p 
      ON k.id_kategorije = p.id_kategorije
      AND p.vrijeme_zavrsetka > NOW()

    GROUP BY k.id_kategorije

    ORDER BY k.naziv_kategorije ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).send(error);
    }

    res.send(results);
  });
});

/* app.get("/api/get-predmet/:id", (req, res) => {
  const { id } = req.params;

  connection.query("SELECT id_predmeta, naziv_predmeta,pocetna_cijena, vrijeme_pocetka, vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme FROM predmet WHERE id_predmeta = ?", [id], (error, results) => {
    if (error) throw error;
    res.send(results);
  });
}); */

function getPonudeZaPredmet(id_predmeta) {
  return queryAsync(
    `SELECT
       po.id_ponude,
       po.vrijednost_ponude,
       DATE_FORMAT(po.vrijeme_ponude, "%Y-%m-%d %H:%i:%s") AS vrijeme_ponude,
       po.id_korisnika,
       k.ime_korisnika,
       k.prezime_korisnika
     FROM ponuda po
     JOIN korisnik k ON po.id_korisnika = k.id_korisnika
     WHERE po.id_predmeta = ?
     ORDER BY po.vrijeme_ponude ASC, po.id_ponude ASC`,
    [id_predmeta],
  );
}

async function sendPonudeZaPredmet(req, res) {
  const id_predmeta = req.params.id_predmeta || req.params.id;
  const normalizedId = Number(id_predmeta);

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    res.status(400).send({ message: "Id predmeta nije ispravan." });
    return;
  }

  try {
    const results = await getPonudeZaPredmet(normalizedId);
    res.send(results);
  } catch (error) {
    console.error("Greška pri dohvaćanju povijesti ponuda:", error);
    res.status(500).send({ message: "Greška pri dohvaćanju povijesti ponuda." });
  }
}

app.get("/api/predmeti/:id_predmeta/ponude", sendPonudeZaPredmet);
app.get("/api/get-ponuda/:id", sendPonudeZaPredmet);

function getRacuniOrderClause(sortBy, sortDir) {
  const direction = String(sortDir).toLowerCase() === "asc" ? "ASC" : "DESC";

  const allowedSorts = {
    datum: "t.vrijeme_transakcije",
    iznos: "t.iznos_transakcije",
  };

  const column = allowedSorts[sortBy] || allowedSorts.datum;

  return `${column} ${direction}, t.id_transakcije ${direction}`;
}

app.get("/api/racuni", authJwt.verifyTokenUser, (req, res) => {
  const { sortBy = "datum", sortDir = "desc" } = req.query;

  const sql = `
    SELECT
      t.id_transakcije,
      t.id_predmeta,
      t.iznos_transakcije,
      DATE_FORMAT(t.vrijeme_transakcije, "%Y-%m-%d %H:%i:%s") AS vrijeme_transakcije,
      p.naziv_predmeta
    FROM transakcija t
    JOIN predmet p ON p.id_predmeta = t.id_predmeta
    WHERE t.id_korisnika = ?
    ORDER BY ${getRacuniOrderClause(sortBy, sortDir)}
  `;

  connection.query(sql, [req.userId], (err, results) => {
    if (err) {
      console.error("Greška pri dohvaćanju računa:", err);
      return res.status(500).json({
        error: true,
        message: "Greška pri dohvaćanju računa.",
      });
    }

    return res.status(200).json(results);
  });
});

app.post(
  "/unostrenutnaponuda",
  authJwt.verifyTokenUser,

  async function (request, response) {
    const data = request.body;
    const id_predmeta = data.id_predmeta;
    const normalizedBidAmount = normalizeMoney(data.vrijednost_ponude);

    if (!id_predmeta || normalizedBidAmount === undefined) {
      return response.status(400).send({
        message: "Potrebno je poslati predmet i vrijednost ponude.",
      });
    }

    try {
      await beginTransactionAsync();

      const currentPrice = await getCurrentPrice(id_predmeta);

      if (normalizedBidAmount <= currentPrice) {
        await rollbackAsync();
        return response.status(400).send({
          message: `Ponuda mora biti veća od trenutne cijene (${currentPrice}$).`,
        });
      }

      const insertResult = await queryAsync(
        "INSERT INTO ponuda (vrijednost_ponude, vrijeme_ponude, id_korisnika, id_predmeta) VALUES (?, NOW(), ?, ?)",
        [normalizedBidAmount, request.userId, id_predmeta],
      );

      const autoBidResult = await processMultipleAutoBids(
        id_predmeta,
        normalizedBidAmount,
        request.userId,
      );

      const finalPrice = autoBidResult.triggered
        ? autoBidResult.autoBid.vrijednost_ponude
        : normalizedBidAmount;
      const finalBid = autoBidResult.triggered
        ? autoBidResult.autoBid
        : {
            id_ponude: insertResult.insertId,
            id_predmeta: Number(id_predmeta),
            id_korisnika: request.userId,
          };
      const realtimeBidData = await getPonudaRealtimeData(finalBid.id_ponude);
      const realtimePayload = {
        id_predmeta: Number(id_predmeta),
        trenutna_cijena: finalPrice,
        id_ponude: finalBid.id_ponude,
        id_korisnika: finalBid.id_korisnika,
        vrijeme_ponude: realtimeBidData?.vrijeme_ponude,
      };

      await disableAutoBidForUser(id_predmeta, request.userId);

      await commitAsync();

      emitCijenaAzurirana(io, realtimePayload);

      return response.send({
        error: false,
        data: {
          manualBid: {
            id_ponude: insertResult.insertId,
            id_predmeta: Number(id_predmeta),
            id_korisnika: request.userId,
            vrijednost_ponude: normalizedBidAmount,
          },
          autoBid: autoBidResult.autoBid,
        },
        autoBidTriggered: autoBidResult.triggered,
        currentPrice: finalPrice,
        message: "Ponuda je uspješno evidentirana.",
      });
    } catch (error) {
      await rollbackAsync();
      console.error("Greška pri unosu ponude:", error);
      return response.status(error.status || 500).send({
        message: error.message || "Greška pri unosu ponude.",
      });
    }
  },
);

app.get("/api/vlastita-ponuda-korisnik/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    `SELECT p.*, pr.*, s.*
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
    },
  );
});

app.post("/api/unos-slike", authJwt.verifyTokenUser, function (req, res) {
  const data = req.body;
  const slika = data.slika;

  connection.query(
    "INSERT INTO slika (slika) VALUES (?)",
    [slika],
    function (error, results, fields) {
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
    },
  );
});

app.get("/api/all-predmet-with-current-price", (req, res) => {
  connection.query(
    "SELECT p.id_predmeta, p.naziv_predmeta,  p.opis_predmeta, p.pocetna_cijena, p.vrijeme_pocetka, p.vrijeme_zavrsetka, TIME_FORMAT( SEC_TO_TIME(TIMESTAMPDIFF(SECOND, NOW(), p.vrijeme_zavrsetka)), '%H:%i:%s' ) AS preostalo_vrijeme, COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena FROM predmet p LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta WHERE p.vrijeme_zavrsetka > NOW() GROUP BY p.id_predmeta ORDER BY preostalo_vrijeme DESC",
    (error, results) => {
      if (error) throw error;

      res.send(results);
    },
  );
});

app.get("/api/get-predmet-trenutna-cijena/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT MAX(`vrijednost_ponude`) AS max_vrijednost_ponude FROM `ponuda` WHERE id_predmeta = ?",
    [id],
    (error, results) => {
      if (error) {
        return res.status(500).send({ error: "Database error" });
      }
      if (results && results.length > 0) {
        res.send({ max_vrijednost_ponude: results[0].max_vrijednost_ponude });
      } else {
        res
          .status(404)
          .send({ message: "No offers found for the given id_predmeta" });
      }
    },
  );
});

app.post("/api/ocjena-prodavatelja", authJwt.verifyTokenUser, (req, res) => {
  const data = req.body;

  connection.query(
    `INSERT INTO ocjena_prodavatelja
      (ocjena, komentar, id_transakcije)
     VALUES (?, ?, ?)`,
    [data.ocjena, data.komentar, data.id_transakcije],
    (error, results) => {
      if (error) {
        console.error("Greška pri spremanju ocjene prodavatelja:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: true,
            message: "Ova transakcija je već ocijenjena.",
          });
        }

        return res.status(500).json({
          error: true,
          message: "Ocjena nije spremljena.",
        });
      }

      res.json({
        error: false,
        message: "Ocjena je uspješno spremljena.",
        data: results,
      });
    },
  );
});

server.listen(port, () => {
  console.log("Server running at port: " + port);
});

app.post("/regaKorisnika", function (request, response) {
  const data = request.body;
  const saltRounds = 10;

  bcrypt.hash(data.lozinka, saltRounds, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return response
        .status(500)
        .json({ error: true, message: "Error hashing password." });
    }

    const korisnik = [
      [data.ime, data.prezime, data.email, hash, data.adresa, "user"],
    ];

    connection.query(
      "INSERT INTO korisnik (ime_korisnika, prezime_korisnika, email_korisnika, lozinka_korisnika, adresa_korisnika, uloga) VALUES ?",
      [korisnik],
      function (error, results, fields) {
        if (error) {
          console.error("Registracija korisnika neuspješna.", error);
          return response.status(500).json({
            error: true,
            message: "Registracija korisnika neuspješna.",
          });
        }
        console.log("data", data);
        return response.send({
          error: false,
          data: results,
          message: "Uspješna registracija!",
        });
      },
    );
  });
});

app.post("/login", function (req, res) {
  const data = req.body;
  const email = data.email;
  const password = data.password;

  connection.query(
    "SELECT * FROM korisnik WHERE email_korisnika = ?",
    [email],
    function (err, result) {
      if (err) {
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else if (result.length > 0) {
        // Compare passwords
        bcrypt.compare(
          password,
          result[0].lozinka_korisnika,
          function (err, bcryptRes) {
            if (bcryptRes) {
              // Generate JWT token
              const token = jwt.sign(
                {
                  id: result[0].id_korisnika,
                  prezime: result[0].prezime_korisnika,
                  ime: result[0].ime_korisnika,
                  uloga: result[0].uloga,
                },
                config.secret,
              );
              res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
              });
            } else {
              res.status(401).json({
                success: false,
                message: "Invalid email or password ",
              });
            }
          },
        );
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
    },
  );
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

  connection.query(
    "SELECT ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, lozinka_korisnika FROM korisnik WHERE id_korisnika = ?",
    [id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    },
  );
});

app.get("/api/korisnikinfo1/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT ime_korisnika, prezime_korisnika, email_korisnika, adresa_korisnika, lozinka_korisnika FROM korisnik WHERE id_korisnika = ?",
    [id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    },
  );
});

app.put("/api/izmjenakorisnika/", authJwt.verifyTokenAdmin, (req, res) => {
  korisnik = req.body;

  if (korisnik.lozinka_izmijenjena) {
    //ako nova lozinka JE unesena
    const saltRounds = 10;
    bcrypt.hash(korisnik.lozinka_korisnika, saltRounds, function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return response
          .status(500)
          .json({ error: true, message: "Error hashing password." });
      }
      connection.query(
        "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?",
        [
          korisnik.ime_korisnika,
          korisnik.prezime_korisnika,
          korisnik.email_korisnika,
          hash,
          korisnik.adresa_korisnika,
          korisnik.id_korisnika,
        ],
        (error, results) => {
          if (error) throw error;
          res.send(results);
        },
      );
    });
  } else {
    //ako lozinka nije unesena
    connection.query(
      "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?",
      [
        korisnik.ime_korisnika,
        korisnik.prezime_korisnika,
        korisnik.email_korisnika,
        korisnik.lozinka_korisnika,
        korisnik.adresa_korisnika,
        korisnik.id_korisnika,
      ],
      (error, results) => {
        if (error) throw error;
        res.send(results);
      },
    );
  }
});

app.put("/api/izmjenakorisnika1/", (req, res) => {
  const korisnik = req.body;

  if (korisnik.lozinka_izmijenjena == 1) {
    const saltRounds = 10;
    bcrypt.hash(korisnik.lozinka_korisnika, saltRounds, function (err, hash) {
      if (err) {
        console.error("Error hashing password:", err);
        return res
          .status(500)
          .json({ error: true, message: "Error hashing password." });
      }
      connection.query(
        "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?",
        [
          korisnik.ime_korisnika,
          korisnik.prezime_korisnika,
          korisnik.email_korisnika,
          hash,
          korisnik.adresa_korisnika,
          korisnik.id_korisnika,
        ],
        (error, results) => {
          if (error) {
            console.error("Error updating user:", error);
            return res
              .status(500)
              .json({ error: true, message: "Error updating user." });
          }
          res.json({ success: true, message: "User updated successfully." });
        },
      );
    });
  } else {
    // Handle the case where the password is not changed
    // Assuming you also want to update other fields even if the password is not changed
    connection.query(
      "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?",
      [
        korisnik.ime_korisnika,
        korisnik.prezime_korisnika,
        korisnik.email_korisnika,
        korisnik.adresa_korisnika,
        korisnik.id_korisnika,
      ],
      (error, results) => {
        if (error) {
          console.error("Error updating user:", error);
          return res
            .status(500)
            .json({ error: true, message: "Error updating user." });
        }
        res.json({ success: true, message: "User updated successfully." });
      },
    );
  }
});

app.put(
  "/api/brisanjekorisnika/:idKorisnika",
  authJwt.verifyTokenAdmin,
  (req, res) => {
    let rnd_lozinka = require("crypto").randomBytes(64).toString("hex");
    connection.query(
      "UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, email_korisnika = ?, lozinka_korisnika = ?, adresa_korisnika = ? WHERE id_korisnika = ?",
      [
        "obrisani",
        "korisnik",
        rnd_lozinka,
        rnd_lozinka,
        "obrisani korisnik",
        req.params.idKorisnika,
      ],
      (error, results) => {
        if (error) throw error;
        res.send(results);
      },
    );
  },
);

app.get("/api/kategorijainfo/:id", authJwt.verifyTokenAdmin, (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT naziv_kategorije FROM kategorija WHERE id_kategorije = ?",
    [id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    },
  );
});

app.put("/api/izmjenaKategorije", authJwt.verifyTokenAdmin, (req, res) => {
  kategorija = req.body;
  connection.query(
    "UPDATE kategorija SET naziv_kategorije = ? WHERE id_kategorije= ?",
    [kategorija.naziv_kategorije, kategorija.id_kategorije],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    },
  );
});

app.post("/api/dodajKategoriju", authJwt.verifyTokenAdmin, (req, res) => {
  const data = req.body;
  const naziv_kategorije = data.naziv_kategorije;

  connection.query(
    "INSERT INTO kategorija (naziv_kategorije) VALUES (?)",
    [naziv_kategorije],
    (error, results) => {
      if (error) {
        console.error("Neuspjeh unosa nove kategorije.", error);
        return res
          .status(500)
          .json({ error: true, message: "Neuspjeh unosa nove kategorije." });
      }
      //console.log("data", data);
      return res.send({
        error: false,
        data: results,
        message: "Kategorija unešena uspješno.",
      });
    },
  );
});

app.delete(
  "/api/deleteKategoriju/:id",
  authJwt.verifyTokenAdmin,
  (req, res) => {
    const idKat = req.params.id;

    connection.query(
      "DELETE FROM kategorija WHERE id_kategorije = (?)",
      [idKat],
      (error, results) => {
        if (error) {
          console.error("Neuspješno brisanje.");
          return res
            .status(500)
            .json({ error: true, message: "Neuspješno brisanje " + idKat });
        }
        console.log("Brisanje uspješno.");
        return res.send({
          error: false,
          message: "Kategorija uspješno obrisana.",
        });
      },
    );
  },
);

app.get("/api/vlastiti-predmeti/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    `SELECT
    p.id_predmeta,
    p.opis_predmeta,
    p.naziv_predmeta,
    p.naziv_predmeta_en,
    p.opis_en,
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
    },
  );
});

app.get("/api/osvojeni-predmeti/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    `SELECT
    op.id_predmeta,
    t.id_transakcije,
    p.id_korisnika AS id_prodavatelja,
    CASE 
      WHEN ocj.id_ocjene IS NULL THEN 0
      ELSE 1
    END AS je_ocijenjeno,
    op.naziv_predmeta,
    p.naziv_predmeta_en,
    p.opis_predmeta,
    p.opis_en,
    (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika,
    COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS konacna_cijena
FROM osvojeni_predmeti op
JOIN predmet p ON op.id_predmeta = p.id_predmeta
LEFT JOIN transakcija t ON p.id_predmeta = t.id_predmeta
LEFT JOIN ocjena_prodavatelja ocj ON t.id_transakcije = ocj.id_transakcije
LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
WHERE op.id_korisnika = ?
GROUP BY op.id_predmeta, t.id_transakcije, p.id_korisnika, ocj.id_ocjene
ORDER BY op.id_predmeta DESC;`,
    [req.params.id],
    (error, results) => {
      if (error) throw error;
      res.send(results);
    },
  );
});

app.delete("/api/brisanjePredmeta/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    "DELETE FROM predmet WHERE id_predmeta = ?",
    [req.params.id],
    (error, results) => {
      if (error) {
        console.error("Neuspješno brisanje.");
        return res
          .status(500)
          .json({ error: true, message: "Neuspješno brisanje " + error });
      }
      console.log("Brisanje uspješno.");
      return res.send({ error: false, message: "." });
    },
  );
});

app.put("/api/izmjenaPredmeta/:id", authJwt.verifyTokenUser, (req, res) => {
  const izmjena = req.body;

  izmjena.vrijeme_pocetka = new Date(izmjena.vrijeme_pocetka)
    .toISOString()
    .replace("T", " ")
    .replace("Z", "");
  izmjena.vrijeme_zavrsetka = new Date(izmjena.vrijeme_zavrsetka)
    .toISOString()
    .replace("T", " ")
    .replace("Z", "");

  connection.query(
    "UPDATE predmet SET naziv_predmeta = ?, opis_predmeta = ?, pocetna_cijena = ?, vrijeme_pocetka = ?, vrijeme_zavrsetka = ?, id_kategorije = ? WHERE id_predmeta = ?",
    [
      izmjena.naziv_predmeta,
      izmjena.opis_predmeta,
      izmjena.pocetna_cijena,
      izmjena.vrijeme_pocetka,
      izmjena.vrijeme_zavrsetka,
      izmjena.id_kategorije,
      req.params.id,
    ],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0 && results[0].slike) {
        results[0].slike = results[0].slike.split("|||");
      }
      res.send(results);
    },
  );
});

app.get("/api/get-predmet2/:id", (req, res) => {
  //razlika izmedu ovog i obicnog get-predmet je Ĺˇto ovaj lovi i id kategorije i id slika.
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
    },
  );
});

app.delete("/api/brisanjeSlike/:id", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    "DELETE FROM slika WHERE id_slike = ?",
    [req.params.id],
    (error, results) => {
      if (error) {
        console.error("Neuspješno brisanje.");
        return res
          .status(500)
          .json({ error: true, message: "Neuspješno brisanje " + error });
      }
      return res.send({ error: false, message: "." });
    },
  );
});

app.post(
  "/api/dodavanjeSlika",
  upload.none(),
  authJwt.verifyTokenUser,
  function (request, response) {
    const data = request.body;
    const id_predmeta = data.id_predmeta;
    Object.keys(data).forEach((key) => {
      if (key.startsWith("file")) {
        const base64String = data[key];
        connection.query(
          "INSERT INTO slika (slika, id_predmeta) VALUES (?, ?)",
          [base64String, id_predmeta],
          function (error) {
            if (error) throw error;
          },
        );
      }
    });
    return response.send({
      error: false,
      message: "Slike su uspjeĹˇno dodane.",
    });
  },
);

// ── FZ-3.2: Watchlist endpointi ─────────────────────────────────────────────

// GET /api/watchlist/:korisnikId  — dohvati listu praćenja korisnika
app.get("/api/watchlist/:korisnikId", authJwt.verifyTokenUser, (req, res) => {
  const { korisnikId } = req.params;

  const query = `
    SELECT
      lp.id_lista,
      lp.datum_dodavanja,
      p.id_predmeta,
      p.naziv_predmeta,
      p.opis_predmeta,
      p.pocetna_cijena,
      p.vrijeme_pocetka,
      p.vrijeme_zavrsetka,
      COALESCE(MAX(po.vrijednost_ponude), p.pocetna_cijena) AS trenutna_cijena,
      (SELECT slika FROM slika WHERE id_predmeta = p.id_predmeta LIMIT 1) AS slika
    FROM lista_pracenja lp
    JOIN predmet p ON lp.id_predmeta = p.id_predmeta
    LEFT JOIN ponuda po ON p.id_predmeta = po.id_predmeta
    WHERE lp.id_korisnika = ?
    GROUP BY lp.id_lista, p.id_predmeta
    ORDER BY lp.datum_dodavanja DESC
  `;

  connection.query(query, [korisnikId], (error, results) => {
    if (error) return res.status(500).json({ error: true, message: "Greška pri dohvatu liste praćenja." });
    res.json(results);
  });
});

// POST /api/watchlist  — dodaj aukciju na listu praćenja
// Body: { id_predmeta }
app.post("/api/watchlist", authJwt.verifyTokenUser, (req, res) => {
  const { id_predmeta } = req.body;
  const id_korisnika = req.userId;

  if (!id_predmeta) {
    return res.status(400).json({ error: true, message: "id_predmeta je obavezan." });
  }

  connection.query(
    "INSERT INTO lista_pracenja (id_korisnika, id_predmeta) VALUES (?, ?)",
    [id_korisnika, id_predmeta],
    (error) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: true, message: "Aukcija je već na listi praćenja." });
        }
        return res.status(500).json({ error: true, message: "Greška pri dodavanju na listu praćenja." });
      }
      res.status(201).json({ error: false, message: "Aukcija dodana na listu praćenja." });
    }
  );
});

// DELETE /api/watchlist/:predmetId  — ukloni aukciju s liste praćenja
app.delete("/api/watchlist/:predmetId", authJwt.verifyTokenUser, (req, res) => {
  const id_predmeta = req.params.predmetId;
  const id_korisnika = req.userId;

  connection.query(
    "DELETE FROM lista_pracenja WHERE id_korisnika = ? AND id_predmeta = ?",
    [id_korisnika, id_predmeta],
    (error, results) => {
      if (error) return res.status(500).json({ error: true, message: "Greška pri uklanjanju s liste praćenja." });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: true, message: "Aukcija nije pronađena na listi praćenja." });
      }
      res.json({ error: false, message: "Aukcija uklonjena s liste praćenja." });
    }
  );
});

// ── Notifikacije ─────────────────────────────────────────────────────────────

// GET /api/notifikacije/:korisnikId — dohvati notifikacije korisnika
app.get("/api/notifikacije/:korisnikId", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    `SELECT n.id_notifikacija, n.poruka, n.procitano, n.datum_kreiranja, n.id_predmeta,
            p.naziv_predmeta
     FROM notifikacija n
     JOIN predmet p ON n.id_predmeta = p.id_predmeta
     WHERE n.id_korisnika = ?
     ORDER BY n.datum_kreiranja DESC
     LIMIT 50`,
    [req.params.korisnikId],
    (error, results) => {
      if (error) return res.status(500).json({ error: true, message: "Greška pri dohvatu notifikacija." });
      res.json(results);
    }
  );
});

// PUT /api/notifikacije/procitaj-sve/:korisnikId — označi sve kao pročitano
app.put("/api/notifikacije/procitaj-sve/:korisnikId", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    "UPDATE notifikacija SET procitano = 1 WHERE id_korisnika = ?",
    [req.params.korisnikId],
    (error) => {
      if (error) return res.status(500).json({ error: true, message: "Greška pri označavanju notifikacija." });
      res.json({ error: false, message: "Sve notifikacije označene kao pročitane." });
    }
  );
});

// GET /api/pobjednik/:id_predmeta — info o pobjedniku za prodavača
app.get("/api/pobjednik/:id_predmeta", authJwt.verifyTokenUser, (req, res) => {
  connection.query(
    `SELECT k.ime_korisnika, k.prezime_korisnika, k.email_korisnika, k.adresa_korisnika,
            po.vrijednost_ponude, p.naziv_predmeta
     FROM ponuda po
     JOIN korisnik k ON k.id_korisnika = po.id_korisnika
     JOIN predmet p ON p.id_predmeta = po.id_predmeta
     WHERE po.id_predmeta = ?
     ORDER BY po.vrijednost_ponude DESC
     LIMIT 1`,
    [req.params.id_predmeta],
    (error, results) => {
      if (error) return res.status(500).json({ error: true });
      if (!results.length) return res.status(404).json({ error: true, message: "Nema ponuda." });
      res.json(results[0]);
    }
  );
});

// ── FZ-2: Notifikacije o završetku aukcije ────────────────────────────────────

const obradeneAukcije = new Set();

connection.query(
  "SELECT DISTINCT id_predmeta FROM notifikacija WHERE poruka LIKE '%završila%'",
  (err, rows) => {
    if (!err) rows.forEach((r) => obradeneAukcije.add(r.id_predmeta));
  }
);

function posaljiNotifikacije(notifikacije) {
  if (!notifikacije.length) return;
  connection.query(
    "INSERT INTO notifikacija (id_korisnika, id_predmeta, poruka) VALUES ?",
    [notifikacije],
    (err) => {
      if (err) return;
    }
  );
}

function obradiZavrsenuAukciju(aukcija) {
  // Dohvati pobjednika (najveća ponuda)
  connection.query(
    `SELECT po.id_korisnika, po.vrijednost_ponude,
            k.ime_korisnika, k.prezime_korisnika, k.email_korisnika
     FROM ponuda po
     JOIN korisnik k ON k.id_korisnika = po.id_korisnika
     WHERE po.id_predmeta = ?
     ORDER BY po.vrijednost_ponude DESC
     LIMIT 1`,
    [aukcija.id_predmeta],
    (errP, pobjednici) => {
      if (errP) return;

      const notifikacije = [];
      const notifiedUsers = new Set();

      if (pobjednici.length === 0) {
        // Nema ponuda — obavijesti prodavača i pratitelje
        notifikacije.push([
          aukcija.id_prodavaca,
          aukcija.id_predmeta,
          `Aukcija "${aukcija.naziv_predmeta}" je završila bez ponuda.`,
        ]);
        notifiedUsers.add(aukcija.id_prodavaca);

        connection.query(
          "SELECT id_korisnika FROM lista_pracenja WHERE id_predmeta = ?",
          [aukcija.id_predmeta],
          (errW, pratitelji) => {
            (pratitelji || []).forEach((w) => {
              if (!notifiedUsers.has(w.id_korisnika)) {
                notifikacije.push([
                  w.id_korisnika,
                  aukcija.id_predmeta,
                  `Aukcija "${aukcija.naziv_predmeta}" je završila bez ponuda.`,
                ]);
              }
            });
            posaljiNotifikacije(notifikacije);
          }
        );
        return;
      }

      const pobjednik = pobjednici[0];

      // Zabilježi osvojeni predmet (lista osvojenih aukcija)
      connection.query(
        "INSERT IGNORE INTO osvojeni_predmeti (id_predmeta, id_korisnika, naziv_predmeta) VALUES (?, ?, ?)",
        [aukcija.id_predmeta, pobjednik.id_korisnika, aukcija.naziv_predmeta],
        (errO) => { if (errO) console.error("Greška pri upisu osvojenog predmeta:", errO); }
      );

      // FZ-2.4: Kreiraj transakciju
      connection.query(
        "INSERT IGNORE INTO transakcija (id_korisnika, id_predmeta, iznos_transakcije, vrijeme_transakcije) VALUES (?, ?, ?, NOW())",
        [pobjednik.id_korisnika, aukcija.id_predmeta, pobjednik.vrijednost_ponude],
        (errT) => { if (errT) console.error("Greška pri kreiranju transakcije:", errT); }
      );

      // Pobjedniku: čestitke
      notifikacije.push([
        pobjednik.id_korisnika,
        aukcija.id_predmeta,
        `Čestitamo! Pobijedili ste na aukciji "${aukcija.naziv_predmeta}" s ponudom ${pobjednik.vrijednost_ponude}$. Kontaktirajte prodavača za preuzimanje.`,
      ]);
      notifiedUsers.add(pobjednik.id_korisnika);

      // Prodavaču: info o pobjedniku
      if (!notifiedUsers.has(aukcija.id_prodavaca)) {
        notifikacije.push([
          aukcija.id_prodavaca,
          aukcija.id_predmeta,
          `Aukcija "${aukcija.naziv_predmeta}" je završila. Pobjednik: ${pobjednik.ime_korisnika} ${pobjednik.prezime_korisnika} (${pobjednik.email_korisnika}) s ponudom ${pobjednik.vrijednost_ponude}$.`,
        ]);
        notifiedUsers.add(aukcija.id_prodavaca);
      }

      // Ostalim bidderima: aukcija završila
      connection.query(
        "SELECT DISTINCT id_korisnika FROM ponuda WHERE id_predmeta = ? AND id_korisnika != ?",
        [aukcija.id_predmeta, pobjednik.id_korisnika],
        (errB, ostali) => {
          (ostali || []).forEach((b) => {
            if (!notifiedUsers.has(b.id_korisnika)) {
              notifikacije.push([
                b.id_korisnika,
                aukcija.id_predmeta,
                `Aukcija "${aukcija.naziv_predmeta}" je završila. Pobijedio je drugi sudionik s ponudom ${pobjednik.vrijednost_ponude}$.`,
              ]);
              notifiedUsers.add(b.id_korisnika);
            }
          });

          // Pratiteljima koji nisu licitirali: aukcija završila
          connection.query(
            "SELECT id_korisnika FROM lista_pracenja WHERE id_predmeta = ?",
            [aukcija.id_predmeta],
            (errW, pratitelji) => {
              (pratitelji || []).forEach((w) => {
                if (!notifiedUsers.has(w.id_korisnika)) {
                  notifikacije.push([
                    w.id_korisnika,
                    aukcija.id_predmeta,
                    `Aukcija "${aukcija.naziv_predmeta}" je završila.`,
                  ]);
                }
              });
              posaljiNotifikacije(notifikacije);
            }
          );
        }
      );
    }
  );
}

// Svakih 60 sekundi provjeri ima li završenih aukcija koje još nisu obrađene
setInterval(() => {
  connection.query(
    `SELECT p.id_predmeta, p.naziv_predmeta, p.id_korisnika AS id_prodavaca
     FROM predmet p
     WHERE p.vrijeme_zavrsetka <= NOW()
     AND NOT EXISTS (
       SELECT 1 FROM notifikacija n
       WHERE n.id_predmeta = p.id_predmeta
       AND n.poruka LIKE '%zavr%ila%'
     )`,
    (err, aukcije) => {
      if (err || !aukcije.length) return;
      aukcije
        .filter((a) => !obradeneAukcije.has(a.id_predmeta))
        .forEach((a) => {
          obradeneAukcije.add(a.id_predmeta);
          obradiZavrsenuAukciju(a);
        });
    }
  );
}, 60 * 1000);

module.exports = {
  app,
  server,
  io,
};
