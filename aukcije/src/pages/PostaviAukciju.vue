<template>
  <q-page class="window-height window-width flex flex-center page-bg">

    <div class="page-wrapper">

      <div class="text-center q-mb-lg">
        <div class="title-text">
          Postavi aukciju
        </div>
      </div>

      <q-card class="main-card q-pa-lg">

        <q-form class="q-gutter-lg form-inner" @submit.prevent="submitForm">

          <div class="form-content">

            <div>
              <div class="label-text q-mb-sm">Naziv proizvoda</div>

              <q-input
                outlined
                bg-color="white"
                v-model="naziv_predmeta"
                placeholder="npr. BMW 320d 2020"
                class="custom-input"
              />
            </div>

            <div class="row q-col-gutter-lg">

              <div class="col-12 col-md-6">
                <div class="label-text q-mb-sm">Kategorija</div>

                <q-select
                  outlined
                  bg-color="white"
                  v-model="selectedKategorija"
                  :options="kategorije"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  label="Odaberi kategoriju"
                  class="custom-input"
                />
              </div>

              <div class="col-12 col-md-6">
                <div class="label-text q-mb-sm">Početna cijena (€)</div>

                <q-input
                  outlined
                  bg-color="white"
                  type="number"
                  v-model="pocetna_cijena"
                  placeholder="0.00"
                  class="custom-input"
                />
              </div>

            </div>

            <div class="row q-col-gutter-lg">

              <div class="col-12 col-md-6">
                <div class="label-text q-mb-sm">
                  Datum i vrijeme početka aukcije
                </div>

                <q-input
                  outlined
                  bg-color="white"
                  v-model="vrijemePocetka"
                  class="custom-input"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer text-grey-7">
                      <q-popup-proxy>
                        <q-date
                          v-model="vrijemePocetka"
                          mask="YYYY-MM-DD HH:mm"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <div class="label-text q-mb-sm">
                  Datum i vrijeme završetka aukcije
                </div>

                <q-input
                  outlined
                  bg-color="white"
                  v-model="vrijemeZavrsetka"
                  class="custom-input"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer text-grey-7">
                      <q-popup-proxy>
                        <q-date
                          v-model="vrijemeZavrsetka"
                          mask="YYYY-MM-DD HH:mm"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

            </div>

            <div>
              <div class="label-text q-mb-sm">Opis proizvoda</div>

              <q-input
                outlined
                bg-color="white"
                type="textarea"
                rows="5"
                v-model="opis_predmeta"
                placeholder="Detaljno opišite proizvod..."
                class="custom-input"
              />
            </div>

            <div>
              <div class="label-text q-mb-md">Unesite slike</div>

              <div class="upload-box">

                <div
                  v-if="base64Images.length"
                  class="row q-col-gutter-md q-mb-md"
                >
                  <div
                    v-for="(img, index) in base64Images"
                    :key="index"
                    class="col-6 col-sm-4 col-md-3"
                  >
                    <div class="image-wrapper">

                      <img :src="img" class="preview-image" />

                      <q-btn
                        dense
                        round
                        icon="close"
                        color="negative"
                        class="remove-btn"
                        @click="removeImage(index)"
                      />

                    </div>
                  </div>
                </div>

                <div class="upload-content">

                  <q-icon name="upload" size="38px" class="upload-icon" />

                  <div class="upload-title">
                    Kliknite za odabir slika
                  </div>

                  <div class="upload-subtitle">
                    PNG, JPG do 10MB
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    @change="onFileChange"
                    class="file-input"
                  />

                </div>

              </div>
            </div>

          </div>

          <div class="row q-col-gutter-md q-pt-md">

            <div class="col">
              <q-btn
                label="Postavi"
                type="submit"
                class="full-width submit-btn"
                unelevated
              />
            </div>

            <div class="col">
              <q-btn
                label="Otkaži"
                class="full-width cancel-btn"
                unelevated
                @click="otkazi_gumb"
              />
            </div>

          </div>

        </q-form>

        <q-dialog v-model="showDialog">
          <q-card style="min-width: 300px">

            <q-card-section class="text-center text-subtitle1">
              Predmet uspješno dodan!
            </q-card-section>

            <q-card-actions align="center">
              <q-btn
                flat
                label="OK"
                color="primary"
                v-close-popup
                @click="closeAndReload"
              />
            </q-card-actions>

          </q-card>
        </q-dialog>

      </q-card>

    </div>

  </q-page>
</template>

<script>
import imageCompression from "browser-image-compression";
import axios from "axios";

export default {
  data() {
    return {
      sifra_predmeta: null,
      naziv_predmeta: "",
      opis_predmeta: "",
      selectedKategorija: null,
      selectedKorisnik: null,
      pocetna_cijena: "",
      slika: null,
      file: null,
      base64Image: null,
      base64Text: null,
      imageUrl: "",
      showDialog: false,
      vrijemePocetka: null,
      vrijemeZavrsetka: null,
      decoded: null,
      insertedPredmetId_dohvat: null,

      kategorije: [],
      korisnik: [],
      files: [],
      base64Images: [],
    };
  },

  methods: {

    async checkUserRole() {
      if (!this.decoded || !(this.decoded.uloga === "admin" || this.decoded.uloga === "user")) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Niste prijavljeni, pristup odbijen",
          icon: "warning",
        });
        this.$router.push("pocetna");
      }
    },

    async onFileChange(e) {
      this.files = Array.from(e.target.files);

      const allImages = this.files.every(file => file.type.startsWith("image/"));

      if (!allImages) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Dopuštene su samo slike.",
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
            reader.onerror = (err) => reject(err);
          });

          reader.readAsDataURL(compressedFile);
          const base64String = await promise;

          this.base64Images.push(base64String);
          this.slika = base64String;
        }
      } catch (error) {
        console.error(error);
        alert("Došlo je do pogreške prilikom kompresije slika.");
      }
    },

    closeAndReload() {
      this.showDialog = false;
      this.$router.push({
        path: "prikaz",
        query: { id_predmeta: this.insertedPredmetId_dohvat }
      });
    },

    otkazi_gumb() {
      this.$router.push("/Pocetna").then(() => {
        window.location.reload();
      });
    },

    async submitForm() {

      const requiredFields = [
        this.naziv_predmeta,
        this.opis_predmeta,
        this.pocetna_cijena,
        this.selectedKategorija
      ];

      const hasEmptyFields = requiredFields.some(field => !field);

      if (hasEmptyFields) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Niste ispunili sva polja",
          icon: "warning",
        });
        return;
      }

      if (!this.files.length) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Molimo odaberite barem jednu sliku.",
          icon: "warning",
        });
        return;
      }

      if (
        this.vrijemePocetka &&
        this.vrijemeZavrsetka &&
        this.vrijemePocetka > this.vrijemeZavrsetka
      ) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Datum početka ne može biti nakon datuma završetka.",
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

        const response = await axios.post(
          "http://localhost:3000/unosPredmeta",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...headers,
            },
          }
        );

        if (response.data && response.data.insertedPredmetId) {
          this.insertedPredmetId_dohvat = response.data.insertedPredmetId;
        }

        this.showDialog = true;

      } catch (error) {
        console.error(error);
      }
    },
  },

  mounted() {
    function parseJwt(token) {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
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
          this.kategorije = response.data.kategorije.map(k => ({
            label: k.naziv_kategorije,
            value: k.id_kategorije,
          }));

          this.korisnik = response.data.korisnici.map(k => ({
            label: k.ime_korisnika,
            value: k.id_korisnika,
          }));
        })
        .catch(err => console.error(err));
    }

    this.checkUserRole();

    const now = new Date();
    now.setHours(now.getHours() + 2);

    this.vrijemePocetka = now.toISOString().slice(0, 16).replace("T", " ");
    this.vrijemeZavrsetka = this.vrijemePocetka;
  },
};
</script>

<style>
.page-bg {
  background: #edf2f7;
  padding: 30px;
}

.page-wrapper {
  width: 100%;
  max-width: 900px;
}

.main-card {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  border-radius: 22px;
  background: white;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
}

.title-text {
  font-size: 34px;
  font-weight: 700;
  color: #183153;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #243b53;
}

.custom-input .q-field__control {
  border-radius: 12px !important;
}

.custom-input textarea {
  padding-top: 14px;
}

.upload-box {
  border: 2px dashed #d7dee7;
  border-radius: 18px;
  padding: 30px 20px;
  background: #fafcff;
  position: relative;
}

.upload-content {
  text-align: center;
  position: relative;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 10px;
}

.upload-title {
  font-size: 16px;
  color: #334155;
  font-weight: 500;
}

.upload-subtitle {
  color: #94a3b8;
  margin-top: 5px;
  font-size: 13px;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.image-wrapper {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 12px;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
}

.submit-btn {
  background: #00c73c;
  color: white;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}

.cancel-btn {
  background: #ff1e2d;
  color: white;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}

.form-inner {
  max-width: 760px;
  margin: 0 auto;
}

.form-content {
  padding: 0 24px;
}
</style>