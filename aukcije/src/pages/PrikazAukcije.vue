<template>
  <q-page class="auction-page">
    <div class="page-wrap">
      <div class="auction-title">{{ $t("auctionViewPage.title") }}</div>

      <q-card class="auction-card" flat>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-7">
            <div class="image-panel">
              <template
                v-if="!showSingleImage && item.slike && item.slike.length > 1"
              >
                <q-carousel
                  v-model="slide"
                  animated
                  infinite
                  arrows
                  navigation
                  height="100%"
                  class="carousel-custom"
                >
                  <q-carousel-slide
                    v-for="(image, index) in item.slike"
                    :key="index"
                    :name="index"
                    class="q-pa-none"
                  >
                    <q-img
                      :src="image"
                      fit="cover"
                      class="full-height shifted-image"
                    />
                  </q-carousel-slide>
                </q-carousel>
              </template>

              <template v-else>
                <q-img
                  v-if="showSingleImage"
                  :src="item.slika"
                  fit="cover"
                  class="single-image shifted-image"
                />

                <div v-else class="image-placeholder">
                  {{ $t("auctionViewPage.noImage") }}
                </div>
              </template>

              <div class="image-badge">
                <span>{{ $t("auctionViewPage.auctionBadge") }}</span>
              </div>

              <q-btn
                class="save-button-detail"
                round
                flat
                :color="aukcijaSpremljena ? 'negative' : 'grey-8'"
                :icon="aukcijaSpremljena ? 'favorite' : 'favorite_border'"
                :disable="spremanjeUTijeku"
                @click.stop="promijeniSpremanje"
              >
                <q-tooltip>
                  {{
                    aukcijaSpremljena
                      ? $t("savedAuctions.remove")
                      : $t("savedAuctions.save")
                  }}
                </q-tooltip>
              </q-btn>
            </div>

            <div class="auction-timer">
              <q-icon name="schedule" size="20px" color="primary" />
              <span>
                {{ $t("auctionViewPage.timeLeft") }}
                <strong>{{ vrijemeDoKraja }}</strong>
              </span>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="details-panel">
              <div class="product-box">
                <div class="product-title">
                  {{
                    $pick(item.naziv_predmeta, item.naziv_predmeta_en) ||
                    $t("auctionViewPage.nameUnavailable")
                  }}
                </div>
              </div>

              <div class="description-box">
                <div class="section-label">
                  {{ $t("auctionViewPage.productDescription") }}
                </div>
                <div class="description-text">
                  {{
                    $pick(item.opis_predmeta, item.opis_en) ||
                    $t("auctionViewPage.descUnavailable")
                  }}
                </div>
              </div>

              <div class="seller-box">
                <div class="section-label">
                  {{ $t("auctionViewPage.seller") }}
                </div>

                <div class="seller-line">
                  {{ $t("auctionViewPage.user") }} #{{ item.id_prodavatelja }}
                </div>

                <div class="seller-rating">
                  <span v-if="brojRecenzijaProdavatelja > 0">
                    {{ $t("auctionViewPage.sellerRating") }}:
                    {{ Number(prosjecnaOcjenaProdavatelja).toFixed(1) }}/5 ({{
                      brojRecenzijaProdavatelja
                    }}
                    {{ $t("auctionViewPage.reviews") }})
                  </span>

                  <span v-else>
                    {{ $t("auctionViewPage.sellerRating") }}:
                    {{ $t("auctionViewPage.noSellerRatings") }}
                  </span>
                </div>

                <q-btn
                  outline
                  rounded
                  color="primary"
                  icon="reviews"
                  :label="$t('auctionViewPage.showReviews')"
                  class="q-mt-sm"
                  @click="prikaziRecenzijeProdavatelja"
                />
              </div>

              <div class="time-row">
                <div class="time-box">
                  <q-icon name="event" color="primary" size="22px" />
                  <div>
                    <div class="meta-label">
                      {{ $t("auctionViewPage.startTime") }}
                    </div>
                    <div class="meta-value">
                      {{ formattedDate(item.vrijeme_pocetka) }}
                    </div>
                  </div>
                </div>

                <div class="time-box">
                  <q-icon name="event_available" color="primary" size="22px" />
                  <div>
                    <div class="meta-label">
                      {{ $t("auctionViewPage.endTime") }}
                    </div>
                    <div class="meta-value">
                      {{ formattedDate(item.vrijeme_zavrsetka) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="price-panel">
                <div class="price-grid">
                  <div class="start-price-card">
                    <div class="price-label">
                      {{ $t("auctionViewPage.startPrice") }}
                    </div>
                    <div class="start-price">
                      {{ formatPrice(item.pocetna_cijena) }}
                    </div>
                  </div>

                  <div class="current-price-card">
                    <div class="price-label blue">
                      {{ $t("auctionViewPage.currentPrice") }}
                    </div>
                    <div class="current-price">
                      {{ formatPrice(item.trenutna_cijena) }}
                    </div>
                  </div>
                </div>

                <q-btn
                  class="bid-btn"
                  :label="$t('auctionViewPage.placeBid')"
                  icon="gavel"
                  unelevated
                  no-caps
                  @click="showDialog = true"
                />

                <q-btn
                  v-if="isAuthenticated"
                  class="full-width q-mt-sm"
                  :label="pratim ? 'Prekini praćenje' : 'Prati'"
                  :color="pratim ? 'grey-7' : 'green'"
                  :icon="pratim ? 'visibility_off' : 'visibility'"
                  no-caps
                  @click="togglePracenje"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card>

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
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between q-gutter-sm">
            <div>
              <div class="text-h5 text-bold text-blue-7">Povijest ponuda</div>
              <div class="text-caption text-grey-7">
                Ponude su prikazane kronološki, od najstarije prema najnovijoj.
              </div>
            </div>
            <q-chip
              v-if="ponude.length"
              color="blue-1"
              text-color="blue-8"
              icon="history"
              :label="`${ponude.length} ponuda`"
            />
          </q-card-section>

          <q-separator />

          <q-card-section
            v-if="!ponude.length"
            class="text-grey-7"
            data-testid="povijest-ponuda-empty"
          >
            Još nema ponuda za ovaj predmet.
          </q-card-section>

          <q-list v-else separator data-testid="povijest-ponuda-list">
            <q-item
              v-for="ponuda in ponude"
              :key="ponuda.id_ponude"
              :class="isNajnovijaPonuda(ponuda) ? 'bg-green-1' : ''"
              :data-testid="isNajnovijaPonuda(ponuda) ? 'najnovija-ponuda' : 'ponuda-red'"
            >
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="blue-8" icon="person" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ getNazivPonuditelja(ponuda) }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatVrijemePonude(ponuda.vrijeme_ponude) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <div class="text-subtitle1 text-weight-bold">
                  {{ formatIznosPonude(ponuda.vrijednost_ponude) }}
                </div>
                <q-badge
                  v-if="isNajnovijaPonuda(ponuda)"
                  color="positive"
                  label="Najnovija"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <q-dialog v-model="showDialog">
        <q-card class="bid-dialog">
          <q-card-section>
            <div class="dialog-title">
              {{ $t("auctionViewPage.newBidTitle") }}
            </div>

            <div class="dialog-subtitle">
              {{ $t("auctionViewPage.bidHint") }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-select
              outlined
              v-model="odabranaCijena"
              :options="prices"
              :label="$t('auctionViewPage.selectPrice')"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('common.cancel')"
              color="grey-7"
              v-close-popup
              no-caps
            />

            <q-btn
              unelevated
              :label="$t('auctionViewPage.confirmBid')"
              color="primary"
              no-caps
              @click="potvrdiPonudu"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="successDialog" seamless>
        <q-card class="success-dialog">
          <div class="success-icon">✓</div>

          <div class="success-title">
            {{ $t("auctionViewPage.bidSuccess") }}
          </div>

          <div class="success-text">
            {{ $t("auctionViewPage.newCurrentPrice") }}
          </div>

          <div class="success-price">
            {{ formatPrice(successPrice) }}
          </div>
        </q-card>
      </q-dialog>

      <q-dialog v-model="reviewsDialog">
        <q-card class="reviews-dialog">
          <q-card-section>
            <div class="dialog-title">
              {{ $t("auctionViewPage.sellerReviews") }} #{{
                item.id_prodavatelja
              }}
            </div>

            <div
              v-if="recenzijeProdavatelja.length === 0"
              class="dialog-subtitle"
            >
              {{ $t("auctionViewPage.noReviews") }}
            </div>

            <div v-else>
              <div
                v-for="recenzija in recenzijeProdavatelja"
                :key="recenzija.datum_ocjene"
                class="q-mt-md"
              >
                <div class="text-subtitle2 text-primary text-weight-bold">
                  {{
                    $pick(recenzija.naziv_predmeta, recenzija.naziv_predmeta_en)
                  }}
                </div>
                <div class="text-weight-bold">
                  {{ $t("auctionViewPage.sellerRating") }}:
                  {{ recenzija.ocjena }} / 5
                </div>
                <div>
                  {{ recenzija.komentar }}
                </div>
                <div class="text-caption text-grey">
                  {{ recenzija.datum_ocjene }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('common.close')"
              color="primary"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import socket, { SOCKET_EVENTS } from "../socket";

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

function getBidTimestamp(vrijemePonude) {
  if (!vrijemePonude) return 0;

  const normalizedDate =
    typeof vrijemePonude === "string"
      ? vrijemePonude.replace(" ", "T")
      : vrijemePonude;
  const timestamp = new Date(normalizedDate).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortBidHistory(ponude) {
  if (!Array.isArray(ponude)) return [];

  return [...ponude].sort((a, b) => {
    const timeDiff =
      getBidTimestamp(a.vrijeme_ponude) - getBidTimestamp(b.vrijeme_ponude);

    if (timeDiff !== 0) return timeDiff;

    return Number(a.id_ponude || 0) - Number(b.id_ponude || 0);
  });
}

export function getLatestBidId(ponude) {
  const sorted = sortBidHistory(ponude);

  if (!sorted.length) return null;

  return Number(sorted[sorted.length - 1].id_ponude);
}

export default {
  name: "PrikazAukcije",

  setup() {
    return {
      slide: ref(0),
    };
  },

  computed: {
    id_predmeta() {
      return this.$route.query.id_predmeta;
    },

    vrijemeDoKraja() {
      if (!this.item.vrijeme_zavrsetka)
        return this.$t("auctionViewPage.notAvailable");

      const end = new Date(this.item.vrijeme_zavrsetka);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) return this.$t("auctionViewPage.auctionEnded");

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${days}d ${hours}h ${minutes}m`;
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
      successDialog: false,
      reviewsDialog: false,
      recenzijeProdavatelja: [],
      prosjecnaOcjenaProdavatelja: null,
      brojRecenzijaProdavatelja: 0,
      successPrice: 0,
      odabranaCijena: "",
      prices: [],
      autoBidStatus: null,
      autoBidStatusLoading: false,
      autoBidForm: { maksimalni_iznos: null },
      autoBidError: null,
      autoBidLoading: false,
      showSingleImage: false,
      ponude: [],
      najnovijaPonudaId: null,
      pratim: false,
      cijenaAzuriranaHandler: null,
      socketPredmetId: null,
      aukcijaSpremljena: false,
      spremanjeUTijeku: false,
    };
  },

  async mounted() {
    await this.dohvatiPredmet();
    await Promise.all([
      this.dohvatiPonude(),
      this.dohvatiTrenutnuCijenu(),
      this.dohvatiRecenzijeProdavatelja(),
    ]);
    if (this.isAuthenticated) {
      await Promise.all([this.dohvatiAutoBid(), this.dohvatiStatusPracenja(), this.dohvatiStatusSpremanja()]);
    }
    this.setupSocket();
  },

  beforeUnmount() {
    this.cleanupSocket();
  },

  methods: {
    async dohvatiStatusSpremanja() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(baseUrl + "spremljene-aukcije", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.aukcijaSpremljena = response.data.some(
          (item) => Number(item.id_predmeta) === Number(this.id_predmeta),
        );
      } catch (error) {
        console.error("Greška pri dohvatu spremljenih aukcija:", error);
      }
    },

    async promijeniSpremanje() {
      const token = localStorage.getItem("token");

      if (!token) {
        this.$q.notify({
          type: "warning",
          message: this.$t("savedAuctions.loginRequired"),
        });
        return;
      }

      if (new Date(this.item.vrijeme_zavrsetka) <= new Date()) {
        this.$q.notify({
          type: "warning",
          message: this.$t("savedAuctions.finished"),
        });
        return;
      }

      if (this.spremanjeUTijeku) return;
      this.spremanjeUTijeku = true;

      try {
        const headers = { Authorization: `Bearer ${token}` };

        if (this.aukcijaSpremljena) {
          await axios.delete(
            baseUrl + "spremljene-aukcije/" + this.id_predmeta,
            { headers },
          );
          this.aukcijaSpremljena = false;
          this.$q.notify({
            type: "positive",
            message: this.$t("savedAuctions.removed"),
          });
        } else {
          await axios.post(
            baseUrl + "spremljene-aukcije/" + this.id_predmeta,
            {},
            { headers },
          );
          this.aukcijaSpremljena = true;
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
        this.spremanjeUTijeku = false;
      }
    },

    formattedDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("hr-HR").replace(",", "");
    },

    formatPrice(price) {
      if (!price) return "0 $";
      return Number(price).toLocaleString("en-US") + " $";
    },

    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    getNazivPonuditelja(ponuda) {
      const ime = ponuda?.ime_korisnika || "";
      const prezime = ponuda?.prezime_korisnika || "";
      const naziv = `${ime} ${prezime}`.trim();

      return naziv || "Nepoznat korisnik";
    },

    formatIznosPonude(iznos) {
      const numericValue = Number(iznos);

      if (!Number.isFinite(numericValue)) {
        return `${iznos} $`;
      }

      return `${numericValue.toFixed(2)} $`;
    },

    formatVrijemePonude(vrijemePonude) {
      if (!vrijemePonude) return "";

      const normalizedDate =
        typeof vrijemePonude === "string"
          ? vrijemePonude.replace(" ", "T")
          : vrijemePonude;
      const date = new Date(normalizedDate);

      if (Number.isNaN(date.getTime())) return vrijemePonude;

      return date.toLocaleString("hr-HR").replace(",", "");
    },

    isNajnovijaPonuda(ponuda) {
      return Number(ponuda?.id_ponude) === Number(this.najnovijaPonudaId);
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

    async dohvatiRecenzijeProdavatelja() {
      if (!this.item.id_prodavatelja) return;
      try {
        const res = await axios.get(
          `${API_URL}/recenzije-prodavatelja/${this.item.id_prodavatelja}`,
        );

        this.prosjecnaOcjenaProdavatelja = res.data.prosjecnaOcjena;
        this.brojRecenzijaProdavatelja = res.data.brojRecenzija;
        this.recenzijeProdavatelja = res.data.recenzije;
      } catch (error) {
        console.error("Error fetching seller reviews:", error);
      }
    },

    async prikaziRecenzijeProdavatelja() {
      await this.dohvatiRecenzijeProdavatelja();
      this.reviewsDialog = true;
    },

    async dohvatiPonude(options = {}) {
      const { oznaciNajnoviju = true } = options;

      try {
        const { data } = await axios.get(
          `${API_URL}/predmeti/${this.id_predmeta}/ponude`,
        );
        const sortiranePonude = sortBidHistory(data);

        this.ponude = sortiranePonude;
        if (oznaciNajnoviju) {
          this.najnovijaPonudaId = getLatestBidId(sortiranePonude);
        }
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

      const selectedPrice = parseFloat(this.odabranaCijena);
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
        this.odabranaCijena = "";
        this.showDialog = false;

        this.successPrice = data.currentPrice;
        this.successDialog = true;
        setTimeout(() => {
          this.successDialog = false;
        }, 2800);
      } catch (err) {
        console.error("Greška pri unosu ponude:", err);
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || "Greška pri slanju ponude.",
        });
      }
    },

    async dohvatiStatusPracenja() {
      try {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const { data } = await axios.get(`${API_URL}/watchlist/${decoded.id}`, {
          headers: this.getAuthHeaders(),
        });
        this.pratim = data.some(
          (item) => Number(item.id_predmeta) === Number(this.id_predmeta),
        );
      } catch {
        this.pratim = false;
      }
    },

    async togglePracenje() {
      if (!this.isAuthenticated) return;

      try {
        if (this.pratim) {
          await axios.delete(`${API_URL}/watchlist/${this.id_predmeta}`, {
            headers: this.getAuthHeaders(),
          });
          this.pratim = false;
          this.$q.notify({ type: "positive", message: "Aukcija uklonjena s liste praćenja." });
        } else {
          await axios.post(
            `${API_URL}/watchlist`,
            { id_predmeta: this.id_predmeta },
            { headers: this.getAuthHeaders() },
          );
          this.pratim = true;
          this.$q.notify({ type: "positive", message: "Aukcija dodana na listu praćenja." });
        }
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: err.response?.data?.message || "Greška pri ažuriranju liste praćenja.",
        });
      }
    },

    setupSocket() {
      this.cleanupSocket();
      if (!this.id_predmeta) return;

      if (!socket.connected) {
        socket.connect();
      }

      this.cijenaAzuriranaHandler = async ({
        id_predmeta,
        trenutna_cijena,
        id_ponude,
      }) => {
        if (Number(id_predmeta) !== Number(this.id_predmeta)) return;
        if (trenutna_cijena === undefined || trenutna_cijena === null) return;

        this.item.trenutna_cijena = trenutna_cijena;
        this.generirajCijene();

        await this.dohvatiPonude({ oznaciNajnoviju: !id_ponude });
        if (id_ponude) {
          this.najnovijaPonudaId = Number(id_ponude);
        }

        if (this.isAuthenticated) {
          await this.dohvatiAutoBid();
        }
      };

      socket.on(SOCKET_EVENTS.cijenaAzurirana, this.cijenaAzuriranaHandler);
      socket.emit(SOCKET_EVENTS.joinPredmet, this.id_predmeta);
      this.socketPredmetId = this.id_predmeta;
    },

    cleanupSocket() {
      if (this.cijenaAzuriranaHandler) {
        socket.off(SOCKET_EVENTS.cijenaAzurirana, this.cijenaAzuriranaHandler);
        this.cijenaAzuriranaHandler = null;
      }

      if (this.socketPredmetId) {
        socket.emit(SOCKET_EVENTS.leavePredmet, this.socketPredmetId);
        this.socketPredmetId = null;
      }
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

<style scoped>
.auction-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eaf2ff 0%, #f8fafc 100%);
  padding: 40px 28px;
}

.page-wrap {
  max-width: 1260px;
  margin: 0 auto;
}

.auction-title {
  text-align: center;
  font-size: 42px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 26px;
  letter-spacing: -0.03em;
}

.auction-card {
  background: #ffffff;
  border-radius: 34px;
  padding: 30px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.image-panel {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 28px;
  background: #eef2f7;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.85);
}

.single-image {
  width: 100%;
  height: 100%;
}

.carousel-custom {
  height: 100%;
}

.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 30px;
  font-weight: 800;
}

.image-badge {
  position: absolute;
  left: 22px;
  top: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.86);
  color: white;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.save-button-detail {
  position: absolute;
  right: 22px;
  top: 22px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
}

.badge-divider {
  opacity: 0.65;
}

.auction-timer {
  margin-top: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.auction-timer strong {
  color: #2563eb;
  font-weight: 950;
}

.details-panel {
  min-height: 572px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-box,
.description-box,
.time-box,
.price-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
}

.product-box {
  padding: 24px 28px;
}

.product-title {
  font-size: 34px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.description-box {
  padding: 22px 24px;
}

.section-label,
.meta-label,
.price-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.description-text {
  color: #111827;
  font-size: 17px;
  line-height: 1.35;
  font-weight: 700;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.time-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 18px;
  min-height: 110px;
  width: 100%;
}

.meta-value {
  color: #0f172a;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
}

.price-panel {
  margin-top: auto;
  padding: 18px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 2px solid #bfdbfe;
}

.price-grid {
  display: grid;
  grid-template-columns: 0.75fr 1.8fr;
  gap: 13px;
  margin-bottom: 16px;
}

.start-price-card,
.current-price-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 14px 16px;
}

.start-price-card {
  border: 1px solid #e2e8f0;
}

.current-price-card {
  border: 2px solid #3b82f6;
}

.price-label.blue {
  color: #2563eb;
}

.start-price {
  font-size: 20px;
  color: #0f172a;
  font-weight: 900;
  white-space: nowrap;
}

.current-price {
  font-size: clamp(22px, 1.75vw, 29px);
  color: #2563eb;
  font-weight: 950;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bid-btn {
  width: 100%;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: white;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.25);
}

.bid-dialog {
  width: 440px;
  border-radius: 26px;
  padding: 8px;
}

.dialog-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}

.dialog-subtitle {
  color: #64748b;
  font-size: 15px;
  margin-top: 5px;
}

.success-dialog {
  width: 430px;
  border-radius: 34px;
  padding: 34px 32px;
  text-align: center;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.28);
}

.success-icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 22px auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  font-weight: 950;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.36);
}

.success-title {
  font-size: 25px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 10px;
}

.success-text {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 10px;
}

.success-price {
  font-size: 36px;
  font-weight: 950;
  color: #2563eb;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .image-panel,
  .details-panel {
    height: auto;
  }

  .image-panel {
    height: 420px;
  }

  .time-row,
  .price-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .auction-page {
    padding: 20px;
  }

  .auction-title {
    font-size: 32px;
  }

  .auction-card {
    padding: 20px;
    border-radius: 26px;
  }

  .image-panel {
    height: 300px;
  }

  .product-title {
    font-size: 28px;
  }

  .success-dialog {
    width: 92vw;
  }

  .success-price {
    font-size: 28px;
  }
}

.seller-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px 22px;
}

.seller-line {
  color: #0f172a;
  font-size: 16px;
  font-weight: 900;
}

.seller-rating {
  margin-top: 4px;
  color: #2563eb;
  font-size: 15px;
  font-weight: 800;
}

.reviews-dialog {
  width: 430px;
  max-width: 90vw;
  border-radius: 24px;
  padding: 8px;
}
</style>
