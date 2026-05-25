<template>
  <q-page class="window-height window-width row justify-center items-center gradient-bg">

    <div class="column items-center">
      
      <q-card class="q-pa-xl shadow-10 rounded-card" style="width: 400px">

        <div class="text-center q-mb-md">
          <q-avatar size="70px" class="bg-primary text-white shadow-5">
            <q-icon name="person" size="40px" />
          </q-avatar>
        </div>

        <div class="text-center q-mb-lg">
          <div class="text-h5 text-weight-bold">Registracija</div>
          <div class="text-grey">Kreirajte svoj račun</div>
        </div>

        <q-form class="q-gutter-md" @submit="provjera">

          <q-input filled v-model="ime_korisnika" label="Vaše ime">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input filled v-model="prezime_korisnika" label="Vaše prezime">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

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

          <q-input
            filled
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="provjera_lozinke"
            label="Ponovi lozinku"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>

            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <q-input filled v-model="adresa_korisnika" label="Adresa">
            <template v-slot:prepend>
              <q-icon name="place" />
            </template>
          </q-input>

          <q-btn
            class="full-width q-mt-md"
            size="lg"
            type="submit"
            label="REGISTRACIJA"
            color="primary"
            unelevated
          />

        </q-form>

        <div class="text-center q-mt-md">
          <router-link to="prijava" class="text-primary">
            Prijavi se
          </router-link>
        </div>

        <div class="text-center">
          <span class="text-grey">Nastavi kao gost</span>
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
      ime_korisnika: '',
      prezime_korisnika: '',
      email_korisnika: '',
      lozinka_korisnika: '',
      provjera_lozinke: '',
      adresa_korisnika: '',
      showPassword: false,
      showConfirmPassword: false
    }
  },

  methods: {

    async registracija() {
      const podaciZaReg = {
        ime: this.ime_korisnika,
        prezime: this.prezime_korisnika,
        email: this.email_korisnika,
        lozinka: this.lozinka_korisnika,
        adresa: this.adresa_korisnika,
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/regaKorisnika",
          podaciZaReg
        );

        console.log(response.data);

        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: 'Registracija uspješna!'
        })

      } catch (error) {

        if (error.response && error.response.data.sqlState === '23000') {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'E-mail već u upotrebi!',
            icon: 'warning'
          });
        } else {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Greška pri registraciji!',
            icon: 'warning'
          });
        }

        console.error(error);
      }
    },

    usporedba_lozinki() {
      if (this.lozinka_korisnika !== this.provjera_lozinke) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Lozinke se ne podudaraju!',
          icon: 'warning'
        })
      } else {
        this.registracija()
      }
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
          color: 'negative',
          position: 'top',
          message: 'Niste popunili sva polja!',
          icon: 'warning'
        })
      } else {
        this.usporedba_lozinki()
      }
    }
  }
}
</script>

<style>
.gradient-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb, #4f46e5);
}

.rounded-card {
  border-radius: 20px;
}
</style>