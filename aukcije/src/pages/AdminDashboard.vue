<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h2 class="text-h4 q-ma-none">Admin Dashboard</h2>
        <p class="text-subtitle2 text-grey-7 q-mt-sm">Pregled ključnih statistika i upravljanje aukcijama i transakcijama.</p>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold">Ukupno aukcija</div>
                <div class="text-subtitle2 text-grey-7">Aktivnih: {{ stats.activeAuctions }}</div>
              </div>
              <q-icon name="inventory_2" size="32px" color="primary" />
            </div>
            <div class="text-h4 text-weight-bold q-mt-md">{{ stats.totalAuctions }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold">Ukupan prihod</div>
                <div class="text-subtitle2 text-grey-7">Ovaj mjesec: {{ formatCurrency(stats.monthlyRevenue) }}</div>
              </div>
              <q-icon name="attach_money" size="32px" color="positive" />
            </div>
            <div class="text-h4 text-weight-bold q-mt-md">{{ formatCurrency(stats.totalRevenue) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold">Transakcije</div>
                <div class="text-subtitle2 text-grey-7">Posljednjih 30 dana: {{ stats.transactionsLast30Days }}</div>
              </div>
              <q-icon name="receipt_long" size="32px" color="orange" />
            </div>
            <div class="text-h4 text-weight-bold q-mt-md">{{ stats.totalTransactions }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold">Uspješne transakcije</div>
                <div class="text-subtitle2 text-grey-7">Postotak uspjeha</div>
              </div>
              <q-icon name="thumb_up" size="32px" color="teal" />
            </div>
            <div class="text-h4 text-weight-bold q-mt-md">{{ stats.successfulTransactionRate }}%</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-tabs v-model="activeTab" class="text-primary" active-color="primary" indicator-color="primary">
          <q-tab name="overview" label="Pregled" />
          <q-tab name="auctions" label="Aukcije" />
          <q-tab name="transactions" label="Transakcije" />
        </q-tabs>
      </q-card-section>

      <q-separator spaced />

      <q-card-section>
        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="overview">
            <div class="text-body1 text-grey-7">Dobrodošli u admin panel. Odaberite karticu Aukcije ili Transakcije za pregled podataka.</div>
          </q-tab-panel>
          <q-tab-panel name="auctions">
            <AuctionsTable />
          </q-tab-panel>
          <q-tab-panel name="transactions">
            <TransactionsTable />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import AuctionsTable from '../components/AuctionsTable.vue';
import TransactionsTable from '../components/TransactionsTable.vue';

const $q = useQuasar();
const activeTab = ref('overview');

const stats = reactive({
  totalAuctions: 0,
  activeAuctions: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  transactionsLast30Days: 0,
  successfulTransactionRate: 0,
  totalTransactions: 0,
});

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const fetchStats = async () => {
  console.log('Fetching stats...');
  try {
    const response = await axios.get('http://localhost:3000/api/admin/stats', {
      headers: getHeaders(),
    });
    console.log('Stats response:', response.data);
    Object.assign(stats, response.data);
  } catch (error) {
    console.error('Greška pri dohvaćanju statistika:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Greška pri dohvaćanju statistika.',
      icon: 'warning',
    });
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'HRK' }).format(value);
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 10px;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}
</style>
