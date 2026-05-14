<template>
  <q-card class="q-pa-sm q-gutter-sm" flat bordered>
    <q-card-section>
      <div class="text-h3 text-bold text-center text-blue-7 q-ml-sm">
        Prikaz aukcije
        <div class="q-ml-sm flex justify-end q-gutter-sm">
          <q-btn
            size="15px"
            name="send"
            rel="stylesheet"
            to="/"
            color="red"
            label="Natrag"
          />
        </div>
      </div>
    </q-card-section>
    <q-separator color="red" />

    <div class="q-pa-sm col flex flex-start q-gutter-sm">
      <div class="row flex flex-center">
        <div style="width: 600px">
          <q-card-section class="q-pt-none">
            <template
              v-if="!showSingleImage && item.slike && item.slike.length > 1"
            >
              <q-carousel
                control-color="black"
                animated
                v-model="slide"
                navigation
                infinite
                :autoplay="autoplay"
                arrows
                transition-prev="slide-right"
                transition-next="slide-left"
                @mouseenter="autoplay = false"
                @mouseleave="autoplay = true"
              >
                <q-carousel-slide
                  :key="index"
                  v-for="(image, index) in item.slike"
                  :name="index + startingIndex"
                >
                  <q-img :src="image" />
                </q-carousel-slide>
              </q-carousel>
            </template>
            <template v-else>
              <q-img
                v-if="showSingleImage"
                :src="item.slike ? item.slike[0] : item.slika"
              />
            </template>
          </q-card-section>
        </div>
      </div>

      <div class="q-ml-sm col flex flex-start q-gutter-sm">
        <div class="q-ml-sm flex flex-start q-gutter-sm">
          <div style="width: 80%">
            <q-field filled label="Naziv proizvoda" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ item.naziv_predmeta }}
                </div>
              </template>
            </q-field>
          </div>
          <div style="width: 80%">
            <q-field filled label="Opis proizvoda" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ item.opis_predmeta }}
                </div>
              </template>
            </q-field>
          </div>
          <div style="width: 39.5%">
            <q-field filled label="Početno vrijeme aukcije" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ formattedDate(item.vrijeme_pocetka) }}
                </div>
              </template>
            </q-field>
          </div>
          <div style="width: 39.5%">
            <q-field filled label="Završno vrijeme aukcije" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ formattedDate(item.vrijeme_zavrsetka) }}
                </div>
              </template>
            </q-field>
          </div>
          <div style="width: 39.5%">
            <q-field filled label="Početna cijena proizvoda" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ item.pocetna_cijena + "$" }}
                </div>
              </template>
            </q-field>
          </div>
          <div style="width: 39.5%">
            <q-field filled label="Trenutna cijena" stack-label>
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ item.trenutna_cijena + "$" }}
                </div>
              </template>
            </q-field>
          </div>
        </div>
      </div>
    </div>
  </q-card>

  <!-- Manual bid + watch buttons -->
  <div class="q-pa-md flex flex-center q-gutter-sm">
    <q-btn label="Ponuda" color="primary" @click="showDialog = true" />
    <q-btn
      v-if="isAuthenticated"
      :label="pratim ? 'Prekini praćenje' : 'Prati'"
      :color="pratim ? 'grey-7' : 'green'"
      :icon="pratim ? 'visibility_off' : 'visibility'"
      @click="togglePracenje"
    />
  </div>

  <q-dialog v-model="showDialog">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">Ponudi</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-select
          outlined
          v-model="odabranaCijena"
          :options="prices"
          label="Odaberi cijenu"
        />
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Odustani" color="primary" v-close-popup />
        <q-btn flat label="Potvrdi ponudu" @click="potvrdiPonudu" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ─── Auto-bid section ─────────────────────────────────────── -->
  <div v-if="isAuthenticated" class="q-pa-md">
    <q-card flat bordered>
      <!-- Header -->
      <q-card-section class="bg-blue-1 q-pb-sm">
        <div class="row items-center q-gutter-sm">
          <q-icon name="smart_toy" color="blue-7" size="sm" />
          <span class="text-h6 text-blue-7">Auto-bid</span>
          <q-chip
            :color="statusBoja"
            text-color="white"
            :label="statusLabel"
            size="sm"
            data-testid="status-chip"
          />
        </div>
        <p class="text-caption text-grey-7 q-mt-xs q-mb-none">
          Sustav će automatski licitirati u vaše ime do zadanog maksimalnog
          iznosa.
        </p>
      </q-card-section>

      <q-separator />

      <!-- Loading skeleton while fetching auto-bid status -->
      <q-card-section v-if="autoBidStatusLoading" data-testid="auto-bid-status-loading">
        <q-skeleton type="rect" height="48px" class="q-mb-sm" />
        <q-skeleton type="rect" height="56px" />
      </q-card-section>

      <q-card-section v-else>
        <!-- Not configured notice -->
        <q-banner
          v-if="!autoBidStatus"
          class="bg-grey-2 q-mb-md"
          rounded
          data-testid="status-message"
        >
          <template v-slot:avatar>
            <q-icon name="info" color="grey-6" />
          </template>
          Auto-bid još nije postavljen za ovu aukciju.
        </q-banner>

        <template v-else>
          <!-- Limit reached notice -->
          <q-banner
            v-if="autoBidStatus.limit_dosegnut"
            class="bg-orange-1 q-mb-md"
            rounded
            data-testid="limit-banner"
          >
            <template v-slot:avatar>
              <q-icon name="warning" color="orange-7" />
            </template>
            Auto-bid limit je dosegnut. Postavite novi, viši iznos kako bi
            sustav nastavio licitirati u vaše ime.
          </q-banner>

          <!-- Active status message -->
          <q-banner
            v-else-if="autoBidStatus.aktivan"
            class="bg-green-1 q-mb-md"
            rounded
            data-testid="status-message"
          >
            <template v-slot:avatar>
              <q-icon name="check_circle" color="positive" />
            </template>
            Auto-bid je aktivan.
          </q-banner>

          <!-- Disabled status message -->
          <q-banner
            v-else
            class="bg-grey-2 q-mb-md"
            rounded
            data-testid="status-message"
          >
            <template v-slot:avatar>
              <q-icon name="pause_circle" color="grey-7" />
            </template>
            Auto-bid je ugašen. Unesite novi iznos kako biste ga aktivirali.
          </q-banner>

          <!-- Current configured amount (own data only — never shows other users' amounts) -->
          <div class="q-mb-sm text-body2 text-grey-8" data-testid="auto-bid-limit">
            <q-icon name="info" size="xs" color="grey-6" />
            Vaš aktivni Auto-bid limit:
            <strong>{{ Number(autoBidStatus.maksimalni_iznos).toFixed(2) }} €</strong>
          </div>
        </template>

        <div class="row q-col-gutter-md items-start">
          <!-- Amount input -->
          <div class="col-12 col-sm-6 col-md-5">
            <q-input
              v-model.number="autoBidForm.maksimalni_iznos"
              outlined
              type="number"
              min="0"
              step="0.01"
              label="Maksimalni Auto-bid iznos"
              hint="Sustav će automatski licitirati do ovog iznosa."
              :error="!!autoBidError"
              :error-message="autoBidError"
              :disable="autoBidLoading"
              prefix="€"
              data-testid="auto-bid-input"
            />
          </div>

          <!-- Action buttons -->
          <div class="col-12 col-sm-auto self-start q-pt-sm">
            <div class="row q-gutter-sm">
              <q-btn
                class="col-12 col-sm-auto"
                color="primary"
                icon="save"
                :label="autoBidButtonLabel"
                :loading="autoBidLoading"
                :disable="autoBidLoading"
                @click="spremiAutoBid"
                data-testid="save-auto-bid-btn"
              />
              <q-btn
                v-if="autoBidStatus && autoBidStatus.aktivan"
                class="col-12 col-sm-auto"
                flat
                color="negative"
                icon="pause_circle"
                label="Ugasi Auto-bid"
                :loading="autoBidLoading"
                :disable="autoBidLoading"
                @click="onemoguciAutoBid"
                data-testid="disable-auto-bid-btn"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- Not-logged-in notice (shown instead of auto-bid section) -->
  <div v-else class="q-pa-md">
    <q-banner class="bg-grey-2" rounded>
      <template v-slot:avatar>
        <q-icon name="login" color="grey-7" />
      </template>
      Prijavite se kako biste mogli postaviti automatsko licitiranje (Auto-bid).
    </q-banner>
  </div>
  <!-- ─────────────────────────────────────────────────────────── -->

  <!-- Bid history -->
  <div class="q-pa-md">
    <div class="text-h5 text-bold text-blue-7 q-mb-md">Povijest ponuda</div>
    <q-table
      :rows="ponude"
      :columns="kolonePonuda"
      row-key="id_ponude"
      flat
      bordered
      no-data-label="Još nema ponuda za ovaj predmet."
    />
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/api`;

/**
 * Pure validation for the auto-bid amount.
 * Exported as a named export so unit tests can exercise it without mounting the component.
 *
 * @param {number|string|null} amount
 * @param {number} currentPrice
 * @returns {string|null} Error message, or null when valid.
 */
export function validateAutoBidAmount(amount, currentPrice) {
  if (amount === null || amount === undefined || amount === "") {
    return "Iznos je obavezan.";
  }
  const num = Number(amount);
  if (isNaN(num)) {
    return "Iznos mora biti broj.";
  }
  if (num <= 0) {
    return "Iznos mora biti pozitivan broj.";
  }
  if (num <= Number(currentPrice)) {
    return `Iznos mora biti veći od trenutne cijene (${Number(
      currentPrice,
    ).toFixed(2)} $).`;
  }
  return null;
}

export default {
  name: "PrikazAukcije",

  setup() {
    return {
      slide: ref(2),
      autoplay: ref(false),
    };
  },

  computed: {
    id_predmeta() {
      return this.$route.query.id_predmeta;
    },
    startingIndex() {
      return 2;
    },
    isAuthenticated() {
      return !!localStorage.getItem("token");
    },
    statusLabel() {
      if (!this.autoBidStatus) return "Nije postavljen";
      if (this.autoBidStatus.limit_dosegnut) return "Limit dosegnut";
      return this.autoBidStatus.aktivan ? "Aktivan" : "Ugašen";
    },
    statusBoja() {
      if (!this.autoBidStatus) return "grey";
      if (this.autoBidStatus.limit_dosegnut) return "orange";
      return this.autoBidStatus.aktivan ? "positive" : "negative";
    },
    autoBidButtonLabel() {
      if (!this.autoBidStatus) return "Spremi Auto-bid";
      return "Ažuriraj Auto-bid";
    },
  },

  data() {
    return {
      item: {},
      showDialog: false,
      odabranaCijena: "",
      prices: [],
      autoBidStatus: null,
      autoBidStatusLoading: false,
      autoBidForm: { maksimalni_iznos: null },
      autoBidError: null,
      autoBidLoading: false,
      showSingleImage: false,
      ponude: [],
      pratim: false,
      kolonePonuda: [
        {
          name: "korisnik",
          label: "Korisnik",
          field: (row) => `${row.ime_korisnika} ${row.prezime_korisnika}`,
          align: "left",
          sortable: true,
        },
        {
          name: "vrijednost",
          label: "Iznos ponude ($)",
          field: "vrijednost_ponude",
          align: "right",
          sortable: true,
        },
        {
          name: "vrijeme",
          label: "Vrijeme ponude",
          field: "vrijeme_ponude",
          align: "center",
          sortable: true,
        },
      ],
    };
  },

  async mounted() {
    await this.dohvatiPredmet();
    await Promise.all([this.dohvatiPonude(), this.dohvatiTrenutnuCijenu()]);
    if (this.isAuthenticated) {
      await this.dohvatiAutoBid();
    }
  },

  methods: {
    formattedDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },

    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    // ── Data fetching ──────────────────────────────────────────────

    async dohvatiPredmet() {
      try {
        const { data } = await axios.get(
          `${API_URL}/get-predmet/${this.id_predmeta}`,
        );
        this.item = data[0] || {};
        this.item.trenutna_cijena = this.item.pocetna_cijena;
        if (this.item.slike && this.item.slike.length > 0) {
          this.showSingleImage = this.item.slike.length === 1;
          if (this.showSingleImage) this.item.slika = this.item.slike[0];
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju predmeta:", err);
      }
    },

    async dohvatiPonude() {
      try {
        const { data } = await axios.get(
          `${API_URL}/get-ponuda/${this.id_predmeta}`,
        );
        this.ponude = data;
      } catch (err) {
        console.error("Greška pri dohvaćanju ponuda:", err);
      }
    },

    async dohvatiTrenutnuCijenu() {
      try {
        const { data } = await axios.get(
          `${API_URL}/get-predmet-trenutna-cijena/${this.id_predmeta}`,
        );
        if (data.max_vrijednost_ponude != null) {
          this.item.trenutna_cijena = data.max_vrijednost_ponude;
        }
        this.generirajCijene();
      } catch (err) {
        console.error("Greška pri dohvaćanju trenutne cijene:", err);
      }
    },

    generirajCijene() {
      const base = this.item.trenutna_cijena || 0;
      this.prices = [1.1, 1.2, 1.3, 1.4, 1.5, 2].map((mult) => ({
        label: `+ ${Math.round((mult - 1) * 100)}%: ${(base * mult).toFixed(
          2,
        )} $`,
        value: (base * mult).toFixed(2),
      }));
    },

    // ── Manual bid ────────────────────────────────────────────────

    async potvrdiPonudu() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$q.notify({
          type: "negative",
          message: "Morate biti prijavljeni za licitiranje.",
        });
        return;
      }
      if (!this.odabranaCijena) return;

      const selectedPrice = parseFloat(this.odabranaCijena.value);
      if (selectedPrice <= this.item.trenutna_cijena) return;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/unostrenutnaponuda`,
          { id_predmeta: this.id_predmeta, vrijednost_ponude: selectedPrice },
          { headers: this.getAuthHeaders() },
        );
        this.item.trenutna_cijena = data.currentPrice;
        this.generirajCijene();
        await this.dohvatiPonude();
        if (this.isAuthenticated) await this.dohvatiAutoBid();
        this.showDialog = false;
      } catch (err) {
        console.error("Greška pri unosu ponude:", err);
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || "Greška pri slanju ponude.",
        });
      }
    },

    async togglePracenje() {
      // TODO: integrate with lista_pracenja endpoint once available
      this.$q.notify({
        type: "info",
        message: "Praćenje nije još implementirano.",
      });
    },

    // ── Auto-bid ──────────────────────────────────────────────────

    async dohvatiAutoBid() {
      this.autoBidStatusLoading = true;
      try {
        const { data } = await axios.get(
          `${API_URL}/auto-bid/${this.id_predmeta}`,
          {
            headers: this.getAuthHeaders(),
          },
        );
        this.autoBidStatus = data || null;
        if (this.autoBidStatus?.maksimalni_iznos != null) {
          this.autoBidForm.maksimalni_iznos = Number(
            this.autoBidStatus.maksimalni_iznos,
          );
        }
      } catch (err) {
        // 404 means no auto-bid exists yet — not an error
        if (err.response?.status !== 404) {
          console.error("Greška pri dohvaćanju auto-bida:", err);
        }
        this.autoBidStatus = null;
      } finally {
        this.autoBidStatusLoading = false;
      }
    },

    async spremiAutoBid() {
      this.autoBidError = null;

      const validationMsg = validateAutoBidAmount(
        this.autoBidForm.maksimalni_iznos,
        this.item.trenutna_cijena,
      );
      if (validationMsg) {
        this.autoBidError = validationMsg;
        return;
      }

      this.autoBidLoading = true;
      try {
        const payload = {
          id_predmeta: this.id_predmeta,
          maksimalni_iznos: this.autoBidForm.maksimalni_iznos,
        };
        const headers = this.getAuthHeaders();

        if (this.autoBidStatus) {
          // Auto-bid already exists (active, disabled, or limit reached) — update it
          await axios.put(`${API_URL}/auto-bid`, payload, { headers });
        } else {
          // First-time creation
          await axios.post(`${API_URL}/auto-bid`, payload, { headers });
        }

        await this.dohvatiAutoBid();
        this.$q.notify({
          type: "positive",
          message: "Auto-bid je uspješno postavljen.",
        });
      } catch (err) {
        const msg =
          err.response?.data?.message || "Greška pri postavljanju Auto-bida.";
        this.autoBidError = msg;
        this.$q.notify({ type: "negative", message: msg });
      } finally {
        this.autoBidLoading = false;
      }
    },

    async onemoguciAutoBid() {
      this.autoBidLoading = true;
      try {
        await axios.put(
          `${API_URL}/auto-bid/disable`,
          { id_predmeta: this.id_predmeta },
          { headers: this.getAuthHeaders() },
        );
        await this.dohvatiAutoBid();
        this.$q.notify({
          type: "positive",
          message: "Auto-bid je onemogućen.",
        });
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message:
            err.response?.data?.message ||
            "Greška pri onemogućavanju Auto-bida.",
        });
      } finally {
        this.autoBidLoading = false;
      }
    },

  },
};
</script>
