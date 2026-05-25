<template>
  <q-page class="window-height window-width row justify-center items-center gradient-bg">

    <div class="column items-center">

      <q-card class="q-pa-xl shadow-10 rounded-card" style="width: 380px">

        <div class="text-center q-mb-md">
          <q-avatar size="70px" class="bg-primary text-white shadow-5">
            <q-icon name="login" size="40px" />
          </q-avatar>
        </div>

        <div class="text-center q-mb-lg">
          <div class="text-h5 text-weight-bold">Prijava</div>
          <div class="text-grey">Pristupite svom računu</div>
        </div>

        <q-form class="q-gutter-md" @submit.prevent="login">

          <q-input filled v-model="email_korisnika" type="email" label="Vaš email">
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            filled
            :type="showPassword ? 'text' : 'password'"
            v-model="lozinka_korisnika"
            label="Lozinka"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>

            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            class="full-width q-mt-md"
            size="lg"
            type="submit"
            label="PRIJAVA"
            color="primary"
            unelevated
          />

        </q-form>

        <div class="text-center q-mt-md">
          <router-link to="registracija" class="text-primary">
            Registrirajte se
          </router-link>
        </div>

      </q-card>
    </div>

  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email_korisnika: "",
      lozinka_korisnika: "",
      showPassword: false
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
          message: "Prijava nije uspjela. Provjerite podatke.",
          icon: "warning",
        });
      }
    },
  },
};
</script>

<style>
.gradient-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb, #4f46e5);
}

.rounded-card {
  border-radius: 20px;
}
</style>