<template>
  <q-page class="bg-grey-2">
    <div class="q-pa-md">

      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold">{{ $t('allAuctionsPage.title') }}</div>
          <div class="text-grey">
            {{ $t('allAuctionsPage.subtitle') }}
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
            :placeholder="$t('allAuctionsPage.searchPlaceholder')"
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
            :label="$t('allAuctionsPage.statusLabel')"
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
            :label="$t('allAuctionsPage.sortBy')"
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
              <q-btn
                class="save-button"
                round
                dense
                flat
                :color="jeSpremljena(item.id_predmeta) ? 'negative' : 'grey-8'"
                :icon="
                  jeSpremljena(item.id_predmeta)
                    ? 'favorite'
                    : 'favorite_border'
                "
                :disable="spremanjeIds.includes(Number(item.id_predmeta))"
                @click.stop="promijeniSpremanje(item)"
              >
                <q-tooltip>
                  {{
                    jeSpremljena(item.id_predmeta)
                      ? $t("savedAuctions.remove")
                      : $t("savedAuctions.save")
                  }}
                </q-tooltip>
              </q-btn>

              <div
                class="time-badge"
                :class="isActive(item) ? 'bg-red' : 'bg-grey-8'"
                >
                {{ isActive(item) ? item.preostalo_vrijeme : $t('allAuctionsPage.finished') }}
                </div>
            </q-img>

            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">
                {{ $pick(item.naziv_predmeta, item.naziv_predmeta_en) }}
              </div>

              <div class="q-mt-sm">
                <div class="row justify-between text-caption">
                  <span>{{ $t('allAuctionsPage.startingPrice') }}:</span>
                  <span>{{ item.pocetna_cijena }}€</span>
                </div>

                <div class="row justify-between text-weight-bold text-primary">
                  <span>{{ $t('allAuctionsPage.currentPrice') }}:</span>
                  <span>{{ item.trenutna_cijena }}€</span>
                </div>

                <div class="row justify-between text-caption q-mt-xs">
                  <span>{{ $t('allAuctionsPage.endsAt') }}:</span>
                  <span>{{ formatDate(item.vrijeme_zavrsetka) }}</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mt-sm">
                <div class="text-caption">
                  {{ item.bids || 0 }} {{ $t('allAuctionsPage.bids') }}
                </div>

                <q-badge :color="isActive(item) ? 'green' : 'grey'">
                  {{ isActive(item) ? $t('allAuctionsPage.active') : $t('allAuctionsPage.finished') }}
                </q-badge>
              </div>

              <q-btn
                flat
                class="full-width q-mt-md"
                :label="$t('allAuctionsPage.viewAuction')"
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
        {{ $t('allAuctionsPage.noAuctions') }}
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
      spremljeniIds: [],
      spremanjeIds: [],
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

    this.dohvatiSpremljeneAukcije();
  },

  computed: {
    statusOpcije() {
      return [
        { label: this.$t('allAuctionsPage.statusAll'), value: "sve" },
        { label: this.$t('allAuctionsPage.statusActive'), value: "aktivne" },
        { label: this.$t('allAuctionsPage.statusFinished'), value: "zavrsene" }
      ];
    },

    sortiranjeOpcije() {
      return [
        { label: this.$t('allAuctionsPage.sortNewest'), value: "newest" },
        { label: this.$t('allAuctionsPage.sortPriceAsc'), value: "price-asc" },
        { label: this.$t('allAuctionsPage.sortPriceDesc'), value: "price-desc" },
        { label: this.$t('allAuctionsPage.sortNameAsc'), value: "name-asc" },
        { label: this.$t('allAuctionsPage.sortNameDesc'), value: "name-desc" },
        { label: this.$t('allAuctionsPage.sortEndingSoon'), value: "ending-soon" }
      ];
    },

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
    async dohvatiSpremljeneAukcije() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(baseUrl + "spremljene-aukcije", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.spremljeniIds = response.data.map((item) =>
          Number(item.id_predmeta),
        );
      } catch (error) {
        console.error("Greška pri dohvatu spremljenih aukcija:", error);
      }
    },

    jeSpremljena(idPredmeta) {
      return this.spremljeniIds.includes(Number(idPredmeta));
    },

    async promijeniSpremanje(item) {
      const token = localStorage.getItem("token");
      const idPredmeta = Number(item.id_predmeta);

      if (!token) {
        this.$q.notify({
          type: "warning",
          message: this.$t("savedAuctions.loginRequired"),
        });
        return;
      }

      if (!this.isActive(item)) {
        this.$q.notify({
          type: "warning",
          message: this.$t("savedAuctions.finished"),
        });
        return;
      }

      if (this.spremanjeIds.includes(idPredmeta)) return;
      this.spremanjeIds.push(idPredmeta);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        if (this.jeSpremljena(idPredmeta)) {
          await axios.delete(baseUrl + "spremljene-aukcije/" + idPredmeta, {
            headers,
          });
          this.spremljeniIds = this.spremljeniIds.filter(
            (id) => id !== idPredmeta,
          );
          this.$q.notify({
            type: "positive",
            message: this.$t("savedAuctions.removed"),
          });
        } else {
          await axios.post(
            baseUrl + "spremljene-aukcije/" + idPredmeta,
            {},
            { headers },
          );
          this.spremljeniIds.push(idPredmeta);
          this.$q.notify({
            type: "positive",
            message: this.$t("savedAuctions.saved"),
          });
        }
      } catch (error) {
        console.error("Greška pri promjeni spremljene aukcije:", error);
        this.$q.notify({
          type: "negative",
          message: this.$t("savedAuctions.error"),
        });
      } finally {
        this.spremanjeIds = this.spremanjeIds.filter(
          (id) => id !== idPredmeta,
        );
      }
    },

    navigateToItem(id) {
      this.$router.push({ path: "prikaz", query: { id_predmeta: id } });
    },

    isActive(item) {
      if (!item.vrijeme_zavrsetka) return true;
      return new Date(item.vrijeme_zavrsetka) > new Date();
    },

    formatDate(date) {
      if (!date) return this.$t('allAuctionsPage.notDefined');

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

.save-button {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
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
