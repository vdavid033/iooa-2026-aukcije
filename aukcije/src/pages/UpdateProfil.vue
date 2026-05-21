<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 class="text-h3 text-blue q-my-md">
        {{ t('updateProfilePage.user') }} {{ korisnik_trenutno.ime_korisnika }} {{ korisnik_trenutno.prezime_korisnika }}
      </h5>
    </div>

    <q-form @submit="provjeraPolja">
      <q-input
        v-model="korisnik_novo.ime_korisnika"
        :label="t('updateProfilePage.firstName')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('updateProfilePage.currentFirstName') }}: {{ korisnik_trenutno.ime_korisnika }}</p>

      <q-input
        v-model="korisnik_novo.prezime_korisnika"
        :label="t('updateProfilePage.lastName')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('updateProfilePage.currentLastName') }}: {{ korisnik_trenutno.prezime_korisnika }}</p>

      <q-input
        v-model="korisnik_novo.email_korisnika"
        :label="t('updateProfilePage.email')"
        outlined
        dense
        type="email"
      />
      <p>{{ t('updateProfilePage.currentEmail') }}: {{ korisnik_trenutno.email_korisnika }}</p>

      <q-input
        v-model="korisnik_novo.lozinka_korisnika"
        :label="t('updateProfilePage.password')"
        outlined
        dense
        type="password"
      />

      <q-input
        v-model="korisnik_novo.potvrda_lozinke"
        :label="t('updateProfilePage.confirmPassword')"
        outlined
        dense
        type="password"
      />

      <p style="height: 10px"></p>

      <q-input
        v-model="korisnik_novo.adresa_korisnika"
        :label="t('updateProfilePage.address')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('updateProfilePage.currentAddress') }}: {{ korisnik_trenutno.adresa_korisnika }}</p>

      <q-btn
        type="submit"
        :label="t('updateProfilePage.edit')"
        color="primary"
        class="q-mt-md"
      />
    </q-form>
  </q-page>
</template>

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
      korisnik_trenutno: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
        id_korisnika: "",
        lozinka_korisnika: "",
      },
      korisnik_novo: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
        lozinka_korisnika: "",
        potvrda_lozinke: "",
        id_korisnika: this.$route.params.id,
        lozinka_izmijenjena: 0,
      },
    };
  },

  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const userData = await this.fetchUserData(userId);

      this.korisnik_trenutno = userData;
      this.korisnik_novo.id_korisnika = userId;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },

  methods: {
    getUserIdFromToken(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload).id;
    },

    async fetchUserData(userId) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/korisnikinfo1/${userId}`
        );
        return response.data[0];
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },

    provjeraPolja() {
      if (
        this.korisnik_novo.ime_korisnika === "" &&
        this.korisnik_novo.prezime_korisnika === "" &&
        this.korisnik_novo.email_korisnika === "" &&
        this.korisnik_novo.adresa_korisnika === "" &&
        this.korisnik_novo.lozinka_korisnika === "" &&
        this.korisnik_novo.potvrda_lozinke === ""
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("updateProfilePage.noChanges"),
          icon: "warning",
        });
      } else if (
        this.korisnik_novo.lozinka_korisnika !==
        this.korisnik_novo.potvrda_lozinke
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("updateProfilePage.passwordMismatch"),
          icon: "warning",
        });
      } else {
        this.izmjenaKorisnika();
      }
    },

    ocistiPolja() {
      this.korisnik_novo.ime_korisnika = "";
      this.korisnik_novo.prezime_korisnika = "";
      this.korisnik_novo.email_korisnika = "";
      this.korisnik_novo.adresa_korisnika = "";
      this.korisnik_novo.lozinka_korisnika = "";
      this.korisnik_novo.potvrda_lozinke = "";
      this.korisnik_novo.lozinka_izmijenjena = 0;
    },

    async izmjenaKorisnika() {
      if (this.korisnik_novo.ime_korisnika === "") {
        this.korisnik_novo.ime_korisnika = this.korisnik_trenutno.ime_korisnika;
      }
      if (this.korisnik_novo.prezime_korisnika === "") {
        this.korisnik_novo.prezime_korisnika =
          this.korisnik_trenutno.prezime_korisnika;
      }
      if (this.korisnik_novo.email_korisnika === "") {
        this.korisnik_novo.email_korisnika =
          this.korisnik_trenutno.email_korisnika;
      }
      if (this.korisnik_novo.adresa_korisnika === "") {
        this.korisnik_novo.adresa_korisnika =
          this.korisnik_trenutno.adresa_korisnika;
      }
      if (this.korisnik_novo.lozinka_korisnika === "") {
        this.korisnik_novo.lozinka_korisnika =
          this.korisnik_trenutno.lozinka_korisnika;
      } else {
        this.korisnik_novo.lozinka_izmijenjena = 1;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.put(
          "http://localhost:3000/api/izmjenakorisnika1/",
          this.korisnik_novo,
          { headers }
        );

        const refreshedUser = await this.fetchUserData(this.korisnik_novo.id_korisnika);
        this.korisnik_trenutno = refreshedUser;

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("updateProfilePage.updateSuccess"),
        });

        this.ocistiPolja();
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("updateProfilePage.updateFailed"),
        });
        console.error("Error updating user data:", error);
      }
    },
  },
};
</script>