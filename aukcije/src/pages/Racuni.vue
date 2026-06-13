<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h3 text-bold text-center text-blue-7">Računi</div>
        <div class="text-subtitle1 text-center text-grey-7 q-mt-sm">
          Pregled završenih kupnji i evidentiranih transakcija
        </div>
      </q-card-section>

      <q-separator color="red" />

      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.search"
              outlined
              dense
              clearable
              label="Pretraži predmet"
              @keyup.enter="dohvatiRacune"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="filters.dateFrom" outlined dense type="date" label="Od datuma" stack-label />
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="filters.dateTo" outlined dense type="date" label="Do datuma" stack-label />
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="filters.minAmount" outlined dense type="number" min="0" label="Min. iznos" />
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="filters.maxAmount" outlined dense type="number" min="0" label="Max. iznos" />
          </div>
        </div>

        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="sortBy" outlined dense emit-value map-options :options="sortOptions" label="Sortiraj po" />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select v-model="sortDir" outlined dense emit-value map-options :options="sortDirectionOptions" label="Smjer" />
          </div>

          <div class="col-12 col-md-auto q-gutter-sm">
            <q-btn color="primary" label="Primijeni" icon="filter_alt" :loading="loading" @click="dohvatiRacune" />
            <q-btn flat color="grey-7" label="Poništi" icon="restart_alt" @click="ponistiFiltere" />
          </div>
        </div>
      </q-card-section>

      <q-banner v-if="errorMessage" class="bg-red-1 text-red-9 q-ma-md rounded-borders">
        {{ errorMessage }}
      </q-banner>

      <q-inner-loading :showing="loading" />

      <q-card-section v-if="!loading && racuni.length === 0" class="text-center text-grey-7 q-py-xl">
        <q-icon name="receipt_long" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">Nemate evidentiranih računa ili transakcija.</div>
        <div class="text-body2 q-mt-xs">Kada osvojite aukciju i transakcija bude evidentirana, prikazat će se ovdje.</div>
      </q-card-section>

      <q-card-section v-if="racuni.length > 0">
        <q-markup-table flat bordered separator="horizontal">
          <thead>
            <tr>
              <th class="text-left">Predmet</th>
              <th class="text-left">Datum transakcije</th>
              <th class="text-right">Iznos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="racun in racuni" :key="racun.id_transakcije">
              <td class="text-weight-medium text-blue-8">{{ racun.naziv_predmeta }}</td>
              <td>{{ formatirajDatum(racun.vrijeme_transakcije) }}</td>
              <td class="text-right text-weight-bold">{{ formatirajIznos(racun.iznos_transakcije) }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  name: "RacuniPage",

  data() {
    return {
      racuni: [],
      loading: false,
      errorMessage: "",
      sortBy: "datum",
      sortDir: "desc",
      filters: {
        search: "",
        dateFrom: "",
        dateTo: "",
        minAmount: "",
        maxAmount: "",
      },
      sortOptions: [
        { label: "Datum", value: "datum" },
        { label: "Iznos", value: "iznos" },
      ],
      sortDirectionOptions: [
        { label: "Silazno", value: "desc" },
        { label: "Uzlazno", value: "asc" },
      ],
    };
  },

  mounted() {
    this.dohvatiRacune();
  },

  methods: {
    dohvatiRacune() {
      const token = localStorage.getItem("token");

      if (!token) {
        this.$router.push("/prijava");
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      axios
        .get("http://localhost:3000/api/racuni", {
          headers: { Authorization: `Bearer ${token}` },
          params: this.buildParams(),
        })
        .then((response) => {
          this.racuni = response.data;
        })
        .catch(() => {
          this.errorMessage = "Računi trenutno nisu dostupni. Pokušajte ponovno kasnije.";
        })
        .finally(() => {
          this.loading = false;
        });
    },

    buildParams() {
      const params = {
        sortBy: this.sortBy,
        sortDir: this.sortDir,
      };

      Object.entries(this.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== "") {
          params[key] = value;
        }
      });

      return params;
    },

    ponistiFiltere() {
      this.filters = {
        search: "",
        dateFrom: "",
        dateTo: "",
        minAmount: "",
        maxAmount: "",
      };
      this.sortBy = "datum";
      this.sortDir = "desc";
      this.dohvatiRacune();
    },

    formatirajDatum(dateString) {
      if (!dateString) {
        return "-";
      }

      return new Date(String(dateString).replace(" ", "T")).toLocaleString("hr-HR").replace(",", "");
    },

    formatirajIznos(value) {
      const amount = Number(value);

      if (!Number.isFinite(amount)) {
        return `${value} $`;
      }

      return `${new Intl.NumberFormat("hr-HR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)} $`;
    },
  },
};
</script>
