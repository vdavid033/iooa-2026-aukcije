<template>
  <q-card class="q-pa-sm q-gutter-sm" flat bordered>
    <q-card-section>
      <div class="text-h3 text-bold text-center text-blue-7 q-ml-sm">
        {{ t('createAuction.title') }}
      </div>
    </q-card-section>

    <q-separator color="red" />

    <div class="q-ml-sm flex flex-start q-gutter-sm">
      <div style="width: 500px">
        <q-input filled type="text" :label="t('createAuction.productName')" v-model="naziv_predmeta" />
      </div>

      <div style="width: 500px">
        <q-select
          filled
          emit-value
          v-model="selectedKategorija"
          :label="t('createAuction.category')"
          :options="kategorije"
          option-label="label"
          option-value="value"
          map-options
        />
      </div>

      <div style="width: 500px">
        <q-input filled type="number" :label="t('createAuction.startPrice')" v-model="pocetna_cijena" />
      </div>
    </div>

    <div class="q-ml-sm flex flex-start q-gutter-sm">
      <div style="width: 500px">
        <q-input filled :model-value="formattedDate(vrijemePocetka)" :label="t('createAuction.startDate')" readonly>
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-date v-model="vrijemePocetka" mask="YYYY-MM-DD HH:mm" />
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-time v-model="vrijemePocetka" mask="YYYY-MM-DD HH:mm" :format24h="!isEnglish()" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div style="width: 500px">
        <q-input filled :model-value="formattedDate(vrijemeZavrsetka)" :label="t('createAuction.endDate')" readonly>
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-date v-model="vrijemeZavrsetka" mask="YYYY-MM-DD HH:mm" />
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-time v-model="vrijemeZavrsetka" mask="YYYY-MM-DD HH:mm" :format24h="!isEnglish()" />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div style="width: 500px">
        <q-input filled type="text" :label="t('createAuction.description')" v-model="opis_predmeta" />
      </div>
    </div>

    <div>
      <br />
      <p class="q-pl-md">{{ t('createAuction.uploadImage') }}</p>

      <input class="q-pl-md" type="file" accept="image/*" @change="onFileChange" multiple />

      <q-separator />

      <div v-if="base64Image">
        <img :src="base64Image" />
      </div>
    </div>

    <div class="q-ml-sm flex justify-center q-gutter-sm">
      <q-btn :label="t('createAuction.submit')" @click="submitForm" color="green" />
      <q-btn :label="t('createAuction.cancel')" @click="otkazi_gumb" color="red" />
    </div>
  </q-card>
</template>

<script>
import imageCompression from "browser-image-compression";
import axios from "axios";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
  },

  data() {
    return {
      sifra_predmeta: null,
      naziv_predmeta: "",
      opis_predmeta: "",
      selectedKategorija: null,
      pocetna_cijena: "",
      slika: null,
      file: null,
      base64Image: null,
      vrijemePocetka: null,
      vrijemeZavrsetka: null,
      decoded: null,
      insertedPredmetId_dohvat: null,

      kategorijeRaw: [],
      kategorije: [],
      korisnik: [],
      files: [],
      base64Images: [],
    };
  },

  watch: {
    locale() {
      this.setKategorijeOptions();
    },
  },

  methods: {
    isEnglish() {
      return String(this.locale || "hr").startsWith("en");
    },

    formattedDate(dateString) {
      if (!dateString) return "";

      const locale = this.isEnglish() ? "en-US" : "hr-HR";

      return new Date(dateString).toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: this.isEnglish(),
      });
    },

    categoryName(kategorija) {
      return this.isEnglish()
        ? kategorija.naziv_kategorije_en || kategorija.naziv_kategorije
        : kategorija.naziv_kategorije;
    },

    setKategorijeOptions() {
      this.kategorije = this.kategorijeRaw.map((kategorija) => ({
        label: this.categoryName(kategorija),
        value: kategorija.id_kategorije,
      }));
    },

    async onFileChange(e) {
      this.files = Array.from(e.target.files);

      const allImages = this.files.every((file) => file.type.startsWith("image/"));
      if (!allImages) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("createAuction.onlyImages"),
          icon: "warning",
        });
        this.files = [];
        e.target.value = null;
        return;
      }

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
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

          reader.readAsDataURL(compressedFile);
          const base64String = await promise;

          this.base64Images.push(base64String);
          this.slika = base64String;
          this.base64Image = base64String;
        }
      } catch (error) {
        console.error(error);
        alert("Došlo je do pogreške prilikom kompresije slika.");
      }
    },

    otkazi_gumb() {
      this.$router.push("/Pocetna").then(() => {
        window.location.reload();
      });
    },

    async submitForm() {
      if (
        !this.naziv_predmeta ||
        !this.opis_predmeta ||
        !this.pocetna_cijena ||
        !this.selectedKategorija
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("createAuction.requiredFields"),
          icon: "warning",
        });
        return;
      }

      if (!this.files.length) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("createAuction.selectImage"),
          icon: "warning",
        });
        return;
      }

      if (this.vrijemePocetka > this.vrijemeZavrsetka) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Datum i vrijeme početka aukcije ne može biti kasnije od datuma i vrijeme završetka aukcije.",
          icon: "warning",
        });
        return;
      }

      const formData = new FormData();

      this.base64Images.forEach((base64String, index) => {
        formData.append(`file${index}`, base64String);
      });

      formData.append("id_predmeta", this.sifra_predmeta);
      formData.append("naziv_predmeta", this.naziv_predmeta);
      formData.append("opis_predmeta", this.opis_predmeta);
      formData.append("vrijeme_pocetka", this.vrijemePocetka);
      formData.append("vrijeme_zavrsetka", this.vrijemeZavrsetka);
      formData.append("pocetna_cijena", this.pocetna_cijena);
      formData.append("id_korisnika", this.decoded.id);
      formData.append("id_kategorije", this.selectedKategorija);

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.post("http://localhost:3000/unosPredmeta", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...headers,
          },
        });

        const insertedId =
          response.data.insertedPredmetId ||
          response.data.insertId ||
          response.data.id_predmeta ||
          response.data.data?.insertId;

        if (!insertedId) {
          console.error("Backend nije vratio ID predmeta:", response.data);
          return;
        }

        console.log("Inserted ID:", insertedId);

        this.$router.push({
          path: "/prikaz",
          query: { id_predmeta: insertedId },
        });
      } catch (error) {
        console.error(error);
      }
    },
  },

  mounted() {
    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    }

    const token = localStorage.getItem("token");

    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      this.decoded = parseJwt(token);

      axios
        .get("http://localhost:3000/getUnosPredmeta", { headers })
        .then((response) => {
          this.kategorijeRaw = response.data.kategorije;
          this.setKategorijeOptions();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }

    const now = new Date();
    now.setHours(now.getHours() + 2);
    this.vrijemePocetka = now.toISOString().slice(0, 16).replace("T", " ");
    this.vrijemeZavrsetka = this.vrijemePocetka;
  },
};
</script>