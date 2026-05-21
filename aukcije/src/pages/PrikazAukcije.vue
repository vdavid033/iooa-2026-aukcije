<template>
  <q-page class="auction-page">
    <div class="page-wrap">
      <div class="auction-title">Prikaz aukcije</div>

      <q-card class="auction-card" flat>
        <div class="row q-col-gutter-lg">

          <div class="col-12 col-md-7">
            <div class="image-panel">
              <template v-if="!showSingleImage && item.slike && item.slike.length > 1">
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
                  Nema slike
                </div>
              </template>

              <div class="image-badge">
                <span>Aukcija</span>
              </div>
            </div>

            <div class="auction-timer">
              <q-icon name="schedule" size="20px" color="primary" />
              <span>
                Preostalo do kraja aukcije:
                <strong>{{ vrijemeDoKraja }}</strong>
              </span>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="details-panel">

              <div class="product-box">
                <div class="product-title">
                  {{ item.naziv_predmeta || "Naziv nije dostupan" }}
                </div>
              </div>

              <div class="description-box">
                <div class="section-label">Opis proizvoda</div>
                <div class="description-text">
                  {{ item.opis_predmeta || "Opis nije dostupan." }}
                </div>
              </div>

              <div class="time-row">
                <div class="time-box">
                  <q-icon name="event" color="primary" size="22px" />
                  <div>
                    <div class="meta-label">Početak aukcije</div>
                    <div class="meta-value">
                      {{ formattedDate(item.vrijeme_pocetka) }}
                    </div>
                  </div>
                </div>

                <div class="time-box">
                  <q-icon name="event_available" color="primary" size="22px" />
                  <div>
                    <div class="meta-label">Završetak aukcije</div>
                    <div class="meta-value">
                      {{ formattedDate(item.vrijeme_zavrsetka) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="price-panel">
                <div class="price-grid">
                  <div class="start-price-card">
                    <div class="price-label">Početna cijena</div>
                    <div class="start-price">
                      {{ formatPrice(item.pocetna_cijena) }}
                    </div>
                  </div>

                  <div class="current-price-card">
                    <div class="price-label blue">Trenutna cijena</div>
                    <div class="current-price">
                      {{ formatPrice(item.trenutna_cijena) }}
                    </div>
                  </div>
                </div>

                <q-btn
                  class="bid-btn"
                  label="Postavi ponudu"
                  icon="gavel"
                  unelevated
                  no-caps
                  @click="showDialog = true"
                />
              </div>

            </div>
          </div>

        </div>
      </q-card>

      <q-dialog v-model="showDialog">
        <q-card class="bid-dialog">
          <q-card-section>
            <div class="dialog-title">Postavi novu ponudu</div>

            <div class="dialog-subtitle">
              Odaberi iznos veći od trenutne cijene.
            </div>
          </q-card-section>

          <q-card-section>
            <q-select
              outlined
              v-model="odabranaCijena"
              :options="prices"
              label="Odaberi cijenu"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Odustani"
              color="grey-7"
              v-close-popup
              no-caps
            />

            <q-btn
              unelevated
              label="Potvrdi ponudu"
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
            Ponuda uspješno postavljena
          </div>

          <div class="success-text">
            Nova trenutna cijena:
          </div>

          <div class="success-price">
            {{ formatPrice(successPrice) }}
          </div>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>


<script>
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

export default {
  computed: {
  id_predmeta() {
    return this.$route.query.id_predmeta;
  },

  vrijemeDoKraja() {
    if (!this.item.vrijeme_zavrsetka) return "Nije dostupno";

    const end = new Date(this.item.vrijeme_zavrsetka);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return "Aukcija završena";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  },

  translatedName() {
    return this.isEnglish()
      ? this.item.naziv_predmeta_en || this.item.naziv_predmeta
      : this.item.naziv_predmeta;
  },

  translatedDescription() {
    return this.isEnglish()
      ? this.item.opis_en || this.item.opis_predmeta
      : this.item.opis_predmeta;
  }
},


  data() {
    return {
      item: {},
      showDialog: false,
      successDialog: false,
      successPrice: 0,
      odabranaCijena: "",
      prices: [],
    };
  },



  mounted() {
    this.ucitajPredmet();
  },

  watch: {
    "$i18n.locale"() {
      this.ucitajPredmet();
    },
  },

  methods: {
    isEnglish() {
      return String(this.$i18n.locale || "hr").startsWith("en");
    },

    async ucitajPredmet() {
      try {
        if (!this.id_predmeta) {
          console.error("Nema id_predmeta u URL-u.");
          return;
        }

        const response = await axios.get(
          baseUrl + "get-predmet/" + this.id_predmeta
        );

        console.log("ID iz URL-a:", this.id_predmeta);
        console.log("Response iz baze:", response.data);

        this.item = response.data[0] || {};

        if (!this.item.id_predmeta) {
          console.error("Backend nije vratio predmet za ovaj ID.");
          return;
        }

        this.item.trenutna_cijena =
          this.item.vrijednost_ponude ||
          this.item.trenutna_cijena ||
          this.item.pocetna_cijena;

        if (typeof this.item.slike === "string" && this.item.slike.length > 0) {
          this.item.slike = this.item.slike.split("|||");
        }

        if (!Array.isArray(this.item.slike)) {
          this.item.slike = [];
        }

        if (this.item.slika && !this.item.slike.includes(this.item.slika)) {
          this.item.slike.unshift(this.item.slika);
        }

        this.generirajCijene();
      } catch (error) {
        console.error("Greška pri dohvaćanju predmeta:", error);
      }
    },

    generirajCijene() {
      const trenutnaCijena = Number(
        this.item.trenutna_cijena || this.item.pocetna_cijena || 0
      );

      this.prices = [10, 20, 30, 40, 50, 100].map((percent) => {
        const multiplier = percent === 100 ? 2 : 1 + percent / 100;
        const value = (trenutnaCijena * multiplier).toFixed(2);

        return {
          label: `+ ${percent}%: ${value} $`,
          value,
        };
      });
    },

    formattedDate(dateString) {
      if (!dateString) return "";

      const locale = this.isEnglish() ? "en-US" : "hr-HR";

      return new Date(dateString)
        .toLocaleString(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: this.isEnglish(),
        })
        .replace(",", "");
    },


    formatPrice(price) {
      if (!price) return "0 $";
      return Number(price).toLocaleString("en-US") + " $";
    },

    generatePrices() {
      const current = Number(this.item.trenutna_cijena);

      this.prices = [1.1, 1.2, 1.3, 1.4, 1.5, 2].map((multiplier) => ({
        label:
          `+ ${Math.round((multiplier - 1) * 100)}% : ` +
          `${(current * multiplier).toFixed(2)} $`,
        value: (current * multiplier).toFixed(2),
      }));
    },

    async potvrdiPonudu() {
      try {
        // 1. token (OBAVEZNO)
        const token = localStorage.getItem("token");

        if (!token) {
          this.$q.notify({
            type: "negative",
            message: "Nema prijavljenog korisnika (token nedostaje).",
            position: "center",
          });
          return;
        }

        const decodedToken = jwtDecode(token);

        // 2. provjera odabrane cijene
        if (!this.odabranaCijena) {
          this.$q.notify({
            type: "warning",
            message: "Odaberi cijenu ponude.",
            position: "center",
          });
          return;
        }

        // ako je object iz q-select: { label, value }
        const selectedPrice = parseFloat(
          typeof this.odabranaCijena === "object"
            ? this.odabranaCijena.value
            : this.odabranaCijena
        );

        // 3. validacija cijene
        if (selectedPrice <= Number(this.item.trenutna_cijena)) {
          this.$q.notify({
            type: "negative",
            message: "Nova ponuda mora biti veća od trenutne cijene.",
            position: "center",
            timeout: 2500,
          });
          return;
        }

        // 4. headers
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // 5. format vremena (ISO je najstabilniji)
        const vrijemePonude = new Date().toISOString();

        // 6. payload
        const podaciPonude = {
          id_predmeta: this.id_predmeta,
          vrijednost_ponude: selectedPrice,
          vrijeme_ponude: vrijemePonude,
          id_korisnika: decodedToken.id,
        };

        // 7. API call
        await axios.post(
          "http://localhost:3000/unostrenutnaponuda",
          podaciPonude,
          { headers }
        );

        // 8. UI update
        this.item.trenutna_cijena = selectedPrice;
        this.successPrice = selectedPrice;

        this.odabranaCijena = null;
        this.showDialog = false;
        this.successDialog = true;

        this.generirajCijene(); // koristi JEDNU funkciju

        setTimeout(() => {
          this.successDialog = false;
        }, 2800);

      } catch (error) {
        console.error("Error storing new price:", error);

        this.$q.notify({
          type: "negative",
          message: "Greška kod postavljanja ponude.",
          position: "center",
        });
      }
    }
  },

  setup() {
    return {
      slide: ref(0),
    };
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
  height: 572px;
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
</style>