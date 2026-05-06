-- FZ-3.1: Tablica za listu praćenja aukcija
-- Povezuje id_korisnika (User) i id_predmeta (Auction)
-- UNIQUE constraint sprječava duplikate (isti korisnik ne može dvaput pratiti isti predmet)

CREATE TABLE IF NOT EXISTS lista_pracenja (
    id_lista       INT          NOT NULL AUTO_INCREMENT,
    id_korisnika   INT          NOT NULL,
    id_predmeta    INT          NOT NULL,
    datum_dodavanja DATETIME    NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id_lista),
    UNIQUE KEY uq_korisnik_predmet (id_korisnika, id_predmeta),

    CONSTRAINT fk_lista_korisnik
        FOREIGN KEY (id_korisnika) REFERENCES korisnik(id_korisnika)
        ON DELETE CASCADE,

    CONSTRAINT fk_lista_predmet
        FOREIGN KEY (id_predmeta) REFERENCES predmet(id_predmeta)
        ON DELETE CASCADE
);
