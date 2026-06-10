<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 ref="h_korisnik" class="text-h3 text-blue q-my-md">{{ $t('updateProfilePage.user') }}</h5>
    </div>
    <q-form @submit="provjeraPolja">
      <q-input v-model="korisnik_novo.ime_korisnika" :label="$t('updateProfilePage.firstName')" outlined dense type="text" />
      <p ref="p_ime"></p>
      <q-input v-model="korisnik_novo.prezime_korisnika" :label="$t('updateProfilePage.lastName')" outlined dense type="text" />
      <p ref="p_prezime"></p>
      <q-input v-model="korisnik_novo.email_korisnika" :label="$t('updateProfilePage.email')" outlined dense type="email" />
      <p ref="p_email"></p>
      <q-input v-model="korisnik_novo.lozinka_korisnika" :label="$t('updateProfilePage.password')" outlined dense type="password" />
      <q-input v-model="korisnik_novo.potvrda_lozinke" :label="$t('updateProfilePage.confirmPassword')" outlined dense type="password" />
      <p style="height:10px"></p>
      <q-input v-model="korisnik_novo.adresa_korisnika" :label="$t('updateProfilePage.address')" outlined dense type="text" />
      <p ref="p_adresa"></p>
      <q-btn type="submit" :label="$t('updateProfilePage.edit')" color="primary" class="q-mt-md" />
    </q-form>
  </q-page>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      korisnik_trenutno: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
        lozinka_korisnika: ""
      },
      korisnik_novo: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
        id_korisnika: this.$route.params.id,
        lozinka_korisnika: "",
        potvrda_lozinke: "",
        lozinka_izmijenjena: false
      },
    };
  },

  async mounted() {
    // Get the JWT token from local storage
    const token = localStorage.getItem("token");

    // Set up the request headers to include the JWT token
    const headers = { Authorization: `Bearer ${token}` };
    const id = this.$route.params.id;
    await this.dohvatiKorisnika(id, headers);
    this.ispisiPodatke();
  },

  methods: {
    async dohvatiKorisnika(id, headers) {
      try {
        const response = await axios.get("http://localhost:3000/api/korisnikinfo/" + id, { headers });
        //console.log(response.data[0]);
        this.korisnik_trenutno = response.data[0];
      } catch (error) {
        console.error("Greška pri dohvatu korisnika", error);
      }
    },

    async ispisiPodatke() {
      try {
        this.$refs.p_ime.textContent = this.$t('updateProfilePage.currentFirstName') + ": " + this.korisnik_trenutno.ime_korisnika;
        this.$refs.p_prezime.textContent = this.$t('updateProfilePage.currentLastName') + ": " + this.korisnik_trenutno.prezime_korisnika;
        this.$refs.p_email.textContent = this.$t('updateProfilePage.currentEmail') + ": " + this.korisnik_trenutno.email_korisnika;
        this.$refs.p_adresa.textContent = this.$t('updateProfilePage.currentAddress') + ": " + this.korisnik_trenutno.adresa_korisnika;
        this.$refs.h_korisnik.textContent = this.$t('updateProfilePage.user') + " " + this.korisnik_trenutno.ime_korisnika + " " + this.korisnik_trenutno.prezime_korisnika;
      } catch (error) {
        console.error("Greška pri upisivanju podataka", error);
      }
    },

    provjeraPolja() {
      if (this.korisnik_novo.ime_korisnika == "" && this.korisnik_novo.prezime_korisnika == ""
        && this.korisnik_novo.email_korisnika == "" && this.korisnik_novo.adresa_korisnika == ""
        && this.korisnik_novo.lozinka_korisnika == "" && this.korisnik_novo.potvrda_lozinke == "") {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('updateProfilePage.noChanges'),
          icon: "warning",
        });
      } else if (this.korisnik_novo.lozinka_korisnika != this.korisnik_novo.potvrda_lozinke) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('updateProfilePage.passwordMismatch'),
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
    },

    async izmjenaKorisnika() {
      if (this.korisnik_novo.ime_korisnika == "") this.korisnik_novo.ime_korisnika = this.korisnik_trenutno.ime_korisnika;
      if (this.korisnik_novo.prezime_korisnika == "") this.korisnik_novo.prezime_korisnika = this.korisnik_trenutno.prezime_korisnika;
      if (this.korisnik_novo.email_korisnika == "") this.korisnik_novo.email_korisnika = this.korisnik_trenutno.email_korisnika;
      if (this.korisnik_novo.adresa_korisnika == "") this.korisnik_novo.adresa_korisnika = this.korisnik_trenutno.adresa_korisnika;
      if (this.korisnik_novo.lozinka_korisnika == "") {
        this.korisnik_novo.lozinka_korisnika = this.korisnik_trenutno.lozinka_korisnika;
      } else { //ako JE nova lozinka unesena, hasha se, tu se flag postavlja
        this.korisnik_novo.lozinka_izmijenjena = true;
        }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.put("http://localhost:3000/api/izmjenakorisnika/", this.korisnik_novo, { headers });

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.$t('updateProfilePage.updateSuccess'),
        });
        await this.dohvatiKorisnika(this.korisnik_novo.id_korisnika, headers);
        this.ispisiPodatke(this.korisnik_novo.id_korisnika);
        this.ocistiPolja();
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('updateProfilePage.updateFailed'),
        });
        console.log(error);
      }
    },
  },
};
</script>
