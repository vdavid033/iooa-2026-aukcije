<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      :title="t('adminUsersPage.title')"
      :rows-per-page-label="t('adminUsersPage.rowsPerPage')"
      :rows="korisnici"
      :col-props="colProps"
      :columns="stupci"
    >
      <template v-slot:body-cell-ime_korisnika="props">
        {{ props.row.ime_korisnika }}
      </template>

      <template v-slot:body-cell-prezime_korisnika="props">
        {{ props.row.prezime_korisnika }}
      </template>

      <template v-slot:body-cell-email_korisnika="props">
        {{ props.row.email_korisnika }}
      </template>

      <template v-slot:body-cell-adresa_korisnika="props">
        {{ props.row.adresa_korisnika }}
      </template>

      <template v-slot:body-cell-gumbovi="props">
        <q-btn-group spread>
          <q-btn
            color="primary"
            :label="t('common.edit')"
            @click="odiNaDetalje(props.row.id_korisnika)"
          />
          <q-btn
            color="red"
            :label="t('common.delete')"
            @click="obrisiKorisnika(props.row.id_korisnika)"
          />
        </q-btn-group>
      </template>
    </q-table>
  </div>
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
      korisnici: [],
      stupci: []
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    this.stupci = [
      {
        name: "ime",
        required: true,
        label: this.t("adminUsersPage.firstName"),
        align: "left",
        field: "ime_korisnika",
        sortable: true,
      },
      {
        name: "prezime",
        required: true,
        label: this.t("adminUsersPage.lastName"),
        align: "left",
        field: "prezime_korisnika",
        sortable: true,
      },
      {
        name: "email",
        required: true,
        label: this.t("adminUsersPage.email"),
        align: "left",
        field: "email_korisnika",
        sortable: true,
      },
      {
        name: "adresa",
        required: true,
        label: this.t("adminUsersPage.address"),
        align: "left",
        field: "adresa_korisnika",
        sortable: true,
      },
      {
        name: "gumbovi",
        label: this.t("adminUsersPage.actions"),
        align: "center",
      },
    ];

    this.dohvatiKorisnike(headers);
  },

  methods: {
    async dohvatiKorisnike(headers) {
      try {
        const response = await axios.get("http://localhost:3000/api/korisnici", { headers });
        this.korisnici = response.data;
      } catch (error) {
        console.error("Greška pri dohvatu korisnika", error);
      }
    },

    odiNaDetalje(idKorisnika) {
      this.$router.push({ name: "korisnikdetalji", params: { id: idKorisnika } });
    },

    async obrisiKorisnika(idKorisnika) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (window.confirm(this.t("adminUsersPage.confirmDelete"))) {
        try {
          await axios.put(
            "http://localhost:3000/api/brisanjekorisnika/" + idKorisnika,
            null,
            { headers }
          );

          const response2 = await axios.get("http://localhost:3000/api/korisnici", { headers });
          this.korisnici = response2.data;

          this.$q.notify({
            color: "positive",
            position: "top",
            message: this.t("adminUsersPage.deleteSuccess"),
          });

        } catch (error) {
          console.error("Greška pri brisanju korisnika", error);

          this.$q.notify({
            color: "negative",
            position: "top",
            message: this.t("adminUsersPage.deleteError"),
          });
        }
      }
    },
  },
};
</script>

<style>
.centar_gumbovi {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
