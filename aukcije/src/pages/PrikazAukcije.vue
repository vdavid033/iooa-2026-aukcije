<template>
  <div class="auction-page">
    <q-card class="auction-card" flat>

      <div class="auction-title">
        Prikaz aukcije
      </div>

      <div class="row q-col-gutter-xl">

        <div class="col-12 col-md-6">

          <div class="image-wrapper">

            <template
              v-if="
                !showSingleImage &&
                item.slike &&
                item.slike.length > 1
              "
            >
              <q-carousel
                v-model="slide"
                animated
                infinite
                arrows
                navigation
                class="carousel-custom"
                height="100%"
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
                    class="full-height"
                  />
                </q-carousel-slide>
              </q-carousel>
            </template>

            <template v-else>
              <q-img
                v-if="showSingleImage"
                :src="item.slika"
                fit="cover"
                class="single-image"
              />

              <div
                v-else
                class="image-placeholder"
              >
                Slika
              </div>
            </template>
          </div>

          <div class="info-box seller-box">
            <div class="label">
            </div>

            <div class="value">
              {{ item.korisnik_ime }}
              {{ item.korisnik_prezime }}
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">

          <div class="info-box">
            <div class="label">
              Naziv proizvoda
            </div>

            <div class="title-value">
              {{ item.naziv_predmeta }}
            </div>
          </div>

          <div class="info-box">
            <div class="label">
              Opis proizvoda
            </div>

            <div class="value">
              {{ item.opis_predmeta }}
            </div>
          </div>

          <div class="row q-col-gutter-md">

            <div class="col-12 col-sm-6">
              <div class="info-box small-box">

                <div class="label">
                  Početno vrijeme aukcije
                </div>

                <div class="date-row">
                  <q-icon
                    name="event"
                    size="18px"
                  />

                  <span>
                    {{
                      formattedDate(
                        item.vrijeme_pocetka
                      )
                    }}
                  </span>
                </div>

              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="info-box small-box">

                <div class="label">
                  Završno vrijeme aukcije
                </div>

                <div class="date-row">
                  <q-icon
                    name="event"
                    size="18px"
                  />

                  <span>
                    {{
                      formattedDate(
                        item.vrijeme_zavrsetka
                      )
                    }}
                  </span>
                </div>

              </div>
            </div>

          </div>

          <div class="row q-col-gutter-md">

            <div class="col-12 col-sm-6">
              <div class="info-box small-box">

                <div class="label">
                  Početna cijena proizvoda
                </div>

                <div class="price-row">
                  <q-icon
                    name="payments"
                    size="20px"
                  />

                  <span>
                    {{
                      formatPrice(
                        item.pocetna_cijena
                      )
                    }}
                  </span>
                </div>

              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div
                class="
                  info-box
                  current-price-box
                "
              >

                <div
                  class="
                    label
                    current-price-label
                  "
                >
                  Trenutna cijena
                </div>

                <div
                  class="
                    price-row
                    current-price
                  "
                >
                  <q-icon
                    name="payments"
                    size="20px"
                  />

                  <span>
                    {{
                      formatPrice(
                        item.trenutna_cijena
                      )
                    }}
                  </span>
                </div>

              </div>
            </div>

          </div>

          <q-btn
            class="bid-btn"
            label="PONUDA"
            unelevated
            no-caps
            @click="showDialog = true"
          />

        </div>
      </div>
    </q-card>

    <q-dialog v-model="showDialog">

      <q-card
        style="
          width: 400px;
          border-radius: 20px;
        "
      >

        <q-card-section>
          <div
            class="
              text-h6
              text-weight-bold
            "
          >
            Ponudi cijenu
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
          />

          <q-btn
            unelevated
            label="Potvrdi"
            color="primary"
            @click="potvrdiPonudu"
          />

        </q-card-actions>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
import axios from "axios";

const baseUrl =
  "http://localhost:3000/api/";

export default {

  computed: {
    id_predmeta() {
      return this.$route.query.id_predmeta;
    },
  },

  data() {
    return {

      item: {},

      showDialog: false,

      odabranaCijena: "",

      prices: [],

      showSingleImage: false,
    };
  },

  mounted() {

    axios
      .get(
        baseUrl +
          "get-predmet/" +
          this.id_predmeta
      )
      .then((response) => {

        this.item = response.data[0];

        this.item.trenutna_cijena =
          this.item.pocetna_cijena;

        if (
          this.item.slike &&
          this.item.slike.length > 0
        ) {

          if (
            this.item.slike.length === 1
          ) {

            this.showSingleImage =
              true;

            this.item.slika =
              this.item.slike[0];

          } else {

            this.showSingleImage =
              false;
          }
        }

        axios
          .get(
            baseUrl +
              "get-predmet-trenutna-cijena/" +
              this.id_predmeta
          )
          .then((response2) => {

            if (
              response2.data
                .max_vrijednost_ponude !=
              null
            ) {

              this.item.trenutna_cijena =
                response2.data
                  .max_vrijednost_ponude;
            }

            this.generatePrices();
          });
      });
  },

  methods: {

    formattedDate(dateString) {

      if (!dateString) return "";

      return new Date(dateString)
        .toLocaleString("hr-HR")
        .replace(",", "");
    },

    formatPrice(price) {

      if (!price) return "0";

      return (
        Number(price).toLocaleString(
          "en-US"
        ) + " $"
      );
    },

    generatePrices() {

      const current = Number(
        this.item.trenutna_cijena
      );

      this.prices = [
        1.1,
        1.2,
        1.3,
        1.4,
        1.5,
        2,
      ].map((multiplier) => ({

        label:
          `+ ${Math.round(
            (multiplier - 1) * 100
          )}% : ${(
            current * multiplier
          ).toFixed(2)} $`,

        value:
          (
            current * multiplier
          ).toFixed(2),
      }));
    },

    potvrdiPonudu() {

      const token =
        localStorage.getItem(
          "token"
        );

      if (
        !token ||
        !this.odabranaCijena
      )
        return;

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const decodedToken =
        jwtDecode(token);

      const selectedPrice =
        parseFloat(
          this.odabranaCijena.value
        );

      if (
        selectedPrice >
        this.item.trenutna_cijena
      ) {

        const currentDate =
          new Date();

        const formattedTime =
          `${currentDate.getFullYear()}-${
            currentDate.getMonth() + 1
          }-${currentDate.getDate()} ${
            currentDate.getHours()
          }:${currentDate.getMinutes()}:${
            currentDate.getSeconds()
          }`;

        const podaciPonude = {
          id_predmeta:
            this.id_predmeta,

          vrijednost_ponude:
            selectedPrice,

          vrijeme_ponude:
            formattedTime,

          id_korisnika:
            decodedToken.id,
        };

        axios
          .post(
            "http://localhost:3000/unostrenutnaponuda",
            podaciPonude,
            { headers }
          )
          .then((response) => {

            console.log(
              "Nova cijena spremljena:",
              response.data
            );

            this.item.trenutna_cijena =
              selectedPrice;

            this.generatePrices();

            this.odabranaCijena = "";

            this.showDialog = false;
          })
          .catch((error) => {

            console.error(
              "Error kod spremanja:",
              error
            );
          });
      }
    },
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
  background: #eef3fb;
  padding: 40px;
}

.auction-card {
  max-width: 1150px;
  margin: auto;
  padding: 40px;
  border-radius: 30px;
  background: white;
  box-shadow:
    0 10px 35px
    rgba(0, 0, 0, 0.08);
}

.auction-title {
  text-align: center;
  font-size: 52px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 40px;
}

.image-wrapper {
  width: 100%;
  height: 380px;
  border-radius: 24px;
  overflow: hidden;
  background: #f4f7fc;

  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  font-size: 30px;
  color: #9aa7bd;
}

.single-image {
  width: 100%;
  height: 100%;
}

.carousel-custom {
  height: 100%;
}

.info-box {
  background: #f6f8fc;
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

.small-box {
  min-height: 110px;
}

.label {
  font-size: 15px;
  color: #718096;
  margin-bottom: 10px;
}

.value {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
}

.title-value {
  font-size: 34px;
  font-weight: 700;
  color: #111827;
}

.date-row,
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.current-price-box {
  border: 2px solid #3b82f6;
  background: #f8fbff;
}

.current-price-label {
  color: #2563eb;
  font-weight: 700;
}

.current-price {
  color: #2563eb;
  font-weight: 800;
}

.seller-box {
  margin-top: 18px;
}

.bid-btn {
  width: 100%;
  height: 65px;
  border-radius: 18px;
  margin-top: 8px;

  background: linear-gradient(
    90deg,
    #3b82f6,
    #2563eb
  );

  color: white;

  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 1024px) {

  .auction-title {
    font-size: 38px;
  }

  .title-value {
    font-size: 28px;
  }
}

@media (max-width: 768px) {

  .auction-page {
    padding: 20px;
  }

  .auction-card {
    padding: 20px;
  }

  .auction-title {
    font-size: 30px;
  }

  .image-wrapper {
    height: 260px;
  }

  .title-value {
    font-size: 24px;
  }

  .value,
  .date-row,
  .price-row {
    font-size: 18px;
  }
}
</style>