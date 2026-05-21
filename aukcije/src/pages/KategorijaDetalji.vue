<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 class="text-h3 text-blue q-my-md">
        {{ t('editCategoryPage.title') }}
      </h5>
    </div>

    <q-form @submit="izmjenaKategorije()">
      <q-input
        v-model="kategorija_novo.naziv_kategorije"
        :label="t('editCategoryPage.name')"
        outlined
        dense
        type="text"
      />

      <p ref="p_naziv"></p>

      <q-btn
        type="submit"
        :label="t('editCategoryPage.edit')"
        color="primary"
        class="q-mt-md"
      />
    </q-form>
  </q-page>
</template>

<script>
import axios from "axios";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      kateogrija_trenutno: {
        naziv_kategorije: "",
      },
      kategorija_novo: {
        naziv_kategorije: "",
        id_kategorije: this.$route.params.id,
      },
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const id = this.$route.params.id;

    await this.dohvatiKategoriju(id, headers);
    this.ispisiPodatke();
  },

  methods: {
    async dohvatiKategoriju(id, headers) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/kategorijainfo/" + id,
          { headers }
        );
        this.kateogrija_trenutno = response.data[0];
      } catch (error) {
        console.error("Greška pri dohvatu kategorije", error);
      }
    },

    ispisiPodatke() {
      try {
        this.$refs.p_naziv.textContent =
          this.t("editCategoryPage.currentName") +
          ": " +
          this.kateogrija_trenutno.naziv_kategorije;
      } catch (error) {
        console.error("Greška pri upisivanju podataka", error);
      }
    },

    ocistiPolja() {
      this.kategorija_novo.naziv_kategorije = "";
    },

    previosPage() {
      setTimeout(() => {
        window.history.back();
      }, 500);
    },

    async izmjenaKategorije() {
      if (this.kategorija_novo.naziv_kategorije == "") {
        this.kategorija_novo.naziv_kategorije =
          this.kateogrija_trenutno.naziv_kategorije;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.put(
          "http://localhost:3000/api/izmjenaKategorije",
          this.kategorija_novo,
          { headers }
        );

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("editCategoryPage.updateSuccess"),
        });

        await this.dohvatiKategoriju(
          this.kategorija_novo.id_kategorije,
          headers
        );
        this.ispisiPodatke();
        this.ocistiPolja();

        this.previosPage();
      } catch (error) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("editCategoryPage.updateFailed"),
        });
        console.error(error);
      }
    },
  },
};
</script>