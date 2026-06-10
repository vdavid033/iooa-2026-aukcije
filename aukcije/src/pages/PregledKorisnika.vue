<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h2 class="text-h5">Upravljanje korisnicima</h2>
        <p class="text-subtitle2 text-grey-7">Pregledajte, pretražujte i filtrirajte korisnike.</p>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md items-end">
      <div class="col-12 col-md-5">
        <q-input
          filled
          debounce="300"
          v-model="search"
          label="Pretraži korisnike"
          placeholder="Ime, prezime ili E-mail"
          clearable
          dense
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          filled
          v-model="selectedRole"
          :options="roleOptions"
          emit-value
          map-options
          label="Filtriraj po ulozi"
          clearable
          dense
        />
      </div>
      <div class="col-12 col-md-3">
        <q-banner dense class="bg-white text-primary q-pa-sm">
          Prikazano: <strong>{{ filteredUsers.length }}</strong> korisnika
        </q-banner>
      </div>
    </div>

    <q-table
      flat
      bordered
      :title="$t('usersPage.title')"
      :rows-per-page-label="$t('usersPage.rowsPerPage')"
      :rows="filteredUsers"
      :columns="columns"
      row-key="id_korisnika"
      :loading="loading"
      no-data-label="Nema korisnika za prikaz."
      class="user-table"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense color="primary" :label="$t('usersPage.edit')" size="sm" class="q-mr-xs" @click="editUser(props.row.id_korisnika)" />
          <q-btn dense color="negative" :label="$t('usersPage.delete')" size="sm" @click="deleteUser(props.row.id_korisnika)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const users = ref([]);
const loading = ref(false);
const search = ref('');
const selectedRole = ref('all');

const roleOptions = [
  { label: 'Sve uloge', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const columns = computed(() => [
  {
    name: 'id_korisnika',
    label: 'ID',
    field: 'id_korisnika',
    align: 'left',
    sortable: true,
    style: 'width: 80px; min-width: 80px;',
  },
  {
    name: 'ime_korisnika',
    label: t('usersPage.name'),
    field: 'ime_korisnika',
    align: 'left',
    sortable: true,
    style: 'width: 140px; min-width: 120px;',
  },
  {
    name: 'prezime_korisnika',
    label: t('usersPage.surname'),
    field: 'prezime_korisnika',
    align: 'left',
    sortable: true,
    style: 'width: 140px; min-width: 120px;',
  },
  {
    name: 'email_korisnika',
    label: t('usersPage.email'),
    field: 'email_korisnika',
    align: 'left',
    sortable: true,
    style: 'width: 220px; min-width: 180px;',
  },
  {
    name: 'adresa_korisnika',
    label: t('usersPage.address'),
    field: 'adresa_korisnika',
    align: 'left',
    sortable: true,
    style: 'width: 220px; min-width: 180px;',
  },
  {
    name: 'actions',
    label: t('usersPage.actions'),
    field: 'actions',
    align: 'center',
    style: 'width: 180px; min-width: 150px;',
  },
]);

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/korisnici', {
      headers: getHeaders(),
    });
    const responseData = response.data;
    const parsedUsers = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.korisnici)
      ? responseData.korisnici
      : [];

    console.log('Korisnici API response:', responseData);
    console.log('Parsed users:', parsedUsers);

    users.value = parsedUsers;
  } catch (error) {
    console.error('Greška pri dohvaćanju korisnika:', error);
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Greška pri dohvaćanju korisnika!',
      icon: 'warning',
    });
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase();
  return users.value.filter((user) => {
    const matchesSearch = !term ||
      user.ime_korisnika?.toLowerCase().includes(term) ||
      user.prezime_korisnika?.toLowerCase().includes(term) ||
      user.email_korisnika?.toLowerCase().includes(term);
    const matchesRole = selectedRole.value === 'all' || !selectedRole.value ||
      user.uloga?.toLowerCase() === selectedRole.value;
    return matchesSearch && matchesRole;
  });
});

const editUser = (id) => {
  router.push({ name: 'korisnikdetalji', params: { id } });
};

const deleteUser = (id) => {
  $q.dialog({
    title: 'Brisanje korisnika',
    message: t('usersPage.confirmDelete'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.put(`http://localhost:3000/api/brisanjekorisnika/${id}`, null, {
        headers: getHeaders(),
      });
      $q.notify({
        color: 'positive',
        position: 'top',
        message: 'Korisnik uspješno obrisan.',
      });
      loadUsers();
    } catch (error) {
      console.error('Greška pri brisanju korisnika:', error);
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Greška pri brisanju korisnika!',
        icon: 'warning',
      });
    }
  });
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-table :deep(.q-table td) {
  white-space: normal;
  word-break: break-word;
  vertical-align: top;
}
</style>
