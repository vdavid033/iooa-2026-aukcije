<template>
  <q-card>
    <div class="row justify-center q-pa-md">
      <q-input
        v-model="Pretrazivanje"
        filled
        :placeholder="t('homePage.searchPlaceholder')"
        dense
        class="q-input--width "
      />

      <div style="width: 227px">
        <q-select
          filled
          dense
          lazy-rules
          emit-value
          v-model="selectedsortianje"
          :label="t('homePage.sortBy')"
          :options="sortiranje"
          option-label="label"
          option-value="value"
          map-options
          @update:model-value="sortiranjeOpcija"
          class="custom-height"
        />
      </div>
    </div>

    <q-separator class="separator" />

    <q-item class="q-pa-sm text-bold text-blue-7" style="font-size: 30px">
      {{ t('homePage.categories') }}
    </q-item>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="item in kategorija" :key="item.id_kategorije" class="q-pa-md" style="width: 400px">
        <q-card @click="navigateToItem1(item.id_kategorije)">
          <q-item-section>
            <q-item class="q-pa-sm text-bold text-blue-7">
              {{ item.naziv_kategorije }}
            </q-item>
          </q-item-section>
        </q-card>
      </div>
    </div>

    <q-item class="q-pa-sm text-bold text-blue-7" style="font-size: 30px">
      {{ t('homePage.latestAuctions') }}
    </q-item>

    <div class="q-pa-sm row flex flex-center">
      <div v-for="item in filteredItems" :key="item.id_predmeta" class="q-pa-md" style="width: 400px;">
        <q-card @click="navigateToItem(item.id_predmeta)">
          <q-img v-if="item.slika" :src="item.slika" no-native-menu />
          <q-item-section>
            <q-item class="q-pa-sm text-bold text-blue-7">{{ item.naziv_predmeta }}</q-item>
            <q-item>{{ t('homePage.startingPrice') }}: {{ item.pocetna_cijena }}$</q-item>
            <q-item>{{ t('homePage.startTime') }}: {{ formattedDate(item.vrijeme_pocetka) }}</q-item>
            <q-item>{{ t('homePage.endTime') }}: {{ formattedDate(item.vrijeme_zavrsetka) }}</q-item>
            <q-item>{{ t('homePage.timeRemaining') }}: {{ item.preostalo_vrijeme }} h</q-item>
            <q-item>{{ t('homePage.currentPrice') }}: {{ item.trenutna_cijena }}$</q-item>
          </q-item-section>
        </q-card>
      </div>
    </div>
  </q-card>
</template>

<script>
import axios from "axios";
import { useI18n } from "vue-i18n";

const baseUrl = "http://localhost:3000/api/";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      Pretrazivanje: "",
      items: [],
      kategorija: [],
      selectedsortianje: "",
    };
  },

  mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(baseUrl + "all-predmet", { headers })
      .then((response) => {
        this.items = response.data;
      })
      .catch((error) => {
        console.error("Error fetching all-predmet:", error);
      });

    axios
      .get(baseUrl + "all-kategorija", { headers })
      .then((response) => {
        this.kategorija = response.data;
      })
      .catch((error) => {
        console.error("Error fetching all-kategorija:", error);
      });
  },

  computed: {
  sortiranje() {
    return [
      { label: this.t("homePage.sortPriceAsc"), value: "price-asc" },
      { label: this.t("homePage.sortPriceDesc"), value: "price-desc" },
      { label: this.t("homePage.sortNameAsc"), value: "name-asc" },
      { label: this.t("homePage.sortNameDesc"), value: "name-desc" },
      { label: this.t("homePage.sortExpiration"), value: "expiration" },
    ];
  },

  filteredItems() {
    if (!this.Pretrazivanje) return this.items;

    const uniqueItemsMap = new Map();

    this.items.forEach((item) => {
      if (
        !uniqueItemsMap.has(item.id_predmeta) &&
        item.naziv_predmeta.toLowerCase().includes(this.Pretrazivanje.toLowerCase())
      ) {
        uniqueItemsMap.set(item.id_predmeta, item);
      }
    });

    return Array.from(uniqueItemsMap.values());
  },
},

  methods: {
    formattedDate(dateString) {
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },

    navigateToItem(id_predmeta) {
      this.$router.push({ path: "prikaz", query: { id_predmeta } });
    },

    navigateToItem1(id_kategorije) {
      this.$router.push({ path: "kategorija", query: { id_kategorije } });
    },

    sortiranjeOpcija(selectedsortianje) {
      switch (selectedsortianje) {
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