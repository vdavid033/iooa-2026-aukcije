<template>
  <div class="profile-page q-pa-md">

    <!-- PROFIL -->
    <q-card class="profile-hero q-mb-xl">
      <q-card-section class="profile-hero__top">
        <div class="row items-center justify-between q-col-gutter-md">

          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-md">
              <q-avatar size="110px" class="shadow-6">
                <img src="~assets/profilna.png" alt="Profilna slika" />
              </q-avatar>

              <div>
                <div class="text-h4 text-weight-bold text-primary">
                  Korisnik {{ korisnik_trenutno.ime_korisnika }} {{ korisnik_trenutno.prezime_korisnika }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  Pregled vašeg profila
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <q-btn
              color="primary"
              unelevated
              icon="edit"
              label="Izmjena podataka"
              @click="$router.push('/UpdateProfil')"
            />
          </div>

        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="person" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">Ime</div>
                  <div class="text-weight-medium">{{ korisnik_trenutno.ime_korisnika }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="badge" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">Prezime</div>
                  <div class="text-weight-medium">{{ korisnik_trenutno.prezime_korisnika }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="mail" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">Email</div>
                  <div class="text-weight-medium ellipsis">
                    {{ korisnik_trenutno.email_korisnika }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="place" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">Adresa</div>
                  <div class="text-weight-medium">{{ korisnik_trenutno.adresa_korisnika }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

        </div>
      </q-card-section>
    </q-card>

    <!-- PREDMETI -->
    <div class="section-head q-mb-md">
      <h5>Vaši predmeti na aukciji</h5>
    </div>

    <p v-if="vlastitiPredmeti.length === 0" class="text-grey">
      Nemate niti jedan predmet koji je ili je bio na aukciji!
    </p>

    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="predmet in vlastitiPredmeti"
        :key="predmet.id_predmeta"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="auction-card">

          <q-img
            v-if="predmet.slika"
            :src="predmet.slika"
            ratio="4/3"
          />

          <q-card-section>
            <div class="row justify-between items-center">
              <div class="text-h6 text-primary">
                {{ predmet.naziv_predmeta }}
              </div>

              <q-badge :color="provjeriDatum(predmet) ? 'green' : 'grey'">
                {{ provjeriDatum(predmet) ? 'Aktivno' : 'Završeno' }}
              </q-badge>
            </div>

            <div class="q-mt-sm text-body2">
              Početna cijena: {{ predmet.pocetna_cijena }}$
            </div>
            <div class="text-body2">
              Početak: {{ formattedDate(predmet.vrijeme_pocetka) }}
            </div>
            <div class="text-body2">
              Završetak: {{ formattedDate(predmet.vrijeme_zavrsetka) }}
            </div>
            <div class="text-body2">
              Preostalo: {{ predmet.preostalo_vrijeme }} h
            </div>
            <div class="text-body2 text-weight-bold">
              Trenutna: {{ predmet.trenutna_cijena }}$
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="between">
            <q-btn flat label="Pregled" @click="pregledPredmeta(predmet.id_predmeta)" />

            <div v-if="provjeriDatum(predmet)">
              <q-btn flat color="primary" label="Izmijeni" @click="izmijeniPredmet(predmet.id_predmeta)" />
              <q-btn flat color="negative" label="Obriši" @click="obrisiPredmet(predmet.id_predmeta)" />
            </div>
          </q-card-actions>

        </q-card>
      </div>
    </div>

    <!-- PONUDE -->
    <div class="section-head q-mb-md">
      <h5>Vaše ponude</h5>
    </div>

    <p v-if="vlastitePonude.length === 0" class="text-grey">
      Nemate niti jednu ponudu!
    </p>

    <div class="row q-col-gutter-md">
      <div
        v-for="ponuda in vlastitePonude"
        :key="ponuda.id_ponude"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="bid-card">

          <q-card-section>
            <q-img
              v-if="ponuda.slika"
              :src="ponuda.slika"
              style="height:150px"
            />

            <div class="text-subtitle1 text-primary q-mt-sm">
              {{ ponuda.naziv_predmeta }}
            </div>

            <div class="text-body2">
              Opis: {{ ponuda.opis_predmeta }}
            </div>

            <div class="text-body2">
              Ponuda: {{ ponuda.vrijednost_ponude }}$
            </div>

            <div class="text-body2">
              Vrijeme: {{ formattedDate(ponuda.vrijeme_ponude) }}
            </div>
          </q-card-section>

        </q-card>
      </div>
    </div>

    <!-- OSVOJENI PREDMETI -->
    <div class="section-head q-mb-md q-mt-xl">
      <h5>Vaši osvojeni predmeti</h5>
    </div>

    <p v-if="vlastitiOsvojeniPredmeti.length === 0" class="text-grey">
      Niste još osvojili niti jedan predmet!
    </p>

    <div class="row q-col-gutter-md">
      <div
        v-for="osvojeniPredmet in vlastitiOsvojeniPredmeti"
        :key="osvojeniPredmet.id_predmeta"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="won-item-card">

          <q-img
            v-if="osvojeniPredmet.slika"
            :src="osvojeniPredmet.slika"
            style="height:200px"
          />

          <q-card-section>
            <div class="text-h6 text-primary">
              {{ osvojeniPredmet.naziv_predmeta }}
            </div>

            <div class="q-mt-sm text-body2">
              {{ osvojeniPredmet.opis_predmeta }}
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body2 text-weight-bold text-positive">
              Konačna cijena: {{ osvojeniPredmet.konacna_cijena }}$
            </div>
          </q-card-section>

        </q-card>
      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #f5f7fa, #e4ecff);
  min-height: 100vh;
}

.profile-hero {
  border-radius: 20px;
}

.info-tile {
  border-radius: 14px;
  transition: 0.2s;
}

.info-tile:hover {
  transform: translateY(-2px);
}

.auction-card,
.bid-card,
.won-item-card {
  border-radius: 16px;
  transition: 0.25s;
}

.auction-card:hover,
.bid-card:hover,
.won-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      korisnik_trenutno: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: ""
      },
      vlastitiPredmeti: [],
      vlastitePonude: [],
      vlastitiOsvojeniPredmeti: [],
    }
  },

  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const headers = { Authorization: `Bearer ${token}` };

      const userData = await this.fetchUserData(userId);
      this.korisnik_trenutno = userData;

      this.dohvatPredmeta(userId, headers);
      this.dohvatPonude(userId, headers);
      this.dohvatOsvojeniPredmeti(userId, headers);

    } catch (error) {
      console.error(error);
    }
  },

  methods: {
    async dohvatPredmeta(userId, headers) {
      const res = await axios.get("http://localhost:3000/api/vlastiti-predmeti/" + userId, { headers });
      this.vlastitiPredmeti = res.data;
    },

    async dohvatPonude(userId, headers) {
      const res = await axios.get("http://localhost:3000/api/vlastita-ponuda-korisnik/" + userId, { headers });
      this.vlastitePonude = res.data;
    },

    async dohvatOsvojeniPredmeti(userId, headers) {
      const res = await axios.get("http://localhost:3000/api/osvojeni-predmeti/" + userId, { headers });
      console.log("Puni osvojeni predmeti:", JSON.stringify(res.data, null, 2));
      res.data.forEach((p, i) => {
        console.log(`Predmet ${i}:`, {
          id_predmeta: p.id_predmeta,
          naziv_predmeta: p.naziv_predmeta,
          slika_length: p.slika ? p.slika.length : "NULL",
          slika_start: p.slika ? p.slika.substring(0, 50) : "NULL"
        });
      });
      this.vlastitiOsvojeniPredmeti = res.data;
    },

    formattedDate(date) {
      return new Date(date).toLocaleString("hr-HR").replace(",", "");
    },

    pregledPredmeta(id) {
      this.$router.push({ path: "prikaz", query: { id_predmeta: id } });
    },

    izmijeniPredmet(id) {
      this.$router.push({ path: "izmjena_predmeta", query: { id_predmeta: id } });
    },

    async obrisiPredmet(id) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (confirm("Jeste li sigurni?")) {
        await axios.delete("http://localhost:3000/api/brisanjePredmeta/" + id, { headers });
        location.reload();
      }
    },

    getUserIdFromToken(token) {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64)).id;
    },

    async fetchUserData(userId) {
      const res = await axios.get(`http://localhost:3000/api/korisnikinfo1/${userId}`);
      return res.data[0];
    },

    provjeriDatum(predmet) {
      return new Date(predmet.vrijeme_pocetka) > new Date();
    }
  }
}
</script>
