<template>
  <q-page class="bg-blue window-height window-width row justify-center items-center">
    <div class="column">
      <div class="row">
        <h5 class="text-h3 text-white q-my-md">{{ t('registerPage.title') }}</h5>
      </div>

      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md" @submit="provjera">
              <q-input
                square
                filled
                v-model="ime_korisnika"
                type="text"
                :label="t('registerPage.firstName')"
              />
              <q-input
                square
                filled
                v-model="prezime_korisnika"
                type="text"
                :label="t('registerPage.lastName')"
              />
              <q-input
                square
                filled
                v-model="email_korisnika"
                type="email"
                :label="t('registerPage.email')"
              />
              <q-input
                square
                filled
                v-model="lozinka_korisnika"
                type="password"
                :label="t('registerPage.password')"
              />
              <q-input
                square
                filled
                v-model="provjera_lozinke"
                type="password"
                :label="t('registerPage.repeatPassword')"
              />
              <q-input
                square
                filled
                v-model="adresa_korisnika"
                type="text"
                :label="t('registerPage.address')"
              />

              <div class="text-center">
                <q-btn
                  size="lg"
                  type="submit"
                  :label="t('registerPage.submit')"
                  color="light-blue-7"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pa-none">
            <router-link to="prijava" class="link-style">
              <p class="text-grey-6">{{ t('registerPage.goToLogin') }}</p>
            </router-link>
          </q-card-section>

          <q-card-section class="text-center q-pa-none">
            <router-link to="/" class="link-style">
              <p class="text-grey-6">{{ t('registerPage.continueAsGuest') }}</p>
            </router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
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
      ime_korisnika: "",
      prezime_korisnika: "",
      email_korisnika: "",
      lozinka_korisnika: "",
      provjera_lozinke: "",
      adresa_korisnika: "",
    };
  },

  methods: {
    async registracija() {
      const podaciZaReg = {
        ime: this.ime_korisnika,
        prezime: this.prezime_korisnika,
        email: this.email_korisnika,
        lozinka: this.lozinka_korisnika,
        adresa: this.adresa_korisnika,
      };

      try {
        const response = await axios.post(
          "http://localhost:3000/regaKorisnika",
          podaciZaReg
        );
        console.log(response.data);
        this.showDialog = true;

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("registerPage.success"),
        });
      } catch (error) {
        if (sqlState == "23000") {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: this.t("registerPage.emailInUse"),
            icon: "warning",
          });
        } else {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: this.t("registerPage.registrationError"),
            icon: "warning",
          });
        }
        console.error(error);
      }
    },

    usporedba_lozinki() {
      if (this.lozinka_korisnika != this.provjera_lozinke) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("registerPage.passwordsMismatch"),
          icon: "warning",
        });
      } else {
        this.registracija();
      }
      return;
    },

    provjera() {
      if (
        !this.ime_korisnika ||
        !this.prezime_korisnika ||
        !this.email_korisnika ||
        !this.lozinka_korisnika ||
        !this.provjera_lozinke ||
        !this.adresa_korisnika
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("registerPage.requiredFields"),
          icon: "warning",
        });
      } else {
        this.usporedba_lozinki();
      }
      return;
    },
  },
};
</script>

<style>
.q-pa-lg {
  width: 360px;
}
</style>