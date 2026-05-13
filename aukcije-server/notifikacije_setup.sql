-- FZ-3.3: Tablica za notifikacije praćenih aukcija
CREATE TABLE IF NOT EXISTS notifikacija (
    id_notifikacija INT          NOT NULL AUTO_INCREMENT,
    id_korisnika    INT          NOT NULL,
    id_predmeta     INT          NOT NULL,
    poruka          VARCHAR(500) NOT NULL,
    procitano       TINYINT(1)   NOT NULL DEFAULT 0,
    datum_kreiranja DATETIME     NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id_notifikacija),

    CONSTRAINT fk_notif_korisnik
        FOREIGN KEY (id_korisnika) REFERENCES korisnik(id_korisnika)
        ON DELETE CASCADE,

    CONSTRAINT fk_notif_predmet
        FOREIGN KEY (id_predmeta) REFERENCES predmet(id_predmeta)
        ON DELETE CASCADE
);
