<template>
  <q-card>
    <div class="row justify-center items-start q-pa-md q-gutter-sm">
      <div>
        <q-input
          v-model="Pretrazivanje"
          filled
          placeholder="Pretraži aukcije po nazivu ili opisu"
          dense
          class="q-input--width"
          @keyup.enter="pretraziAukcije"
        />
        <div v-if="porukaPretrage" class="text-negative q-mt-xs">
          {{ porukaPretrage }}
        </div>
      </div>

      <q-btn
        color="primary"
        label="Pretraži"
        :loading="ucitavanjePretrage"
        @click="pretraziAukcije"
      />

      <q-btn
        v-if="pretragaAktivna"
        flat
        color="primary"
        label="Prikaži sve"
        @click="resetirajPretragu"
      />

      <div style="width: 227px">
        <q-select filled dense lazy-rules emit-value v-model="selectedsortianje" label="Sortiraj po" :options="sortiranje" option-label="label" option-value="value" map-options @update:model-value="sortiranjeOpcija" class="custom-height" />
      </div>
    </div>
    <q-separator class="separator" />
    <q-item class="q-pa-sm text-bold text-blue-7" style="font-size: 30px">Kategorije </q-item>
    <div class="q-pa-sm row flex flex-center">
      <div v-for="item in kategorija" :key="item.id_kategorije" class="q-pa-md" style="width: 400px">
        <q-card @click="navigateToItem1(item.id_kategorije)">
          <q-item-section>
            <q-item class="q-pa-sm text-bold text-blue-7">{{ item.naziv_kategorije }} </q-item>
          </q-item-section>
        </q-card>
      </div>
    </div>

    <q-item class="q-pa-sm text-bold text-blue-7" style="font-size: 30px">
      {{ pretragaAktivna ? "Rezultati pretrage" : "Zadnje ili trenutne aukcije" }}
    </q-item>

    <div v-if="pretragaAktivna && items.length === 0 && !ucitavanjePretrage" class="q-pa-md text-center text-grey-8">
      Nema aukcija koje odgovaraju unesenoj ključnoj riječi.
    </div>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="item in items" :key="item.id_predmeta" class="q-pa-md" style="width: 400px;">
        <q-card @click="navigateToItem(item.id_predmeta)">
          <q-img v-if="item.slika" :src="item.slika" no-native-menu />
          <q-item-section>
            <q-item class="q-pa-sm text-bold text-blue-7">{{ item.naziv_predmeta }} </q-item>
            <q-item>Početna cijena: {{ item.pocetna_cijena }}$</q-item>
            <q-item>Vrijeme pocetka: {{ formattedDate(item.vrijeme_pocetka) }}</q-item>
            <q-item>Vrijeme zavrsetka: {{ formattedDate(item.vrijeme_zavrsetka) }}</q-item>
            <q-item>Preostalo vrijeme aukcije: {{ item.preostalo_vrijeme }} h </q-item>
            <q-item>Trenutna cijena: {{ item.trenutna_cijena }}$</q-item>
          </q-item-section>
        </q-card>
      </div>
    </div>
  </q-card>
</template>

<script>
import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

export default {
  setup() {
    return {};
  },
  data() {
    return {
      Pretrazivanje: "",
      items: [],
      kategorija: [],
      selectedsortianje: "",
      pretragaAktivna: false,
      porukaPretrage: "",
      ucitavanjePretrage: false,
      sortiranje: [
        { label: "Cijena: manja prema većoj", value: "price-asc" },
        { label: "Cijena: veća prema manjoj", value: "price-desc" },
        { label: "Naziv: A do Z", value: "name-asc" },
        { label: "Naziv: Z do A", value: "name-desc" },
        { label: "Vrijeme isteka", value: "expiration" },
      ],
    };
  },
  mounted() {
    this.dohvatiSveAukcije();
    this.dohvatiKategorije();
  },

  methods: {
    formattedDate(dateString) {
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },

    dohvatiSveAukcije() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      axios
        .get(baseUrl + "all-predmet", { headers })
        .then((response) => {
          this.items = response.data;
          this.primijeniTrenutnoSortiranje();
        })
        .catch((error) => {
          console.error("Error fetching all-predmet:", error);
        });
    },

    dohvatiKategorije() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      axios
        .get(baseUrl + "all-kategorija", { headers })
        .then((response) => {
          this.kategorija = response.data;
        })
        .catch((error) => {
          console.error("Error fetching all-kategorija:", error);
        });
    },

    pretraziAukcije() {
      const keyword = this.Pretrazivanje.trim();
      this.porukaPretrage = "";

      if (!keyword) {
        this.porukaPretrage = "Unesite ključnu riječ za pretraživanje.";
        return;
      }

      this.ucitavanjePretrage = true;

      axios
        .get(baseUrl + "pretrazi-predmet", {
          params: { keyword },
        })
        .then((response) => {
          this.items = response.data;
          this.pretragaAktivna = true;
          this.primijeniTrenutnoSortiranje();
        })
        .catch((error) => {
          console.error("Greška kod pretrage aukcija:", error);
          this.porukaPretrage = "Došlo je do greške kod pretrage aukcija.";
        })
        .finally(() => {
          this.ucitavanjePretrage = false;
        });
    },

    resetirajPretragu() {
      this.Pretrazivanje = "";
      this.porukaPretrage = "";
      this.pretragaAktivna = false;
      this.dohvatiSveAukcije();
    },

    navigateToItem(id_predmeta) {
      this.$router.push({ path: "prikaz", query: { id_predmeta } });
    },

    navigateToItem1(id_kategorije) {
      this.$router.push({ path: "kategorija", query: { id_kategorije } });
    },

    sortiranjeOpcija(selectedsortianje) {
      this.selectedsortianje = selectedsortianje;
      this.primijeniTrenutnoSortiranje();
    },

    primijeniTrenutnoSortiranje() {
      switch (this.selectedsortianje) {
        case "price-asc":
          this.items.sort((a, b) => a.pocetna_cijena - b.pocetna_cijena);
          break;
        case "price-desc":
          this.items.sort((a, b) => b.pocetna_cijena - a.pocetna_cijena);
          break;
        case "name-asc":
          this.items.sort((a, b) => a.naziv_predmeta.localeCompare(b.naziv_predmeta));
          break;
        case "name-desc":
          this.items.sort((a, b) => b.naziv_predmeta.localeCompare(a.naziv_predmeta));
          break;
        case "expiration":
          this.items.sort((a, b) => new Date(a.vrijeme_zavrsetka) - new Date(b.vrijeme_zavrsetka));
          break;
      }
    },
  },
};
</script>
<style>
/*.q-carousel {
    height: 300px;
    max-width: 500px;*/
.q-img {
  height: 300px;
  max-width: 500px;
}

.q-input--width {
  width: 500px;
}

.separator {
  background-color: #1976d2;
}
</style>
