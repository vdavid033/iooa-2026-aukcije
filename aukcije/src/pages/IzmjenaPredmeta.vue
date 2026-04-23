<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 class="text-h3 text-blue q-my-md">
        {{ t('editAuctionPage.item') }} {{ item.naziv_predmeta }}
      </h5>
    </div>

    <q-form @submit="provjeraPolja">
      <q-input
        v-model="predmet_novo.naziv_predmeta"
        :label="t('editAuctionPage.name')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('editAuctionPage.currentName') }}: {{ item.naziv_predmeta }}</p>

      <q-select
        v-model="predmet_novo.id_kategorije"
        :options="kategorije"
        :label="t('editAuctionPage.category')"
        outlined
        dense
      />
      <p>{{ t('editAuctionPage.currentCategory') }}: {{ currentCategoryLabel }}</p>

      <q-input
        v-model="predmet_novo.opis_predmeta"
        :label="t('editAuctionPage.description')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('editAuctionPage.currentDescription') }}: {{ item.opis_predmeta }}</p>

      <q-input
        v-model="predmet_novo.pocetna_cijena"
        :label="t('editAuctionPage.startPrice')"
        outlined
        dense
        type="text"
      />
      <p>{{ t('editAuctionPage.currentStartPrice') }}: {{ item.pocetna_cijena }}</p>

      <div class="q-ml-sm flex flex-start q-gutter-sm">
        <div style="width: 300px">
          <q-input
            filled
            v-model="predmet_novo.vrijeme_pocetka"
            :label="t('editAuctionPage.startDate')"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="predmet_novo.vrijeme_pocetka" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('common.close')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="predmet_novo.vrijeme_pocetka" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('common.close')" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div style="width: 300px">
          <q-input
            filled
            v-model="predmet_novo.vrijeme_zavrsetka"
            :label="t('editAuctionPage.endDate')"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="predmet_novo.vrijeme_zavrsetka" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('common.close')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="predmet_novo.vrijeme_zavrsetka" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="t('common.close')" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div style="height: 25px"></div>
      <p>{{ t('editAuctionPage.currentStartDate') }}: {{ formattedDate(item.vrijeme_pocetka) }}</p>
      <p>{{ t('editAuctionPage.currentEndDate') }}: {{ formattedDate(item.vrijeme_zavrsetka) }}</p>

      <q-btn
        type="submit"
        :label="t('editAuctionPage.edit')"
        color="primary"
        class="q-mt-md"
      />
    </q-form>

    <div style="height: 25px"></div>
    <q-separator />

    <h5 class="text-h5 text-blue q-my-md">{{ t('editAuctionPage.imageManagement') }}</h5>

    <div style="width: 600px">
      <q-card-section class="q-pt-none">
        <template v-if="!showSingleImage && item.slike && item.slike.length > 1">
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
          <q-img v-if="showSingleImage" :src="item.slike ? item.slike[0] : item.slika" />
        </template>
      </q-card-section>
    </div>

    <q-btn
      type="submit"
      :label="t('editAuctionPage.deleteImage')"
      color="primary"
      class="q-my-md"
      @click="obrisiTrenutnuSliku()"
    />
    <p>{{ t('editAuctionPage.deleteImageHint') }}</p>

    <div>
      <input type="file" name="files" accept="image/*" @change="onFileChange" multiple />
      <q-btn
        type="submit"
        :label="t('editAuctionPage.addImages')"
        color="primary"
        class="q-my-md"
        @click="dodajNoveSlike()"
      />
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import imageCompression from "browser-image-compression";
import { useI18n } from "vue-i18n";

export default {
  computed: {
    id_predmeta() {
      return this.$route.query.id_predmeta;
    },

    startingIndex() {
      return 2;
    },

    currentCategoryLabel() {
      const found = this.kategorije.find(
        (kategorija) => kategorija.key === this.item.id_kategorije
      );
      return found ? found.label : "";
    },
  },

  data() {
    return {
      item: [],
      showDialog: false,
      odabranaCijena: null,
      prices: [],
      potvrdjenaCijena: null,
      showSingleImage: false,
      index: 1,
      predmet_novo: {
        naziv_predmeta: "",
        opis_predmeta: "",
        pocetna_cijena: "",
        vrijeme_pocetka: "",
        vrijeme_zavrsetka: "",
        id_kategorije: "",
      },
      kategorije: [],
      files: [],
      file: null,
      base64Images: [],
      vrijemePocetka: "",
      vrijemeZavrsetka: "",
    };
  },

  async mounted() {
    await this.dohvatiKategorije();
    await this.dohvatiPredmet();
  },

  methods: {
    async dohvatiKategorije() {
      try {
        const response = await axios.get("http://localhost:3000/api/all-kategorija/");
        this.kategorije = response.data.map((kategorija) => ({
          label: kategorija.naziv_kategorije,
          key: kategorija.id_kategorije,
        }));
      } catch (error) {
        console.error("Greška pri dohvatu kategorija", error);
      }
    },

    async dohvatiPredmet() {
      await axios.get("http://localhost:3000/api/get-predmet2/" + this.id_predmeta, {}).then((response) => {
        this.item = response.data[0];
        if (this.item.slike && this.item.slike.length > 0) {
          if (this.item.slike.length === 1) {
            this.showSingleImage = true;
            this.item.slika = this.item.slike[0];
          } else {
            this.showSingleImage = false;
          }
        }
      });
    },

    formattedDate(dateString) {
      return new Date(dateString).toLocaleString(this.$i18n.locale).replace(",", "");
    },

    provjeraPolja() {
      if (
        this.predmet_novo.naziv_predmeta == "" &&
        this.predmet_novo.opis_predmeta == "" &&
        this.predmet_novo.pocetna_cijena == "" &&
        this.predmet_novo.vrijeme_pocetka == "" &&
        this.predmet_novo.vrijeme_zavrsetka == "" &&
        this.predmet_novo.id_kategorije == ""
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("editAuctionPage.noChanges"),
          icon: "warning",
        });
      } else {
        this.izmjenaPredmeta();
      }
    },

    ocistiPolja() {
      this.predmet_novo.naziv_predmeta = "";
      this.predmet_novo.opis_predmeta = "";
      this.predmet_novo.pocetna_cijena = "";
      this.predmet_novo.vrijeme_pocetka = "";
      this.predmet_novo.vrijeme_zavrsetka = "";
      this.predmet_novo.id_kategorije = "";
    },

    async izmjenaPredmeta() {
      if (this.predmet_novo.naziv_predmeta == "") this.predmet_novo.naziv_predmeta = this.item.naziv_predmeta;
      if (this.predmet_novo.opis_predmeta == "") this.predmet_novo.opis_predmeta = this.item.opis_predmeta;
      if (this.predmet_novo.pocetna_cijena == "") this.predmet_novo.pocetna_cijena = this.item.pocetna_cijena;
      if (this.predmet_novo.vrijeme_pocetka == "") {
        this.predmet_novo.vrijeme_pocetka = this.item.vrijeme_pocetka;
      } else {
        this.predmet_novo.vrijeme_pocetka = new Date(this.predmet_novo.vrijeme_pocetka).setHours(
          new Date(this.predmet_novo.vrijeme_pocetka).getHours() + 2
        );
      }
      if (this.predmet_novo.vrijeme_zavrsetka == "") {
        this.predmet_novo.vrijeme_zavrsetka = this.item.vrijeme_zavrsetka;
      } else {
        this.predmet_novo.vrijeme_zavrsetka = new Date(this.predmet_novo.vrijeme_zavrsetka).setHours(
          new Date(this.predmet_novo.vrijeme_zavrsetka).getHours() + 2
        );
      }
      if (this.predmet_novo.id_kategorije == "") this.predmet_novo.id_kategorije = this.item.id_kategorije;

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.put(
          "http://localhost:3000/api/izmjenaPredmeta/" + this.id_predmeta,
          this.predmet_novo,
          { headers }
        );

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("editAuctionPage.updateSuccess"),
        });

        await this.dohvatiPredmet();
        this.ocistiPolja();
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("editAuctionPage.updateFailed"),
        });
        console.log(error);
      }
    },

    async obrisiTrenutnuSliku() {
      const idSlikeZaBrisanje = this.item.id_slika[this.index - 1];
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        await axios.delete("http://localhost:3000/api/brisanjeSlike/" + idSlikeZaBrisanje, { headers });

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("editAuctionPage.imageDeleteSuccess"),
        });
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("editAuctionPage.imageDeleteFailed"),
        });
        console.log(error);
      }

      await this.dohvatiPredmet();
    },

    async dodajNoveSlike() {
      const formData = new FormData();
      this.base64Images.forEach((base64String, index) => {
        formData.append(`file${index}`, base64String);
      });
      formData.append("id_predmeta", this.id_predmeta);

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        await axios.post("http://localhost:3000/api/dodavanjeSlika", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...headers,
          },
        });

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("editAuctionPage.addImagesSuccess"),
        });
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("editAuctionPage.addImagesFailed"),
        });
        console.log(error);
      }

      await this.dohvatiPredmet();
    },

    async onFileChange(e) {
      this.files = Array.from(e.target.files);
      await this.convertImage();
    },

    async convertImage() {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        this.base64Images = [];
        for (const file of this.files) {
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();

          const promise = new Promise((resolve, reject) => {
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.onerror = (error) => reject(error);
          });

          reader.readAsDataURL(compressedFile);
          const base64String = await promise;
          this.base64Images.push(base64String);
          this.slika = base64String;
        }
      } catch (error) {
        console.error(error);
        alert(this.t("editAuctionPage.imageCompressionError"));
      }
    },
  },

  setup() {
    const { t } = useI18n();

    return {
      t,
      slide: ref(2),
      autoplay: ref(false),
    };
  },
};
</script>