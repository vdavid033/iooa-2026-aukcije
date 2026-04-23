<template>
  <div class="row justify-center q-pa-md">
    <q-input
      v-model="search"
      filled
      :placeholder="t('categoryPage.searchAuctions')"
      dense
      class="q-input--width"
    />

    <div style="width: 227px">
      <q-select
        filled
        lazy-rules
        emit-value
        v-model="selectedSort"
        :label="t('categoryPage.sortBy')"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        map-options
        @update:model-value="sortItems"
      />
    </div>
  </div>

  <q-separator class="separator" />

  <q-item class="q-pa-sm text-bold text-blue-7" style="font-size: 30px"></q-item>

  <div class="q-pa-sm row flex flex-center">
    <div
      v-for="item in filteredItems"
      :key="item.id_predmeta"
      class="q-pa-md"
      style="width: 400px"
    >
      <q-card @click="goToItem(item.id_predmeta)">
        <q-img v-if="item.slika" :src="item.slika" no-native-menu />

        <q-item-section>
          <q-item class="q-pa-sm text-bold text-blue-7">
            {{ item.naziv_predmeta }}
          </q-item>
          <q-item>
            {{ t("categoryPage.startingPrice") }}: {{ item.pocetna_cijena }}$
          </q-item>
          <q-item>
            {{ t("categoryPage.startTime") }}: {{ formatDate(item.vrijeme_pocetka) }}
          </q-item>
          <q-item>
            {{ t("categoryPage.endTime") }}: {{ formatDate(item.vrijeme_zavrsetka) }}
          </q-item>
          <q-item>
            {{ t("categoryPage.remainingTime") }}:
            {{ t("categoryPage.remainingHours", { hours: item.preostalo_vrijeme }) }}
          </q-item>
          <q-item>
            {{ t("categoryPage.currentPrice") }}: {{ item.trenutna_cijena }}$
          </q-item>
        </q-item-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";

const baseUrl = "http://localhost:3000/api/";

export default {
  name: "CategoryItems",

  setup() {
    const { t, locale } = useI18n();

    return {
      t,
      locale,
      dialog: ref(false),
      small: ref(false),
      model: ref(null),
    };
  },

  data() {
    return {
      search: "",
      items: [],
      selectedSort: "",
    };
  },

  computed: {
    categoryId() {
      return this.$route.query.id_kategorije;
    },

    sortOptions() {
      return [
        { label: this.t("categoryPage.sortPriceAsc"), value: "price-asc" },
        { label: this.t("categoryPage.sortPriceDesc"), value: "price-desc" },
        { label: this.t("categoryPage.sortNameAsc"), value: "name-asc" },
        { label: this.t("categoryPage.sortNameDesc"), value: "name-desc" },
        { label: this.t("categoryPage.sortExpiration"), value: "expiration" },
      ];
    },

    filteredItems() {
      if (!this.search) return this.items;

      const uniqueItemsMap = new Map();

      this.items.forEach((item) => {
        if (
          !uniqueItemsMap.has(item.id_predmeta) &&
          item.naziv_predmeta.toLowerCase().includes(this.search.toLowerCase())
        ) {
          uniqueItemsMap.set(item.id_predmeta, item);
        }
      });

      return Array.from(uniqueItemsMap.values());
    },
  },

  mounted() {
    axios
      .get(baseUrl + "get-kategorija-predmet/" + this.categoryId)
      .then((response) => {
        this.items = response.data;
      })
      .catch((error) => {
        console.error("Error fetching category items:", error);
      });
  },

  methods: {
    formatDate(dateString) {
      const localeMap = {
        hr: "hr-HR",
        en: "en-US",
      };

      const currentLocale = localeMap[this.locale] || this.locale || "en-US";
      return new Date(dateString).toLocaleString(currentLocale).replace(",", "");
    },

    goToItem(id_predmeta) {
      this.$router.push({ path: "prikaz", query: { id_predmeta } });
    },

    sortItems(selectedSort) {
      switch (selectedSort) {
        case "price-asc":
          this.items.sort((a, b) => a.pocetna_cijena - b.pocetna_cijena);
          break;
        case "price-desc":
          this.items.sort((a, b) => b.pocetna_cijena - a.pocetna_cijena);
          break;
        case "name-asc":
          this.items.sort((a, b) =>
            a.naziv_predmeta.localeCompare(b.naziv_predmeta)
          );
          break;
        case "name-desc":
          this.items.sort((a, b) =>
            b.naziv_predmeta.localeCompare(a.naziv_predmeta)
          );
          break;
        case "expiration":
          this.items.sort(
            (a, b) =>
              new Date(a.vrijeme_zavrsetka) - new Date(b.vrijeme_zavrsetka)
          );
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