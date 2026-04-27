# iooa-2026-aukcije

Aukcije

Članovi tima: 1. Ćiković Natalia 2. Ferstner Augustin 3. Pleše Antonio 4. Poljak Borna 5. Radoš Antonio 6. Resanović Filip

Zadaci tima:
Dodati mogućnost ažuriranja cijene pojedinog predmeta u realnom vremenu (WebSocket).

    Dodati mogućnost da kad se zatvori aukcija, korisnik koji je ponudio najviše dobiva obavijest i podatke o kontaktu za transakciju.

## Korisničke priče

| Broj zahtjeva | Naziv | Uloga | Funkcionalnost | Cilj |
|--------------|-------|-------|----------------|------|
| FZ-1 | Real-time mijenjanje cijene | Sustav | Nakon inicijalnog oglasa, cijena se dinamički ažurira i prikazuje se zadnja najveća ponuda. | Predmeti na aukciji prikazuju zadnju najveću ponudu svim zainteresiranim kupcima. |
| FZ-2 | Primanje obavijesti i kontaktni podaci za transakciju | Sustav | Nakon završetka aukcije kupac koji je dao najveću ponudu dobiva obavijest o dobivenoj aukciji i kontaktne podatke za završetak transakcije. | Obavijestiti pobjedničkog korisnika i omogućiti mu kontakt s prodavačem. |
| FZ-3 | Implementacija liste praćenja aukcija (Watchlist) | Sustav | Korisnik može dodati aukciju na listu praćenja i dobiti obavijest kad se nešto promijeni (nova ponuda, kraj aukcije). | Omogućiti korisniku praćenje aukcije. Sustav korisniku šalje notifikaciju kada je izvršena nova ponuda ili kada aukcija završi. |
| FZ-4 | Pregled računa / povijest transakcija | Registrirani korisnik | Pregled popisa osvojenih aukcija i svih izvršenih transakcija. | Omogućiti korisniku uvid u povijest kupnji, plaćene iznose i završene aukcije. |
| FZ-5 | Povijest ponuda za predmet | Registrirani korisnik / Gost | Pregled svih dosadašnjih ponuda za pojedini predmet. | Povećati transparentnost aukcije. |
| FZ-6 | Automatsko licitiranje (Auto-bid) | Registrirani korisnik | Korisnik postavlja maksimalni iznos ponude, a sustav automatski povećava njegovu ponudu do zadanog limita kada drugi korisnici licitiraju. | Omogućiti korisniku lakše sudjelovanje u aukciji bez stalnog ručnog praćenja i povećati konkurentnost licitiranja. |
