<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">

      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">Sve aukcije</div>
          <div class="text-grey">
            Pregled aktivnih i završenih aukcija
          </div>
        </div>

      </div>

      <!-- FILTERI -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-5">
          <q-input
            filled
            dense
            v-model="pretrazivanje"
            placeholder="Pretraži aukcije..."
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-select
            filled
            dense
            v-model="statusFilter"
            :options="statusOpcije"
            label="Status aukcije"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-4">
          <q-select
            filled
            dense
            v-model="sortiranje"
            :options="sortiranjeOpcije"
            label="Sortiraj po"
            emit-value
            map-options
          />
        </div>
      </div>

      <!-- AUKCIJE -->
      <div class="row q-col-gutter-md">
        <div
          v-for="item in filtriraneAukcije"
          :key="item.id_predmeta"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="auction-card" @click="navigateToItem(item.id_predmeta)">
            <q-img :src="item.slika || defaultImg" style="height: 220px">
              <div
                class="time-badge"
                :class="isActive(item) ? 'bg-red' : 'bg-grey-8'"
                >
                {{ isActive(item) ? item.preostalo_vrijeme : 'Završena' }}
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

                <div class="row justify-between text-caption q-mt-xs">
                  <span>Završetak:</span>
                  <span>{{ formatDate(item.vrijeme_zavrsetka) }}</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mt-sm">
                <div class="text-caption">
                  {{ item.bids || 0 }} ponuda
                </div>

                <q-badge :color="isActive(item) ? 'green' : 'grey'">
                  {{ isActive(item) ? 'Aktivna' : 'Završena' }}
                </q-badge>
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

      <div
        v-if="filtriraneAukcije.length === 0"
        class="text-center text-grey q-mt-xl"
      >
        Nema aukcija za prikaz.
      </div>

    </div>
  </q-page>
</template>

<script>
import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

export default {
  name: "SveAukcije",

  data() {
    return {
      aukcije: [],
      pretrazivanje: "",
      statusFilter: "sve",
      sortiranje: "newest",
      defaultImg: "https://via.placeholder.com/400",

      statusOpcije: [
        { label: "Sve aukcije", value: "sve" },
        { label: "Aktivne aukcije", value: "aktivne" },
        { label: "Završene aukcije", value: "zavrsene" }
      ],

      sortiranjeOpcije: [
        { label: "Najnovije", value: "newest" },
        { label: "Cijena: Niska - Visoka", value: "price-asc" },
        { label: "Cijena: Visoka - Niska", value: "price-desc" },
        { label: "Naziv A-Z", value: "name-asc" },
        { label: "Naziv Z-A", value: "name-desc" },
        { label: "Završava uskoro", value: "ending-soon" }
      ]
    };
  },

  mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(baseUrl + "all-predmet", { headers })
      .then(res => {
        this.aukcije = res.data;
      })
      .catch(err => {
        console.error("Greška kod dohvata aukcija:", err);
      });
  },

  computed: {
    filtriraneAukcije() {
      let rezultat = [...this.aukcije];

      if (this.pretrazivanje) {
        rezultat = rezultat.filter(item =>
          item.naziv_predmeta &&
          item.naziv_predmeta.toLowerCase()
            .includes(this.pretrazivanje.toLowerCase())
        );
      }

      if (this.statusFilter === "aktivne") {
        rezultat = rezultat.filter(item => this.isActive(item));
      }

      if (this.statusFilter === "zavrsene") {
        rezultat = rezultat.filter(item => !this.isActive(item));
      }

      switch (this.sortiranje) {
        case "price-asc":
          rezultat.sort((a, b) => a.trenutna_cijena - b.trenutna_cijena);
          break;

        case "price-desc":
          rezultat.sort((a, b) => b.trenutna_cijena - a.trenutna_cijena);
          break;

        case "name-asc":
          rezultat.sort((a, b) =>
            a.naziv_predmeta.localeCompare(b.naziv_predmeta)
          );
          break;

        case "name-desc":
          rezultat.sort((a, b) =>
            b.naziv_predmeta.localeCompare(a.naziv_predmeta)
          );
          break;

        case "ending-soon":
          rezultat.sort((a, b) =>
            new Date(a.vrijeme_zavrsetka) - new Date(b.vrijeme_zavrsetka)
          );
          break;

        case "newest":
        default:
          rezultat.sort((a, b) => b.id_predmeta - a.id_predmeta);
          break;
      }

      return rezultat;
    }
  },

  methods: {
    navigateToItem(id) {
      this.$router.push({ path: "prikaz", query: { id_predmeta: id } });
    },

    isActive(item) {
      if (!item.vrijeme_zavrsetka) return true;
      return new Date(item.vrijeme_zavrsetka) > new Date();
    },

    formatDate(date) {
      if (!date) return "Nije definirano";

      return new Date(date).toLocaleDateString("hr-HR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
  }
};
</script>

<style scoped>
.auction-card {
  border-radius: 12px;
  transition: 0.3s;
  cursor: pointer;
}

.auction-card:hover {
  transform: translateY(-5px);
}

.time-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}
</style>