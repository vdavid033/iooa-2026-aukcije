<template>
  <div class="profile-page q-pa-md">
    <!-- PROFIL -->
    <q-card class="profile-hero q-mb-xl">
      <q-card-section class="profile-hero__top">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-md">
              <q-avatar size="110px" class="shadow-6">
                <img src="~assets/profilna.png" alt="Profilna slika" />
              </q-avatar>

              <div>
                <div class="text-h4 text-weight-bold text-primary">
                  {{ $t("profilePage.user") }}
                  {{ korisnik_trenutno.ime_korisnika }}
                  {{ korisnik_trenutno.prezime_korisnika }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t("profilePage.subtitle") }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <q-btn
              color="primary"
              unelevated
              icon="edit"
              :label="$t('profilePage.editUserData')"
              @click="$router.push('/UpdateProfil')"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="person" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">
                    {{ $t("profilePage.firstName") }}
                  </div>
                  <div class="text-weight-medium">
                    {{ korisnik_trenutno.ime_korisnika }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="badge" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">
                    {{ $t("profilePage.lastName") }}
                  </div>
                  <div class="text-weight-medium">
                    {{ korisnik_trenutno.prezime_korisnika }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="mail" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">
                    {{ $t("profilePage.email") }}
                  </div>
                  <div class="text-weight-medium ellipsis">
                    {{ korisnik_trenutno.email_korisnika }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="info-tile">
              <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="place" color="primary" />
                <div>
                  <div class="text-caption text-grey-6">
                    {{ $t("profilePage.address") }}
                  </div>
                  <div class="text-weight-medium">
                    {{ korisnik_trenutno.adresa_korisnika }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- SPREMLJENE AUKCIJE -->
    <div class="section-head q-mb-md">
      <h5>{{ $t("savedAuctions.title") }}</h5>
    </div>

    <p v-if="spremljeneAukcije.length === 0" class="text-grey">
      {{ $t("savedAuctions.empty") }}
    </p>

    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="predmet in spremljeneAukcije"
        :key="predmet.id_predmeta"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="saved-item-card">
          <q-img v-if="predmet.slika" :src="predmet.slika" ratio="4/3" />

          <q-card-section>
            <div class="row justify-between items-center">
              <div class="text-h6 text-primary">
                {{ $pick(predmet.naziv_predmeta, predmet.naziv_predmeta_en) }}
              </div>
              <q-badge color="green">
                {{ $t("profilePage.active") }}
              </q-badge>
            </div>

            <div class="q-mt-sm text-body2">
              {{ $t("profilePage.startingPrice") }}:
              {{ predmet.pocetna_cijena }}$
            </div>
            <div class="text-body2">
              {{ $t("profilePage.endTime") }}:
              {{ formattedDate(predmet.vrijeme_zavrsetka) }}
            </div>
            <div class="text-body2 text-weight-bold">
              {{ $t("profilePage.currentPrice") }}:
              {{ predmet.trenutna_cijena }}$
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="between">
            <q-btn
              flat
              :label="$t('profilePage.view')"
              @click="pregledPredmeta(predmet.id_predmeta)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="favorite"
              :disable="
                uklanjanjeSpremljenihIds.includes(Number(predmet.id_predmeta))
              "
              @click.stop="ukloniSpremljenuAukciju(predmet.id_predmeta)"
            >
              <q-tooltip>{{ $t("savedAuctions.remove") }}</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- PREDMETI -->
    <div class="section-head q-mb-md">
      <h5>{{ $t("profilePage.yourAuctionItems") }}</h5>
    </div>

    <p v-if="vlastitiPredmeti.length === 0" class="text-grey">
      {{ $t("profilePage.noAuctionItems") }}
    </p>

    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="predmet in vlastitiPredmeti"
        :key="predmet.id_predmeta"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="auction-card">
          <q-img v-if="predmet.slika" :src="predmet.slika" ratio="4/3" />

          <q-card-section>
            <div class="row justify-between items-center">
              <div class="text-h6 text-primary">
                {{ $pick(predmet.naziv_predmeta, predmet.naziv_predmeta_en) }}
              </div>

              <q-badge :color="provjeriDatum(predmet) ? 'green' : 'grey'">
                {{
                  provjeriDatum(predmet)
                    ? $t("profilePage.active")
                    : $t("profilePage.finished")
                }}
              </q-badge>
            </div>

            <div class="q-mt-sm text-body2">
              {{ $t("profilePage.startingPrice") }}:
              {{ predmet.pocetna_cijena }}$
            </div>
            <div class="text-body2">
              {{ $t("profilePage.startTime") }}:
              {{ formattedDate(predmet.vrijeme_pocetka) }}
            </div>
            <div class="text-body2">
              {{ $t("profilePage.endTime") }}:
              {{ formattedDate(predmet.vrijeme_zavrsetka) }}
            </div>
            <div class="text-body2">
              {{ $t("profilePage.remainingTime") }}:
              {{ predmet.preostalo_vrijeme }} h
            </div>
            <div class="text-body2 text-weight-bold">
              {{ $t("profilePage.currentPrice") }}:
              {{ predmet.trenutna_cijena }}$
            </div>


          <q-separator />


            <q-card-actions align="between">
              <q-btn
                flat
                :label="$t('profilePage.view')"
                @click="pregledPredmeta(predmet.id_predmeta)"
              />

              <div v-if="provjeriDatum(predmet)">
                <q-btn
                  flat
                  color="primary"
                  :label="$t('profilePage.edit')"
                  @click="izmijeniPredmet(predmet.id_predmeta)"
                />
                <q-btn
                  flat
                  color="negative"
                  :label="$t('profilePage.delete')"
                  @click="obrisiPredmet(predmet.id_predmeta)"
                />
              </div>
            </q-card-actions>


            <div v-if="!provjeriDatum(predmet)" >


              <q-separator />

              <div class="komunikacija-nakon-kupnje-title">
                Komunikacija nakon kupnje
              </div>


              <div class="communication-actions">
                <q-btn
                  v-for="gumb in komunikacijaGumbi"
                  :key="'seller-' + predmet.id_predmeta + '-' + gumb.polje"
                  dense
                  unelevated
                  class="communication-btn"
                  :class="{ 'communication-btn--readonly': !mozeKliknutiKomunikaciju('seller', gumb, predmet) }"
                  :color="bojaKomunikacijskogGumba(predmet, gumb)"
                  :label="gumb.simbol"
                  @click="otvoriKomunikaciju(predmet, gumb, 'seller')"
                >
                  <q-tooltip>
                    <div style="white-space: pre-line">{{ porukaKomunikacijskogGumba(predmet, gumb) }}</div>
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- PONUDE -->
    <div class="section-head q-mb-md">
      <h5>{{ $t("profilePage.yourBids") }}</h5>
    </div>

    <p v-if="vlastitePonude.length === 0" class="text-grey">
      {{ $t("profilePage.noBids") }}
    </p>

    <div class="row q-col-gutter-md">
      <div
        v-for="ponuda in vlastitePonude"
        :key="ponuda.id_ponude"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="bid-card">
          <q-card-section>
            <q-img
              v-if="ponuda.slika"
              :src="ponuda.slika"
              style="height: 150px"
            />

            <div class="text-subtitle1 text-primary q-mt-sm">
              {{ $pick(ponuda.naziv_predmeta, ponuda.naziv_predmeta_en) }}
            </div>

            <div class="text-body2">
              {{ $t("profilePage.description") }}:
              {{ $pick(ponuda.opis_predmeta, ponuda.opis_en) }}
            </div>

            <div class="text-body2">
              {{ $t("profilePage.bidValue") }}: {{ ponuda.vrijednost_ponude }}$
            </div>

            <div class="text-body2">
              {{ $t("profilePage.bidTime") }}:
              {{ formattedDate(ponuda.vrijeme_ponude) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- OSVOJENI PREDMETI -->
    <div class="section-head q-mb-md q-mt-xl">
      <h5>{{ $t("profilePage.yourWonItems") }}</h5>
    </div>

    <p v-if="vlastitiOsvojeniPredmeti.length === 0" class="text-grey">
      {{ $t("profilePage.noWonItems") }}
    </p>

    <div class="row q-col-gutter-md">
      <div
        v-for="osvojeniPredmet in vlastitiOsvojeniPredmeti"
        :key="osvojeniPredmet.id_predmeta"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="won-item-card">
          <q-img
            v-if="osvojeniPredmet.slika"
            :src="osvojeniPredmet.slika"
            style="height: 200px"
          />

          <q-card-section>
            <div class="text-h6 text-primary">
              {{
                $pick(
                  osvojeniPredmet.naziv_predmeta,
                  osvojeniPredmet.naziv_predmeta_en,
                )
              }}
            </div>

            <div class="q-mt-sm text-body2">
              {{
                $pick(osvojeniPredmet.opis_predmeta, osvojeniPredmet.opis_en)
              }}
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body2 text-weight-bold text-positive">
              {{ $t("profilePage.finalPrice") }}:
              {{ osvojeniPredmet.konacna_cijena }}$
            </div>

            <q-btn
              v-if="!osvojeniPredmet.je_ocijenjeno"
              class="q-mt-md"
              color="primary"
              outline
              icon="star"
              :label="$t('profilePage.rateSeller')"
              @click="otvoriOcjenjivanje(osvojeniPredmet)"
            />

            <q-btn
              v-else
              class="q-mt-md"
              color="positive"
              outline
              icon="check"
              :label="$t('profilePage.sellerRated')"
              disable
            />

            <q-separator class="q-my-md" />


            <div class="komunikacija-nakon-kupnje-title">
                Komunikacija nakon kupnje
            </div>


            <div class="communication-actions">
              <q-btn
                v-for="gumb in komunikacijaGumbi"
                :key="'buyer-' + osvojeniPredmet.id_predmeta + '-' + gumb.polje"
                dense
                unelevated
                class="communication-btn"
                :class="{ 'communication-btn--readonly': !mozeKliknutiKomunikaciju('buyer', gumb, osvojeniPredmet) }"
                :color="bojaKomunikacijskogGumba(osvojeniPredmet, gumb)"
                :label="gumb.simbol"
                @click="otvoriKomunikaciju(osvojeniPredmet, gumb, 'buyer')"
              >
                <q-tooltip>
                  <div style="white-space: pre-line">{{ porukaKomunikacijskogGumba(osvojeniPredmet, gumb) }}</div>
                </q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="ocjenaDialog">
      <q-card class="rating-dialog" style="width: 430px; max-width: 90vw">
        <q-card-section class="q-pb-sm">
          <div class="text-h6">
            {{ $t("profilePage.rateSellerTitle") }} #{{
              odabraniOsvojeniPredmet?.id_prodavatelja
            }}
          </div>

          <div class="text-body2 text-grey q-mt-sm">
            {{ $t("auctionViewPage.item") }}:
            {{
              $pick(
                odabraniOsvojeniPredmet?.naziv_predmeta,
                odabraniOsvojeniPredmet?.naziv_predmeta_en,
              )
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-select
            outlined
            v-model="ocjenaProdavatelja"
            :options="[1, 2, 3, 4, 5]"
            :label="$t('profilePage.ratingSeller')"
          />

          <q-input
            outlined
            type="textarea"
            v-model="komentarProdavatelja"
            :label="$t('profilePage.comment')"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            unelevated
            :label="$t('profilePage.saveRating')"
            color="primary"
            @click="spremiOcjenuProdavatelja"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <q-dialog v-model="komunikacijaDialog">
      <q-card class="communication-dialog" style="width: 430px; max-width: 90vw">
        <q-card-section class="q-pb-sm">
          <div class="text-h6">{{ odabraniKomunikacijskiGumb?.naziv }}</div>
          <div class="text-body2 text-grey q-mt-sm">
            {{ $t("auctionViewPage.item") }}:
            {{
              $pick(
                odabraniKomunikacijskiPredmet?.naziv_predmeta,
                odabraniKomunikacijskiPredmet?.naziv_predmeta_en,
              )
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-option-group
            v-model="komunikacijaForma.odabir"
            :options="komunikacijskeOpcije"
            type="radio"
          />

          <template v-if="odabraniKomunikacijskiGumb?.polje === 'poslano'">
            <q-input
              outlined
              type="date"
              v-model="komunikacijaForma.datum_slanja"
              :label="$t('profilePage.shippingDate')"
              class="q-mt-md"
              :disable="komunikacijaForma.odabir === 'delete'"
            />
            <q-input
              outlined
              v-model="komunikacijaForma.broj_za_pracenje"
              :label="$t('profilePage.trackingNumber')"
              class="q-mt-md"
              :disable="komunikacijaForma.odabir === 'delete'"
            />
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="$t('profilePage.saveCommunication')"
            @click="spremiKomunikaciju"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #f5f7fa, #e4ecff);
  min-height: 100vh;
}

.profile-hero {
  border-radius: 20px;
}

.info-tile {
  border-radius: 14px;
  transition: 0.2s;
}

.info-tile:hover {
  transform: translateY(-2px);
}

.auction-card,
.saved-item-card,
.bid-card,
.won-item-card {
  border-radius: 16px;
  transition: 0.25s;
}

.auction-card:hover,
.saved-item-card:hover,
.bid-card:hover,
.won-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.rating-dialog,
.communication-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.communication-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.communication-btn {
  min-width: 46px;
  font-weight: 700;
}

.communication-btn--readonly {
  opacity: 0.65;
}

.komunikacija-nakon-kupnje-title {
    margin-top: 10px;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: bold;
    color: #666;
    text-align: left;
}

.komunikacija-nakon-kupnje-buttons {
    display: flex;
    justify-content: center;
    gap: 5px;
    flex-wrap: wrap;
}

white-space: pre-line;

</style>

<script>
import axios from "axios";

export default {
  data() {
    return {
      korisnik_trenutno: {
        ime_korisnika: "",
        prezime_korisnika: "",
        email_korisnika: "",
        adresa_korisnika: "",
      },
      spremljeneAukcije: [],
      uklanjanjeSpremljenihIds: [],
      vlastitiPredmeti: [],
      vlastitePonude: [],
      vlastitiOsvojeniPredmeti: [],
      ocjenaDialog: false,
      odabraniOsvojeniPredmet: null,
      ocjenaProdavatelja: null,
      komentarProdavatelja: "",
      komunikacijaDialog: false,
      odabraniKomunikacijskiPredmet: null,
      odabraniKomunikacijskiGumb: null,
      komunikacijaForma: {
        odabir: null,
        datum_slanja: null,
        broj_za_pracenje: "",
      },
      komunikacijaKontekst: null,
      komunikacijaGumbi: [
        { polje: "placeno", vrijednost: "placeno", simbol: "$->", naziv: "Plaćeno", uloge: ["buyer"] },
        { polje: "primljena_uplata", vrijednost: "primljena_uplata", simbol: "->$", naziv: "Primljena uplata", uloge: ["seller"] },
        { polje: "poslano", vrijednost: "poslano", simbol: "\u2709->", naziv: "Poslano", uloge: ["seller"] },
        { polje: "posiljka_primljena", vrijednost: "posiljka_primljena", simbol: "->\u2709", naziv: "Pošiljka primljena", uloge: ["buyer"] },
        { polje: "posiljka_odgovara", vrijednost: "posiljka_odgovara", simbol: "✓/x", naziv: "Pošiljka odgovara oglašenom", uloge: ["buyer"] },
      ],
    };
  },

  computed: {
    komunikacijskeOpcije() {
      const gumb = this.odabraniKomunikacijskiGumb;
      if (!gumb) return [];

      if (gumb.polje === "posiljka_odgovara") {
        return [
          { label: this.$t("profilePage.packageMatches"), value: "posiljka_odgovara" },
          { label: this.$t("profilePage.packageDoesNotMatch"), value: "posiljka_ne_odgovara" },
          { label: this.$t("profilePage.deleteCommunicationRecord"), value: "delete" },
        ];
      }

      return [
        { label: gumb.naziv, value: gumb.vrijednost },
        { label: this.$t("profilePage.deleteCommunicationRecord"), value: "delete" },
      ];
    },
  },

  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const userId = this.getUserIdFromToken(token);
      const headers = { Authorization: `Bearer ${token}` };

      const userData = await this.fetchUserData(userId);
      this.korisnik_trenutno = userData;

      this.dohvatPredmeta(userId, headers);
      this.dohvatSpremljeneAukcije(headers);
      this.dohvatPonude(userId, headers);
      this.dohvatOsvojeniPredmeti(userId, headers);
    } catch (error) {
      console.error(error);
    }
  },

  methods: {
    async dohvatSpremljeneAukcije(headers) {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/spremljene-aukcije",
          { headers },
        );
        this.spremljeneAukcije = res.data;
      } catch (error) {
        console.error("Greška pri dohvatu spremljenih aukcija:", error);
      }
    },

    async ukloniSpremljenuAukciju(id) {
      const idPredmeta = Number(id);
      if (this.uklanjanjeSpremljenihIds.includes(idPredmeta)) return;

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      this.uklanjanjeSpremljenihIds.push(idPredmeta);

      try {
        await axios.delete(
          "http://localhost:3000/api/spremljene-aukcije/" + idPredmeta,
          { headers },
        );
        this.spremljeneAukcije = this.spremljeneAukcije.filter(
          (predmet) => Number(predmet.id_predmeta) !== idPredmeta,
        );
        this.$q.notify({
          type: "positive",
          message: this.$t("savedAuctions.removed"),
        });
      } catch (error) {
        console.error("Greška pri uklanjanju spremljene aukcije:", error);
        this.$q.notify({
          type: "negative",
          message: this.$t("savedAuctions.error"),
        });
      } finally {
        this.uklanjanjeSpremljenihIds =
          this.uklanjanjeSpremljenihIds.filter(
            (savedId) => savedId !== idPredmeta,
          );
      }
    },

    async dohvatPredmeta(userId, headers) {
      const res = await axios.get(
        "http://localhost:3000/api/vlastiti-predmeti/" + userId,
        { headers },
      );
      this.vlastitiPredmeti = res.data;
    },

    async dohvatPonude(userId, headers) {
      const res = await axios.get(
        "http://localhost:3000/api/vlastita-ponuda-korisnik/" + userId,
        { headers },
      );
      this.vlastitePonude = res.data;
    },

    async dohvatOsvojeniPredmeti(userId, headers) {
      const res = await axios.get(
        "http://localhost:3000/api/osvojeni-predmeti/" + userId,
        { headers },
      );

      console.log("Puni osvojeni predmeti:", JSON.stringify(res.data, null, 2));

      res.data.forEach((p, i) => {
        console.log(`Predmet ${i}:`, {
          id_predmeta: p.id_predmeta,
          naziv_predmeta: p.naziv_predmeta,
          slika_length: p.slika ? p.slika.length : "NULL",
          slika_start: p.slika ? p.slika.substring(0, 50) : "NULL",
        });
      });

      this.vlastitiOsvojeniPredmeti = res.data;
    },

    formattedDate(date) {
      return new Date(date).toLocaleString("hr-HR").replace(",", "");
    },

    pregledPredmeta(id) {
      this.$router.push({
        path: "prikaz",
        query: { id_predmeta: id },
      });
    },

    izmijeniPredmet(id) {
      this.$router.push({
        path: "izmjena_predmeta",
        query: { id_predmeta: id },
      });
    },

    async obrisiPredmet(id) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (confirm(this.$t("profilePage.confirmDelete"))) {
        await axios.delete("http://localhost:3000/api/brisanjePredmeta/" + id, {
          headers,
        });
        location.reload();
      }
    },

    getUserIdFromToken(token) {
      const base64 = token.split(".")[1];
      return JSON.parse(atob(base64)).id;
    },

    async fetchUserData(userId) {
      const res = await axios.get(
        `http://localhost:3000/api/korisnikinfo1/${userId}`,
      );
      return res.data[0];
    },

    provjeriDatum(predmet) {
      return new Date(predmet.vrijeme_zavrsetka) > new Date();
    },


    mozeKliknutiKomunikaciju(kontekst, gumb, predmet) {
      if (!gumb.uloge.includes(kontekst)) return false;

      // Za prodavatelja su klikabilni samo gumbi "primljena uplata" i "poslano"
      // u okviru "Vaši predmeti na aukciji", i to samo nakon završetka aukcije.

      if (kontekst === "seller") {
        return !this.provjeriDatum(predmet);
      }

      // Za kupca ostaje sigurnosna provjera da postoji transakcija.
      return !!predmet.id_transakcije;
    },

    bojaKomunikacijskogGumba(predmet, gumb) {
      const vrijednost = predmet[gumb.polje];
      if (!vrijednost) return "grey";
      if (gumb.polje === "posiljka_odgovara" && vrijednost === "posiljka_ne_odgovara") {
        return "negative";
      }
      return "positive";
    },

    porukaKomunikacijskogGumba(predmet, gumb) {
      const vrijednost = predmet[gumb.polje];
      if (!vrijednost) return this.$t("profilePage.noCommunicationData");

      const poruke = {
        placeno: this.$t("profilePage.paidTooltip"),
        primljena_uplata: this.$t("profilePage.paymentReceivedTooltip"),
        posiljka_primljena: this.$t("profilePage.packageReceivedTooltip"),
      };

      if (gumb.polje === "poslano") {
        const datum = predmet.datum_slanja ? this.formattedDate(predmet.datum_slanja) : "-";
        const pracenje = predmet.broj_za_pracenje || "-";
        const datumPrikaz = datum ? datum.toString().substring(0, 13) : "-";

        return `${this.$t("profilePage.sentTooltip")}\n${this.$t("profilePage.shippingDate")}: ${datumPrikaz}\n${this.$t("profilePage.trackingNumber")}: ${pracenje}`;
      }

      if (gumb.polje === "posiljka_odgovara") {
        return vrijednost === "posiljka_ne_odgovara"
          ? this.$t("profilePage.packageDoesNotMatchTooltip")
          : this.$t("profilePage.packageMatchesTooltip");
      }

      return poruke[gumb.polje] || this.$t("profilePage.noCommunicationData");
    },

    otvoriKomunikaciju(predmet, gumb, kontekst) {
      if (!this.mozeKliknutiKomunikaciju(kontekst, gumb, predmet)) return;

      this.odabraniKomunikacijskiPredmet = predmet;
      this.odabraniKomunikacijskiGumb = gumb;
      this.komunikacijaKontekst = kontekst;
      this.komunikacijaForma = {
        odabir: predmet[gumb.polje] || gumb.vrijednost,
        datum_slanja: predmet.datum_slanja ? String(predmet.datum_slanja).substring(0, 10) : null,
        broj_za_pracenje: predmet.broj_za_pracenje || "",
      };
      this.komunikacijaDialog = true;
    },

    async spremiKomunikaciju() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const gumb = this.odabraniKomunikacijskiGumb;
        const predmet = this.odabraniKomunikacijskiPredmet;

        await axios.post(
          "http://localhost:3000/api/komunikacija-nakon-prodaje",
          {
            id_transakcije: predmet.id_transakcije,
            id_predmeta: predmet.id_predmeta,
            polje: gumb.polje,
            vrijednost: this.komunikacijaForma.odabir,
            datum_slanja: this.komunikacijaForma.datum_slanja,
            broj_za_pracenje: this.komunikacijaForma.broj_za_pracenje,
          },
          { headers },
        );

        if (this.komunikacijaForma.odabir === "delete") {
          predmet[gumb.polje] = null;
          if (gumb.polje === "poslano") {
            predmet.datum_slanja = null;
            predmet.broj_za_pracenje = null;
          }
        } else {
          predmet[gumb.polje] = this.komunikacijaForma.odabir;
          if (gumb.polje === "poslano") {
            predmet.datum_slanja = this.komunikacijaForma.datum_slanja;
            predmet.broj_za_pracenje = this.komunikacijaForma.broj_za_pracenje;
          }
        }

        this.komunikacijaDialog = false;
        this.$q.notify({ type: "positive", message: this.$t("profilePage.communicationSaved") });
      } catch (error) {
        console.error(error);
        this.$q.notify({ type: "negative", message: this.$t("profilePage.communicationError") });
      }
    },

    otvoriOcjenjivanje(osvojeniPredmet) {
      this.odabraniOsvojeniPredmet = osvojeniPredmet;
      this.ocjenaProdavatelja = null;
      this.komentarProdavatelja = "";
      this.ocjenaDialog = true;
    },

    async spremiOcjenuProdavatelja() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.post(
          "http://localhost:3000/api/ocjena-prodavatelja",
          {
            id_transakcije: this.odabraniOsvojeniPredmet.id_transakcije,
            ocjena: this.ocjenaProdavatelja,
            komentar: this.komentarProdavatelja,
          },
          { headers },
        );

        alert(this.$t("profilePage.ratingSaved"));

        this.odabraniOsvojeniPredmet.je_ocijenjeno = 1;
        this.ocjenaDialog = false;
      } catch (error) {
        console.error(error);

        const poruka =
          error.response?.data?.message || this.$t("profilePage.ratingError");

        alert(poruka);
      }
    },
  },
};
</script>
