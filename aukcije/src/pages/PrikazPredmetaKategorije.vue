<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">

      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">
            Aukcije u kategoriji
          </div>
          <div class="text-grey">
            Pregled aktivnih aukcija odabrane kategorije
          </div>
        </div>
      </div>

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

        <div class="col-12 col-sm-4 col-md-3">
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

      <div v-if="filteredItems.length === 0" class="text-center q-mt-xl text-grey">
        Nema aktivnih aukcija u ovoj kategoriji.
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
                  Završava: {{ formattedDate(item.vrijeme_zavrsetka) }}
                </div>

                <q-badge color="green">Aktivna</q-badge>
              </div>

              <q-btn
                flat
                class="full-width q-mt-md"
                label="Pogledaj aukciju"
                color="primary"
                @click.stop="navigateToItem(item.id_predmeta)"
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

  computed: {
    id_kategorije() {
      return this.$route.query.id_kategorije;
    },

    filteredItems() {
      if (!this.Pretrazivanje) return this.items;

      return this.items.filter(item =>
        item.naziv_predmeta.toLowerCase()
          .includes(this.Pretrazivanje.toLowerCase())
      );
    }
  },

  mounted() {
    this.dohvatiAukcijeKategorije();
  },

  methods: {
    async dohvatiAukcijeKategorije() {
      try {
        const res = await axios.get(
          baseUrl + "get-kategorija-predmet/" + this.id_kategorije
        );

        this.items = res.data;
      } catch (error) {
        console.error("Greška pri dohvaćanju aukcija kategorije:", error);
      }
    },

    formattedDate(dateString) {
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },

    navigateToItem(id) {
      this.$router.push({
        path: "prikaz",
        query: { id_predmeta: id }
      });
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
.auction-card {
  border-radius: 12px;
  transition: 0.3s;
  cursor: pointer;
  overflow: hidden;
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