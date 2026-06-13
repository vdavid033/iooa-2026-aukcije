<template>
  <q-card>
    <q-card-section>
      <div class="text-h3 text-bold text-center text-blue-7">Lista praćenja</div>
    </q-card-section>
    <q-separator color="red" />

    <div v-if="items.length === 0" class="q-pa-lg text-center text-grey-6" style="font-size: 18px">
      Nema praćenih aukcija.
    </div>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="item in items" :key="item.id_lista" class="q-pa-md" style="width: 400px">
        <q-card>
          <q-img v-if="item.slika" :src="item.slika" @click="navigateToItem(item.id_predmeta)" style="cursor: pointer" />
          <q-item-section @click="navigateToItem(item.id_predmeta)" style="cursor: pointer">
            <q-item class="q-pa-sm text-bold text-blue-7">{{ item.naziv_predmeta }}</q-item>
            <q-item>Početna cijena: {{ item.pocetna_cijena }}$</q-item>
            <q-item>Završava: {{ formattedDate(item.vrijeme_zavrsetka) }}</q-item>
            <q-item>Trenutna cijena: {{ item.trenutna_cijena }}$</q-item>
          </q-item-section>
          <q-card-actions align="right">
            <q-btn
              flat
              icon="visibility_off"
              color="grey-7"
              label="Ukloni"
              @click="ukloniSaWatchliste(item.id_predmeta)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-card>
</template>

<script>
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default {
  data() {
    return {
      items: [],
    };
  },

  mounted() {
    this.ucitajWatchlist();
  },

  methods: {
    ucitajWatchlist() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/prijava");
        return;
      }
      const decodedToken = jwtDecode(token);
      const headers = { Authorization: `Bearer ${token}` };

      axios
        .get(`http://localhost:3000/api/watchlist/${decodedToken.id}`, { headers })
        .then((response) => {
          this.items = response.data;
        })
        .catch(() => {});
    },

    ukloniSaWatchliste(id_predmeta) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      axios
        .delete(`http://localhost:3000/api/watchlist/${id_predmeta}`, { headers })
        .then(() => {
          this.items = this.items.filter((item) => item.id_predmeta !== id_predmeta);
        })
        .catch(() => {});
    },

    navigateToItem(id_predmeta) {
      this.$router.push({ path: "/prikaz", query: { id_predmeta } });
    },

    formattedDate(dateString) {
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },
  },
};
</script>
