<template>
  <div class="q-pa-md">
    <q-table flat bordered :title="$t('categoriesPage.title')" :rows-per-page-label="$t('categoriesPage.rowsPerPage')" :rows="kategorije" :col-props="colProps" :columns="stupci">
      <template v-slot:body-cell-naziv_kategorije="props">
        {{ $pick(props.row.naziv_kategorije, props.row.naziv_kategorije_en) }}
      </template>
      <template v-slot:body-cell-gumbovi="props">
        <q-btn-group spread>
          <q-btn color="primary" :label="$t('categoriesPage.edit')" icon-right="edit" @click="odiNaDetalje(props.row.id_kategorije)" />
          <q-btn color="red" :label="$t('categoriesPage.delete')" icon-right="delete" @click="deleteKategorija(props.row.id_kategorije)" />
        </q-btn-group>
      </template>
    </q-table>
    <q-btn class="q-my-md" icon-right="add" color="primary" :label="$t('categoriesPage.addNew')" @click="dodajKategoriju()" />
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      kategorije: [],
    };
  },

  mounted() {
    // Get the JWT token from local storage
    const token = localStorage.getItem("token");

    // Set up the request headers to include the JWT token
    const headers = { Authorization: `Bearer ${token}` };
    this.dohvatiKategorije(headers);
  },

  computed: {
    stupci() {
      return [
        { name: "Naziv", required: true, label: this.$t('categoriesPage.name'), align: "left", field: "naziv_kategorije", sortable: true },
        { name: "gumbovi", label: this.$t('categoriesPage.actions'), align: "center" }
      ];
    }
  },

  methods: {
    async dohvatiKategorije(headers) {
      try {
        // Make the request with axios and include the headers
        const response = await axios.get("http://localhost:3000/api/all-kategorija", { headers });
        this.kategorije = response.data;
      } catch (error) {
        console.error("Greška pri dohvatu kategorija", error);
      }
    },

    odiNaDetalje(idKategorije) {
      this.$router.push({ name: "kategorijadetalji", params: { id: idKategorije } });
    },

    dodajKategoriju(){
      this.$router.push({path: "dodajkategoriju"});
    },

    async deleteKategorija(idKategorije){
      try{
        const token = localStorage.getItem("token");

    // Set up the request headers to include the JWT token
    const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.delete("http://localhost:3000/api/deleteKategoriju/" + idKategorije, {headers})

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.$t('categoriesPage.deleteSuccess'),
        });
        
        this.dohvatiKategorije({headers});
        
       } catch (error){
        console.error("Greška pri brisanju kategorije.");

        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('categoriesPage.deleteError'),
          icon: "warning",
        });
      }
    }

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
