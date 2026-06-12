<template>
  <q-page style="margin-left: 2%; margin-right: 2%" window-height window-width>
    <div class="row">
      <h5 class="text-h3 text-blue q-my-md">{{ $t('addCategoryPage.title') }}</h5>
    </div>
    <q-form @submit="dodajKategoriju()">
      <q-input v-model="naziv_kategorije" :label="$t('addCategoryPage.name')" outlined dense type="text" />
      <q-btn type="submit" :label="$t('addCategoryPage.add')" color="primary" class="q-mt-md" />
    </q-form>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      naziv_kategorije: "",
    };
  },

  mounted() {
    // Get the JWT token from local storage
    const token = localStorage.getItem("token");

    // Set up the request headers to include the JWT token
    const headers = { Authorization: `Bearer ${token}` };
  },

  methods: {
    previosPage() {
      setTimeout(() => {
        window.history.back();
      }, 500);
    },

    async dodajKategoriju() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.post("http://localhost:3000/api/dodajKategoriju", { naziv_kategorije: this.naziv_kategorije }, { headers });

        console.log(response.data);

        this.$q.notify({
          color: "positive",
          position: "top",
          message: this.$t('addCategoryPage.success'),
        });
        
        this.previosPage();

      } catch (error) {
        console.log(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('addCategoryPage.error'),
          icon: "warning",
        });
      }
    },

    provjera() {
      if (!this.naziv_kategorije) {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: this.$t('addCategoryPage.required'),
          icon: "warning",
        });
      } else {
        this.dodajKategoriju();
      }
      return;
    },
  },
};
</script>
