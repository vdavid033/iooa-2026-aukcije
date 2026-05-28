<template>
  <div class="transactions-table">
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col-12 col-md-5">
        <q-input
          filled
          debounce="300"
          v-model="searchInput"
          label="Pretraži aukciju ili kupca"
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
            v-for="item in statusButtons"
            :key="item.value"
            flat
            :color="statusFilter === item.value ? 'primary' : 'grey-4'"
            :label="item.label"
            @click="setStatus(item.value)"
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

    <q-table
      flat
      bordered
      title="Transakcije"
      :columns="columns"
      :rows="rows"
      row-key="id_transakcije"
      :loading="loading"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 25]"
      rows-per-page-label="Redova po stranici:"
      no-data-label="Nema transakcija za prikaz."
      class="shadow-1"
    >
      <template v-slot:body-cell-iznos_transakcije="props">
        <q-td :props="props">
          {{ formatCurrency(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-vrijeme_transakcije="props">
        <q-td :props="props">
          {{ formatDate(props.value) }}
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :label="formatStatus(props.value)"
            :color="props.value === 'Završena' ? 'grey-7' : 'positive'"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            dense
            color="primary"
            label="Detalji"
            size="sm"
            @click="showDetails(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const rows = ref([]);
const loading = ref(false);
const searchInput = ref('');
const statusFilter = ref('all');
const statusList = ref([]);
const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns = [
  { name: 'id_transakcije', label: 'ID TRANSAKCIJE', field: 'id_transakcije', align: 'left', sortable: false },
  { name: 'naziv_predmeta', label: 'AUKCIJA', field: 'naziv_predmeta', align: 'left', sortable: false },
  { name: 'kupac', label: 'KUPAC', field: 'kupac', align: 'left', sortable: false },
  { name: 'prodavac', label: 'PRODAJAČ', field: 'prodavac', align: 'left', sortable: false },
  { name: 'iznos_transakcije', label: 'IZNOS', field: 'iznos_transakcije', align: 'right', sortable: false },
  { name: 'vrijeme_transakcije', label: 'DATUM', field: 'vrijeme_transakcije', align: 'center', sortable: false },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center', sortable: false },
  { name: 'actions', label: 'AKCIJE', field: 'actions', align: 'center', sortable: false },
];

const statusButtons = computed(() => {
  const buttons = [{ label: 'Završene', value: 'završena' }];
  statusList.value.forEach((status) => {
    if (status !== 'završena' && status !== 'all') {
      buttons.push({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      });
    }
  });
  return buttons;
});

const paginationLabel = computed(() => `${pagination.rowsNumber} ukupno`);

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

  return params;
};

const fetchTransactions = async () => {
  loading.value = true;
  console.log('Fetching transactions...');

  try {
    const response = await axios.get('http://localhost:3000/api/admin/transactions', {
      headers: getHeaders(),
      params: buildParams(),
    });

    console.log('Transactions response:', response.data);
    rows.value = response.data.rows || [];
    pagination.rowsNumber = response.data.total || 0;
    statusList.value = Array.from(
      new Set(rows.value.map((item) => item.status).filter(Boolean))
    );
  } catch (error) {
    const msg = error?.response?.data?.error || error?.message || 'Greška pri dohvaćanju transakcija.';
    console.error('Greška pri dohvaćanju transakcija:', msg, error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: msg,
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
    fetchTransactions();
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
  const headers = ['ID TRANSAKCIJE', 'AUKCIJA', 'KUPAC', 'PRODAJAČ', 'IZNOS', 'DATUM', 'STATUS'];
  const csvRows = rows.value.map((row) => [
    row.id_transakcije,
    row.naziv_predmeta,
    row.kupac,
    row.prodavac,
    formatCurrency(row.iznos_transakcije),
    formatDate(row.vrijeme_transakcije),
    formatStatus(row.status),
  ]);

  const csvContent = '\uFEFF' + createCsvContent(headers, csvRows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transakcije-izvjestaj-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const showDetails = (row) => {
  console.log('Transakcija detalji:', row);
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

const formatStatus = (value) => {
  if (!value) return '-';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

watch(
  () => pagination.page,
  () => fetchTransactions()
);

watch(
  () => pagination.rowsPerPage,
  () => {
    pagination.page = 1;
    fetchTransactions();
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

let searchTimer = null;

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.transactions-table {
  width: 100%;
}

.transactions-table .q-btn-group {
  min-height: 40px;
}

.transactions-table :deep(.q-table td) {
  white-space: normal;
  word-break: break-word;
  vertical-align: top;
}
</style>