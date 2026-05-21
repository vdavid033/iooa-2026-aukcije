<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 class="text-h3 text-blue q-my-md">
        {{ t('adminUserEditPage.user') }}
        {{ korisnik_trenutno.ime_korisnika }}
        {{ korisnik_trenutno.prezime_korisnika }}
      </h5>
    </div>

    <q-form @submit="provjeraPolja">
      <q-input
        v-model="korisnik_novo.ime_korisnika"
        :label="t('adminUserEditPage.firstName')"
        outlined
        dense
        type="text"
      />
      <p>
        {{ t('adminUserEditPage.currentFirstName') }}:
        {{ korisnik_trenutno.ime_korisnika }}
      </p>

      <q-input
        v-model="korisnik_novo.prezime_korisnika"
        :label="t('adminUserEditPage.lastName')"
        outlined
        dense
        type="text"
      />
      <p>
        {{ t('adminUserEditPage.currentLastName') }}:
        {{ korisnik_trenutno.prezime_korisnika }}
      </p>

      <q-input
        v-model="korisnik_novo.email_korisnika"
        :label="t('adminUserEditPage.email')"
        outlined
        dense
        type="email"
      />
      <p>
        {{ t('adminUserEditPage.currentEmail') }}:
        {{ korisnik_trenutno.email_korisnika }}
      </p>

      <q-input
        v-model="korisnik_novo.lozinka_korisnika"
        :label="t('adminUserEditPage.password')"
        outlined
        dense
        type="password"
      />

      <q-input
        v-model="korisnik_novo.potvrda_lozinke"
        :label="t('adminUserEditPage.confirmPassword')"
        outlined
        dense
        type="password"
      />

      <p style="height: 10px"></p>

      <q-input
        v-model="korisnik_novo.adresa_korisnika"
        :label="t('adminUserEditPage.address')"
        outlined
        dense
        type="text"
      />
      <p>
        {{ t('adminUserEditPage.currentAddress') }}:
        {{ korisnik_trenutno.adresa_korisnika }}
      </p>

      <q-btn
        type="submit"
        :label="t('adminUserEditPage.edit')"
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
        lozinka_korisnika: "",
      },
      korisnik_novo: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
        id_korisnika: this.$route.params.id,
        lozinka_korisnika: "",
        potvrda_lozinke: "",
        lozinka_izmijenjena: false,
      },
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const id = this.$route.params.id;
    await this.dohvatiKorisnika(id, headers);
  },

  methods: {
    async dohvatiKorisnika(id, headers) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/korisnikinfo/" + id,
          { headers }
        );
        this.korisnik_trenutno = response.data[0];
      } catch (error) {
        console.error("Greška pri dohvatu korisnika", error);
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
          message: this.t("adminUserEditPage.noChanges"),
          icon: "warning",
        });
      } else if (
        this.korisnik_novo.lozinka_korisnika !==
        this.korisnik_novo.potvrda_lozinke
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("adminUserEditPage.passwordMismatch"),
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
      this.korisnik_novo.lozinka_izmijenjena = false;
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
        this.korisnik_novo.lozinka_izmijenjena = true;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.put(
          "http://localhost:3000/api/izmjenakorisnika/",
          this.korisnik_novo,
          { headers }
        );

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("adminUserEditPage.updateSuccess"),
        });

        await this.dohvatiKorisnika(this.korisnik_novo.id_korisnika, headers);
        this.ocistiPolja();
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("adminUserEditPage.updateFailed"),
        });
        console.log(error);
      }
    },
  },
};
</script>