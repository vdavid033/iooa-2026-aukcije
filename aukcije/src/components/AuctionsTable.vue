<template>
  <div class="auctions-table">
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col-12 col-md-5">
        <q-input
          filled
          debounce="300"
          v-model="searchInput"
          label="Pretraži aukciju ili prodavača"
          clearable
          dense
          @clear="onSearchClear"
        />
      </div>

      <div class="col-12 col-md-4">
        <q-btn-group spread class="full-width" rounded>
          <q-btn
            flat
            :color="statusFilter === 'all' ? 'primary' : 'grey-4'"
            label="Sve"
            @click="setStatus('all')"
          />
          <q-btn
            flat
            :color="statusFilter === 'active' ? 'primary' : 'grey-4'"
            label="Aktivne"
            @click="setStatus('active')"
          />
          <q-btn
            flat
            :color="statusFilter === 'ended' ? 'primary' : 'grey-4'"
            label="Završene"
            @click="setStatus('ended')"
          />
        </q-btn-group>
      </div>

      <div class="col-12 col-md-3 text-right">
        <q-btn
          unelevated
          color="secondary"
          icon="article"
          label="Izvještaj"
          class="full-width"
          @click="downloadReport"
        />
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-sm">
          <q-card-section>
            <div class="row items-center q-col-gutter-sm">
              <div class="col-auto text-weight-bold">Datum završetka:</div>
              <div class="col">
                <q-date
                  v-model="dateRange"
                  range
                  mask="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  locale="hr"
                  minimal
                  class="shadow-1"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-table
      flat
      bordered
      title="Aukcije"
      :columns="columns"
      :rows="rows"
      row-key="id_predmeta"
      :loading="loading"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 25]"
      :rows-per-page-label="'Redova po stranici:'"
      :no-data-label="'Nema podataka za prikaz.'"
      :pagination-label="paginationLabel"
      class="shadow-1"
    >
      <template v-slot:body-cell-status_aukcije="props">
        <q-badge
          :label="statusLabel(props.value)"
          :color="props.value === 'aktivna' ? 'positive' : 'grey-7'"
          align="center"
        />
      </template>

      <template v-slot:body-cell-trenutna_cijena="props">
        {{ formatCurrency(props.value) }}
      </template>

      <template v-slot:body-cell-vrijeme_zavrsetka="props">
        {{ formatDate(props.value) }}
      </template>

      <template v-slot:body-cell-actions="props">
        <q-btn
          dense
          color="primary"
          label="Detalji"
          size="sm"
          @click="showDetails(props.row)"
        />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const rows = ref([]);
const loading = ref(false);
const searchInput = ref('');
const statusFilter = ref('all');
const dateRange = ref([null, null]);
const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'vrijeme_zavrsetka',
  descending: true,
});

let searchTimer = null;

const columns = [
  { name: 'naziv_predmeta', label: 'AUKCIJA', field: 'naziv_predmeta', sortable: true, align: 'left' },
  { name: 'prodavac', label: 'PRODAVAČ', field: 'prodavac', sortable: true, align: 'left' },
  { name: 'trenutna_cijena', label: 'CIJENA', field: 'trenutna_cijena', sortable: true, align: 'right' },
  { name: 'broj_ponuda', label: 'PONUDE', field: 'broj_ponuda', sortable: true, align: 'center' },
  { name: 'pregledi', label: 'PREGLEDI', field: 'pregledi', align: 'center' },
  { name: 'status_aukcije', label: 'STATUS', field: 'status_aukcije', sortable: true, align: 'center' },
  { name: 'vrijeme_zavrsetka', label: 'ZAVRŠAVA', field: 'vrijeme_zavrsetka', sortable: true, align: 'center' },
  { name: 'actions', label: 'AKCIJE', field: 'actions', align: 'center' },
];

const paginationLabel = computed(() => {
  return `${pagination.rowsNumber} ukupno`; 
});

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const buildParams = () => {
  const params = {
    page: pagination.page,
    limit: pagination.rowsPerPage,
  };

  if (searchInput.value.trim()) {
    params.search = searchInput.value.trim();
  }

  if (statusFilter.value !== 'all') {
    params.status = statusFilter.value;
  }

  if (dateRange.value && dateRange.value[0]) {
    params.date_from = dateRange.value[0];
  }
  if (dateRange.value && dateRange.value[1]) {
    params.date_to = dateRange.value[1];
  }

  if (pagination.sortBy) {
    params.sort_by = pagination.sortBy === 'trenutna_cijena' ? 'cijena' : pagination.sortBy;
    params.sort_order = pagination.descending ? 'DESC' : 'ASC';
  }

  return params;
};

const fetchAuctions = async () => {
  loading.value = true;
  console.log('Fetching auctions...');

  try {
    const response = await axios.get('http://localhost:3000/api/admin/auctions', {
      headers: getHeaders(),
      params: buildParams(),
    });

    console.log('Auctions response:', response.data);
    rows.value = response.data.rows.map((row) => ({
      ...row,
      pregledi: 0,
    }));
    pagination.rowsNumber = response.data.total || 0;
  } catch (error) {
    console.error('Greška pri dohvaćanju aukcija:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Greška pri dohvaćanju aukcija.',
      icon: 'warning',
    });
  } finally {
    loading.value = false;
  }
};

const resetPageAndFetch = () => {
  if (pagination.page !== 1) {
    pagination.page = 1;
  } else {
    fetchAuctions();
  }
};

const setStatus = (status) => {
  statusFilter.value = status;
  resetPageAndFetch();
};

const onSearchClear = () => {
  searchInput.value = '';
  resetPageAndFetch();
};

const serializeCsvValue = (value) => {
  const str = value == null ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const createCsvContent = (headerCells, rowsData) => {
  const lines = [headerCells.map(serializeCsvValue).join(',')];
  rowsData.forEach((row) => {
    lines.push(row.map(serializeCsvValue).join(','));
  });
  return lines.join('\r\n');
};

const downloadReport = () => {
  const headers = ['AUKCIJA', 'PRODAVAČ', 'CIJENA', 'PONUDE', 'PREGLEDI', 'STATUS', 'ZAVRŠAVA'];
  const csvRows = rows.value.map((row) => [
    row.naziv_predmeta,
    row.prodavac,
    formatCurrency(row.trenutna_cijena),
    row.broj_ponuda,
    row.pregledi,
    statusLabel(row.status_aukcije),
    formatDate(row.vrijeme_zavrsetka),
  ]);

  const csvContent = '\uFEFF' + createCsvContent(headers, csvRows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `aukcije-izvjestaj-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const showDetails = (row) => {
  console.log('Aukcija detalji:', row);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'HRK' }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

watch(
  () => pagination.page,
  () => {
    fetchAuctions();
  }
);

watch(
  () => pagination.rowsPerPage,
  () => {
    pagination.page = 1;
    fetchAuctions();
  }
);

watch(
  () => pagination.sortBy,
  () => {
    fetchAuctions();
  }
);

watch(
  () => pagination.descending,
  () => {
    fetchAuctions();
  }
);

watch(
  searchInput,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      resetPageAndFetch();
    }, 500);
  }
);

watch(
  dateRange,
  () => {
    resetPageAndFetch();
  },
  { deep: true }
);

onMounted(() => {
  fetchAuctions();
});
</script>

<style scoped>
.auctions-table {
  width: 100%;
}

.auctions-table .q-date {
  max-width: 100%;
}

.auctions-table .q-btn-group {
  min-height: 40px;
}
</style>
