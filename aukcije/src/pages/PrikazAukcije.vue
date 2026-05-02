<template>
  <div>
    <q-card class="q-pa-md q-gutter-md" flat bordered>
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h3 text-bold text-blue-7">
            {{ $t("auctionViewPage.title") }}
          </div>

          <q-btn size="15px" to="/" color="red" :label="$t('auctionViewPage.back')" />
        </div>
      </q-card-section>

      <q-separator color="red" />

      <div class="row q-col-gutter-md q-pa-sm">
        <div class="col-12 col-md-6">
          <q-card-section class="q-pt-none">
            <template v-if="item.slike && item.slike.length > 1">
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
                class="auction-carousel"
              >
                <q-carousel-slide
                  v-for="(image, index) in item.slike"
                  :key="index"
                  :name="index"
                >
                  <q-img :src="image" class="auction-image" />
                </q-carousel-slide>
              </q-carousel>
            </template>

            <template v-else>
              <q-img
                v-if="item.slike && item.slike.length"
                :src="item.slike[0]"
                class="auction-image"
              />
              <q-img
                v-else-if="item.slika"
                :src="item.slika"
                class="auction-image"
              />
            </template>
          </q-card-section>
        </div>

        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-field filled :label="$t('auctionViewPage.productName')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ translatedName }}
                  </div>
                </template>
              </q-field>
            </div>

            <div class="col-12">
              <q-field filled :label="$t('auctionViewPage.productDescription')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ translatedDescription }}
                  </div>
                </template>
              </q-field>
            </div>

            <div class="col-12 col-sm-6">
              <q-field filled :label="$t('auctionViewPage.startTime')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ formattedDate(item.vrijeme_pocetka) }}
                  </div>
                </template>
              </q-field>
            </div>

            <div class="col-12 col-sm-6">
              <q-field filled :label="$t('auctionViewPage.endTime')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ formattedDate(item.vrijeme_zavrsetka) }}
                  </div>
                </template>
              </q-field>
            </div>

            <div class="col-12 col-sm-6">
              <q-field filled :label="$t('auctionViewPage.startPrice')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ item.pocetna_cijena }}$
                  </div>
                </template>
              </q-field>
            </div>

            <div class="col-12 col-sm-6">
              <q-field filled :label="$t('auctionViewPage.currentPrice')" stack-label>
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ item.trenutna_cijena }}$
                  </div>
                </template>
              </q-field>
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <div class="q-pa-md flex flex-center">
      <q-btn :label="$t('auctionViewPage.bid')" color="primary" @click="showDialog = true" />

      <q-dialog v-model="showDialog">
        <q-card style="width: 300px">
          <q-card-section>
            <div class="text-h6">{{ $t("auctionViewPage.makeBid") }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select
              outlined
              v-model="odabranaCijena"
              :options="prices"
              :label="$t('auctionViewPage.selectPrice')"
            />
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
            <q-btn flat :label="$t('auctionViewPage.confirmBid')" @click="potvrdiPonudu" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

export default {
  setup() {
    return {
      slide: ref(0),
      autoplay: ref(false),
    };
  },

  data() {
    return {
      item: {},
      showDialog: false,
      odabranaCijena: "",
      prices: [],
    };
  },

  computed: {
    id_predmeta() {
      return this.$route.query.id_predmeta;
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
    },
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

    potvrdiPonudu() {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Korisnik nije prijavljen.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const decodedToken = jwtDecode(token);

      if (!this.odabranaCijena) return;

      const selectedPrice = parseFloat(this.odabranaCijena.value);

      if (selectedPrice > this.item.trenutna_cijena) {
        const currentDate = new Date();

        const formattedTime = `${currentDate.getFullYear()}-${
          currentDate.getMonth() + 1
        }-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

        const podaciPonude = {
          id_predmeta: this.id_predmeta,
          vrijednost_ponude: selectedPrice,
          vrijeme_ponude: formattedTime,
          id_korisnika: decodedToken.id,
        };

        axios
          .post("http://localhost:3000/unostrenutnaponuda", podaciPonude, {
            headers,
          })
          .then((response) => {
            console.log("New price stored successfully:", response.data);
          })
          .catch((error) => {
            console.error("Error storing new price:", error);
          });

        this.item.trenutna_cijena = selectedPrice;
        this.generirajCijene();
        this.showDialog = false;
      }
    },
  },
};
</script>

<style scoped>
.auction-image {
  height: 400px;
  width: 100%;
  object-fit: contain;
}

.auction-carousel {
  height: 400px;
}
</style>