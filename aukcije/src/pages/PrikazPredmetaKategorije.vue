<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">

      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">
            {{ $t('categoryPage.title') }}
          </div>
          <div class="text-grey">
            {{ $t('categoryPage.subtitle') }}
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col">
          <q-input
            filled
            v-model="Pretrazivanje"
            :placeholder="$t('categoryPage.searchAuctions')"
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
            :label="$t('categoryPage.sortBy')"
            emit-value
            map-options
            @update:model-value="sortiranjeOpcija"
          />
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="text-center q-mt-xl text-grey">
        {{ $t('categoryPage.noItems') }}
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
                  <span>{{ $t('categoryPage.startingPrice') }}:</span>
                  <span>{{ item.pocetna_cijena }}€</span>
                </div>

                <div class="row justify-between text-weight-bold text-primary">
                  <span>{{ $t('categoryPage.currentPrice') }}:</span>
                  <span>{{ item.trenutna_cijena }}€</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mt-sm">
                <div class="text-caption">
                  {{ $t('categoryPage.endsLabel') }}: {{ formattedDate(item.vrijeme_zavrsetka) }}
                </div>

                <q-badge color="green">{{ $t('categoryPage.active') }}</q-badge>
              </div>

              <q-btn
                flat
                class="full-width q-mt-md"
                :label="$t('categoryPage.viewAuction')"
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
import { jwtDecode } from "jwt-decode";
import socket, { SOCKET_EVENTS } from "../socket";

const baseUrl = "http://localhost:3000/api/";

export default {
  data() {
    return {
      Pretrazivanje: "",
      items: [],
      joinedPredmeti: new Set(),
      cijenaAzuriranaHandler: null,
      selectedsortianje: "",
      defaultImg: "https://via.placeholder.com/400",
    };
  },

  computed: {
    sortiranje() {
      return [
        { label: this.$t('categoryPage.sortPriceAsc'), value: "price-asc" },
        { label: this.$t('categoryPage.sortPriceDesc'), value: "price-desc" },
        { label: this.$t('categoryPage.sortNameAsc'), value: "name-asc" },
        { label: this.$t('categoryPage.sortNameDesc'), value: "name-desc" },
        { label: this.$t('categoryPage.sortExpiration'), value: "expiration" }
      ];
    },

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

  async mounted() {
    await this.dohvatiAukcijeKategorije();
    this.setupSocket();
  },

  beforeUnmount() {
    this.cleanupSocket();
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

    setupSocket() {
      this.cleanupSocket();
      if (!socket.connected) {
        socket.connect();
      }

      this.cijenaAzuriranaHandler = ({
        id_predmeta,
        trenutna_cijena,
        id_korisnika,
      }) => {
        const item = this.items.find(
          (predmet) => Number(predmet.id_predmeta) === Number(id_predmeta),
        );

        if (!item) return;

        item.trenutna_cijena = trenutna_cijena;

        const currentUserId = this.getCurrentUserId();

        if (
          id_korisnika !== undefined &&
          id_korisnika !== null &&
          Number(id_korisnika) !== Number(currentUserId)
        ) {
          this.$q.notify({
            type: "info",
            message: "Cijena predmeta je ažurirana.",
          });
        }
      };

      socket.on(SOCKET_EVENTS.cijenaAzurirana, this.cijenaAzuriranaHandler);

      this.items.forEach((item) => {
        if (!item.id_predmeta) return;
        if (this.joinedPredmeti.has(item.id_predmeta)) return;

        this.joinedPredmeti.add(item.id_predmeta);
        socket.emit(SOCKET_EVENTS.joinPredmet, item.id_predmeta);
      });
    },
    cleanupSocket() {
      if (this.cijenaAzuriranaHandler) {
        socket.off(SOCKET_EVENTS.cijenaAzurirana, this.cijenaAzuriranaHandler);
        this.cijenaAzuriranaHandler = null;
      }

      this.joinedPredmeti.forEach((id_predmeta) => {
        socket.emit(SOCKET_EVENTS.leavePredmet, id_predmeta);
      });
      this.joinedPredmeti.clear();
    },
    getCurrentUserId() {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        return jwtDecode(token).id;
      } catch {
        return null;
      }
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
