<template>
  <q-page class="bg-grey-2">

    <div class="q-pa-md">

      <!-- KATEGORIJE -->
      <div class="text-h5 text-weight-bold q-mb-md">Kategorije</div>

      <div class="row q-col-gutter-md">
        <div
          v-for="cat in kategorija"
          :key="cat.id_kategorije"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card
            class="category-card"
            @click="navigateToItem1(cat.id_kategorije)"
          >
            <q-img :src="cat.slika || defaultImg" style="height: 220px">
              <div class="absolute-bottom text-white q-pa-sm">
                <div class="text-subtitle1 text-weight-bold">
                  {{ cat.naziv_kategorije }}
                </div>
                <div class="text-caption">
                  {{ cat.count || 0 }} aukcija
                </div>
              </div>
            </q-img>
          </q-card>
        </div>
      </div>

      <!-- AUKCIJE -->
      <div class="row items-center justify-between q-mt-xl q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">
            Zadnje ili trenutne aukcije
          </div>
          <div class="text-grey">
            Najnovije i najpopularnije aukcije
          </div>
        </div>

        <q-btn color="primary" label="Vidi sve" />
      </div>

      <!-- SEARCH -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col">
          <q-input
            filled
            v-model="Pretrazivanje"
            placeholder="Pretraži aukcije..."
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
            label="Sortiraj po"
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
                {{ item.preostalo_vrijeme }}h
              </div>
            </q-img>

            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">
                {{ item.naziv_predmeta }}
              </div>

              <div class="q-mt-sm">
                <div class="row justify-between text-caption">
                  <span>Početna:</span>
                  <span>{{ item.pocetna_cijena }}€</span>
                </div>

                <div class="row justify-between text-weight-bold text-primary">
                  <span>Trenutna:</span>
                  <span>{{ item.trenutna_cijena }}€</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mt-sm">
                <div class="text-caption">
                  {{ item.bids || 0 }} ponuda
                </div>

                <q-badge color="green">Aktivna</q-badge>
              </div>

              <q-btn
                flat
                class="full-width q-mt-md"
                label="Pogledaj aukciju"
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
      selectedsortianje: "",
      defaultImg: "https://via.placeholder.com/400",

      sortiranje: [
        { label: "Cijena: Niska - Visoka", value: "price-asc" },
        { label: "Cijena: Visoka - Niska", value: "price-desc" },
        { label: "Naziv A-Z", value: "name-asc" },
        { label: "Naziv Z-A", value: "name-desc" },
        { label: "Završava uskoro", value: "expiration" }
      ]
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

    sortiranjeOpcija(val) {
      switch (val) {
        case "price-asc":
          this.items.sort((a,b)=>a.pocetna_cijena-b.pocetna_cijena);
          break;
        case "price-desc":
          this.items.sort((a,b)=>b.pocetna_cijena-a.pocetna_cijena);
          break;
        case "name-asc":
          this.items.sort((a,b)=>a.naziv_predmeta.localeCompare(b.naziv_predmeta));
          break;
        case "name-desc":
          this.items.sort((a,b)=>b.naziv_predmeta.localeCompare(a.naziv_predmeta));
          break;
        case "expiration":
          this.items.sort((a,b)=>new Date(a.vrijeme_zavrsetka)-new Date(b.vrijeme_zavrsetka));
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
}
.category-card:hover {
  transform: translateY(-5px);
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