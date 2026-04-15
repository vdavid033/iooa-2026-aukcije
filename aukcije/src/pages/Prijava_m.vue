<template>
  <q-page class="bg-blue window-height window-width row justify-center items-center">
    <div class="column">
      <div class="row">
        <h5 class="text-h3 text-white q-my-md">{{ t('loginPage.title') }}</h5>
      </div>

      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="login">

              <q-input
                square
                filled
                v-model="email_korisnika"
                type="email"
                :label="t('loginPage.email')"
              />

              <q-input
                square
                filled
                v-model="lozinka_korisnika"
                type="password"
                :label="t('loginPage.password')"
              />

              <div class="text-center">
                <q-btn
                  size="lg"
                  type="submit"
                  :label="t('loginPage.submit')"
                  color="light-blue-7"
                />
              </div>

            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pa-none">
            <router-link to="registracija" class="link-style">
              <p class="text-grey-6">{{ t('loginPage.register') }}</p>
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
      email_korisnika: "",
      lozinka_korisnika: "",
    };
  },

  methods: {
    async login() {
      try {
        const response = await axios.post("http://localhost:3000/login", {
          email: this.email_korisnika,
          password: this.lozinka_korisnika,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);

          this.$router.push("/Pocetna").then(() => {
            window.location.reload();
          });
        } else {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: response.data.message,
            icon: "warning",
          });
        }
      } catch (error) {
        console.error("Login failed:", error);

        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("loginPage.failed"),
          icon: "warning",
        });
      }
    },
  },
};
</script>