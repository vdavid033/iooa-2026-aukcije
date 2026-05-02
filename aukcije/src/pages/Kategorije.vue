<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      :title="t('categories.title')"
      :rows-per-page-label="t('categories.rowsPerPage')"
      :rows="kategorije"
      :columns="stupci"
    >
      <template v-slot:body-cell-naziv_kategorije="props">
        {{ props.row.naziv_kategorije }}
      </template>

      <template v-slot:body-cell-gumbovi="props">
        <q-btn-group spread>
          <q-btn
            color="primary"
            :label="t('categories.edit')"
            icon-right="edit"
            @click="odiNaDetalje(props.row.id_kategorije)"
          />
          <q-btn
            color="red"
            :label="t('categories.delete')"
            icon-right="delete"
            @click="deleteKategorija(props.row.id_kategorije)"
          />
        </q-btn-group>
      </template>
    </q-table>

    <q-btn
      class="q-my-md"
      icon-right="add"
      color="primary"
      :label="t('categories.add')"
      @click="dodajKategoriju"
    />
  </div>
</template>

<script>
import axios from "axios";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
  },

  data() {
    return {
      kategorije: [],
    };
  },

  computed: {
    stupci() {
      return [
        {
          name: "naziv_kategorije",
          label: this.t("categories.name"),
          align: "left",
          field: "naziv_kategorije",
          sortable: true,
        },
        {
          name: "gumbovi",
          label: this.t("categories.actions"),
          align: "center",
        },
      ];
    },
  },

  watch: {
   
    locale() {
      this.fetchKategorije();
    },
  },

  mounted() {
    this.fetchKategorije();
  },

  methods: {
    async fetchKategorije() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          "http://localhost:3000/api/all-kategorija",
          {
            headers,
            params: {
              lang: this.locale,
            },
          }
        );

        this.kategorije = response.data;
      } catch (error) {
        console.error("Greška pri dohvatu kategorija", error);
      }
    },

    odiNaDetalje(idKategorije) {
      this.$router.push({
        name: "kategorijadetalji",
        params: { id: idKategorije },
      });
    },

    dodajKategoriju() {
      this.$router.push({ path: "dodajkategoriju" });
    },

    async deleteKategorija(idKategorije) {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.delete(
          "http://localhost:3000/api/deleteKategoriju/" + idKategorije,
          { headers }
        );

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.t("categories.deleted"),
        });

        this.fetchKategorije();
      } catch (error) {
        console.error("Greška pri brisanju kategorije.");

        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.t("categories.deleteError"),
          icon: "warning",
        });
      }
    },
  },
};
</script>