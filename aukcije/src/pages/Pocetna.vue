<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">

      <!-- KATEGORIJE -->
      <div class="text-h5 text-weight-bold q-mb-md">{{ $t('homePage.categories') }}</div>

      <div class="row q-col-gutter-md">
        <div
          v-for="cat in prikazaneKategorije"
          :key="cat.id_kategorije"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card
            class="category-card"
            @click="navigateToItem1(cat.id_kategorije)"
          >
            <q-img :src="cat.slika || defaultImg" class="category-img">
              <div class="category-overlay">
                <div class="text-subtitle1 text-weight-bold">
                  {{ $pick(cat.naziv_kategorije, cat.naziv_kategorije_en) }}
                </div>
                <div class="text-caption">
                  {{ cat.count || 0 }} {{ $t('homePage.auctions') }}
                </div>
              </div>
            </q-img>
          </q-card>
        </div>
      </div>

      <div
        v-if="brojPrikazanihKategorija < kategorija.length"
        class="row justify-center q-mt-md"
      >
        <q-btn
          color="primary"
          outline
          :label="$t('homePage.showMore')"
          @click="prikaziViseKategorija"
        />
      </div>

      <!-- AUKCIJE -->
      <div class="row items-center justify-between q-mt-xl q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">
            {{ $t('homePage.latestAuctions') }}
          </div>
          <div class="text-grey">
            {{ $t('homePage.subtitle') }}
          </div>
        </div>

        <q-btn color="primary" :label="$t('homePage.viewAll')" to="/sve-aukcije" />
      </div>

      <!-- SEARCH -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col">
          <q-input
            filled
            v-model="Pretrazivanje"
            :placeholder="$t('homePage.searchPlaceholder')"
            dense
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-3">
          <q-select
            filled
            dense
            v-model="selectedsortianje"
            :options="sortiranje"
            :label="$t('homePage.sortBy')"
            emit-value
            map-options
            @update:model-value="sortiranjeOpcija"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div
          v-for="item in filteredItems"
          :key="item.id_predmeta"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="auction-card" @click="navigateToItem(item.id_predmeta)">
            <q-img :src="item.slika || defaultImg" style="height: 220px">
              <div class="time-badge">
                {{ item.preostalo_vrijeme }}
              </div>
            </q-img>

            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">
                {{ $pick(item.naziv_predmeta, item.naziv_predmeta_en) }}
              </div>

              <div class="q-mt-sm">
                <div class="row justify-between text-caption">
                  <span>{{ $t('homePage.startingPrice') }}:</span>
                  <span>{{ item.pocetna_cijena }}€</span>
                </div>

                <div class="row justify-between text-weight-bold text-primary">
                  <span>{{ $t('homePage.currentPrice') }}:</span>
                  <span>{{ item.trenutna_cijena }}€</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mt-sm">
                <div class="text-caption">
                  {{ item.bids || 0 }} {{ $t('homePage.bids') }}
                </div>

                <q-badge color="green">{{ $t('homePage.active') }}</q-badge>
              </div>

              <q-btn
                flat
                class="full-width q-mt-md"
                :label="$t('homePage.viewAuction')"
                color="primary"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script>
import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

export default {
  data() {
    return {
      Pretrazivanje: "",
      items: [],
      kategorija: [],
      brojPrikazanihKategorija: 8,
      selectedsortianje: "",
      defaultImg: "https://via.placeholder.com/400",
    };
  },

  mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(baseUrl + "all-predmet", { headers })
      .then(res => this.items = res.data);

    axios.get(baseUrl + "all-kategorija", { headers })
      .then(res => this.kategorija = res.data);
  },

  computed: {
    sortiranje() {
      return [
        { label: this.$t('homePage.sortPriceAsc'), value: "price-asc" },
        { label: this.$t('homePage.sortPriceDesc'), value: "price-desc" },
        { label: this.$t('homePage.sortNameAsc'), value: "name-asc" },
        { label: this.$t('homePage.sortNameDesc'), value: "name-desc" },
        { label: this.$t('homePage.sortExpiration'), value: "expiration" }
      ];
    },

    prikazaneKategorije() {
      return this.kategorija.slice(0, this.brojPrikazanihKategorija);
    },

    filteredItems() {
      if (!this.Pretrazivanje) return this.items;

      return this.items.filter(item =>
        item.naziv_predmeta.toLowerCase()
          .includes(this.Pretrazivanje.toLowerCase())
      );
    }
  },

  methods: {
    navigateToItem(id) {
      this.$router.push({ path: "prikaz", query: { id_predmeta: id } });
    },

    navigateToItem1(id) {
      this.$router.push({ path: "kategorija", query: { id_kategorije: id } });
    },

    prikaziViseKategorija() {
      this.brojPrikazanihKategorija += 8;
    },

    sortiranjeOpcija(val) {
      switch (val) {
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
          this.items.sort((a, b) =>
            new Date(a.vrijeme_zavrsetka) - new Date(b.vrijeme_zavrsetka)
          );
          break;
      }
    }
  }
};
</script>

<style scoped>
.category-card {
  overflow: hidden;
  border-radius: 12px;
  transition: 0.3s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-img {
  height: 220px;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.auction-card {
  border-radius: 12px;
  transition: 0.3s;
}

.auction-card:hover {
  transform: translateY(-5px);
}

.time-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}
</style>