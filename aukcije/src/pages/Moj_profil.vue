<template>
  <div>
    <div class="user-info">
      <div class="user-info-header">
        <div class="row">
          <h5 class="text-h3 text-blue q-my-md">
            {{ t('profilePage.user') }} {{ korisnik_trenutno.ime_korisnika }} {{ korisnik_trenutno.prezime_korisnika }}
          </h5>
        </div>
        <div>
          <p>{{ t('profilePage.currentFirstName') }}: {{ korisnik_trenutno.ime_korisnika }}</p>
          <p>{{ t('profilePage.currentLastName') }}: {{ korisnik_trenutno.prezime_korisnika }}</p>
          <p>{{ t('profilePage.currentEmail') }}: {{ korisnik_trenutno.email_korisnika }}</p>
          <p>{{ t('profilePage.currentAddress') }}: {{ korisnik_trenutno.adresa_korisnika }}</p>
        </div>
      </div>

      <div class="user-info-image">
        <img src="~assets/profilna.png" :alt="t('profilePage.profileImage')" />
      </div>
    </div>

    <q-btn
      color="primary"
      :label="t('profilePage.editUserData')"
      @click="$router.push('/UpdateProfil')"
    />

    <h3>{{ t('profilePage.yourAuctionItems') }}</h3>
    <p>{{ noItemsMessage }}</p>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="predmet in vlastitiPredmeti" :key="predmet.id_predmeta" class="q-pa-md" style="width: 400px">
        <q-card>
          <q-item-section @click="pregledPredmeta(predmet.id_predmeta)">
            <q-img v-if="predmet.slika" :src="predmet.slika" no-native-menu />
            <q-item class="q-pa-sm text-bold text-blue-7">{{ predmet.naziv_predmeta }}</q-item>
            <q-item>{{ t('profilePage.startingPrice') }}: {{ predmet.pocetna_cijena }}$</q-item>
            <q-item>{{ t('profilePage.startTime') }}: {{ formattedDate(predmet.vrijeme_pocetka) }}</q-item>
            <q-item>{{ t('profilePage.endTime') }}: {{ formattedDate(predmet.vrijeme_zavrsetka) }}</q-item>
            <q-item>{{ t('profilePage.remainingTime') }}: {{ predmet.preostalo_vrijeme }} h</q-item>
            <q-item>{{ t('profilePage.currentPrice') }}: {{ predmet.trenutna_cijena }}$</q-item>
          </q-item-section>

          <q-separator dark />

          <q-card-actions v-if="provjeriDatum(predmet)">
            <q-btn flat color="primary" @click="izmijeniPredmet(predmet.id_predmeta)">
              {{ t('profilePage.edit') }}
            </q-btn>
            <q-btn flat color="negative" @click="obrisiPredmet(predmet.id_predmeta)">
              {{ t('profilePage.delete') }}
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <h3>{{ t('profilePage.yourBids') }}</h3>
    <p>{{ noBidsMessage }}</p>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="ponuda in vlastitePonude" :key="ponuda.id_ponude" class="q-pa-md" style="width: 400px">
        <q-card>
          <q-item-section>
            <q-img v-if="ponuda.slika" :src="ponuda.slika" no-native-menu />
            <q-item class="q-pa-sm text-bold text-blue-7">{{ ponuda.naziv_predmeta }}</q-item>
            <q-item>{{ t('profilePage.description') }}: {{ ponuda.opis_predmeta }}</q-item>
            <q-item>{{ t('profilePage.bidValue') }}: {{ ponuda.vrijednost_ponude }}$</q-item>
            <q-item>{{ t('profilePage.bidTime') }}: {{ formattedDate(ponuda.vrijeme_ponude) }}</q-item>
          </q-item-section>
          <q-separator dark />
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #f2f2f2;
  padding: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.user-info-header {
  margin-bottom: 20px;
}

.user-info-header h2 {
  font-size: 24px;
  margin-bottom: 5px;
}

.user-info-header p {
  font-size: 16px;
  margin-bottom: 5px;
}

.user-info-image img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  height: 400px;
  margin: 10px;
  border-radius: 15px;
  border: 1px solid #ccc;
  overflow: hidden;
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
  cursor: pointer;
}
</style>

<script>
import axios from "axios";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      currentUser: {},
      userBids: [],
      korisnik_trenutno: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: ""
      },
      vlastitiPredmeti: [],
      vlastitePonude: [],
      noItemsMessage: "",
      noBidsMessage: "",
    };
  },

  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const headers = { Authorization: `Bearer ${token}` };

      const userData = await this.fetchUserData(userId);
      this.korisnik_trenutno = userData;

      await this.dohvatPredmeta(userId, headers);
      await this.dohvatPonude(userId, headers);
    } catch (error) {
      console.error("Greška:", error);
    }
  },

  watch: {
    "$i18n.locale"() {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const headers = { Authorization: `Bearer ${token}` };

      this.dohvatPredmeta(userId, headers);
      this.dohvatPonude(userId, headers);
    }
  },

  methods: {
    isEnglish() {
      return String(this.$i18n.locale || "hr").startsWith("en");
    },

    async dohvatPredmeta(userId, headers) {
      await axios
        .get("http://localhost:3000/api/vlastiti-predmeti/" + userId, { headers })
        .then((response) => {

          if (response.data.length === 0) {
            this.noItemsMessage = this.t("profilePage.noAuctionItems");
            this.vlastitiPredmeti = [];
          } else {
            this.noItemsMessage = "";

            this.vlastitiPredmeti = response.data.map((item) => ({
              ...item,
              naziv_predmeta: this.isEnglish()
                ? item.naziv_predmeta_en || item.naziv_predmeta
                : item.naziv_predmeta
            }));
          }
        });
    },

    async dohvatPonude(userId, headers) {
      await axios
        .get("http://localhost:3000/api/vlastita-ponuda-korisnik/" + userId, { headers })
        .then((response) => {

          if (response.data.length === 0) {
            this.noBidsMessage = this.t("profilePage.noBids");
            this.vlastitePonude = [];
          } else {
            this.noBidsMessage = "";

            this.vlastitePonude = response.data.map((item) => ({
              ...item,
              naziv_predmeta: this.isEnglish()
                ? item.naziv_predmeta_en || item.naziv_predmeta
                : item.naziv_predmeta,
              opis_predmeta: this.isEnglish()
                ? item.opis_en || item.opis_predmeta
                : item.opis_predmeta
            }));
          }
        })
        .catch((error) => {
          console.error("API Error:", error);
        });
    },

    formattedDate(dateString) {
      return new Date(dateString)
        .toLocaleString(this.$i18n.locale)
        .replace(",", "");
    },

    pregledPredmeta(id_predmeta) {
      this.$router.push({ path: "prikaz", query: { id_predmeta } });
    },

    izmijeniPredmet(id_predmeta) {
      this.$router.push({ path: "izmjena_predmeta", query: { id_predmeta } });
    },

    async obrisiPredmet(id_predmeta) {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const headers = { Authorization: `Bearer ${token}` };

      if (window.confirm(this.t("profilePage.confirmDelete"))) {
        try {
          await axios.delete(
            "http://localhost:3000/api/brisanjePredmeta/" + id_predmeta,
            { headers }
          );

          this.$q.notify({
            color: "positive",
            position: "top",
            message: this.t("profilePage.deleteSuccess"),
          });

          await this.dohvatPredmeta(userId, headers);
        } catch (error) {
          console.log("Greška pri brisanju: " + error);
        }
      }
    },

    getUserIdFromToken(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload).id;
    },

    async fetchUserData(userId) {
      const response = await axios.get(
        `http://localhost:3000/api/korisnikinfo1/${userId}`
      );
      return response.data[0];
    },

    provjeriDatum(predmet) {
      const vrijemePocetka = new Date(predmet.vrijeme_pocetka);
      return vrijemePocetka >= new Date();
    }
  }
};
</script>