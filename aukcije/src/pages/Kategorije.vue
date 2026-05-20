<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h2 class="text-h5">Upravljanje kategorijama</h2>
        <p class="text-subtitle2 text-grey-7">Pregledajte sve kategorije, dodajte nove ili uredite postojeće.</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon-right="add" label="Dodaj kategoriju" @click="openAddDialog" />
      </div>
    </div>

    <div class="row q-mb-md items-center">
      <div class="col-12 col-md-5">
        <q-input
          filled
          v-model="search"
          label="Pretraži kategorije"
          clearable
          dense
        />
      </div>
    </div>

    <q-banner class="q-mb-md" dense>
      Pronađeno kategorija: {{ categories.length }}
    </q-banner>

    <q-table
      flat
      bordered
      title="Kategorije"
      :rows="filteredCategories"
      :columns="columns"
      row-key="id_kategorije"
      :loading="loading"
      :rows-per-page-options="[5, 10, 15]"
      rows-per-page-label="Broj redova po stranici:"
      no-data-label="Nema kategorija za prikaz."
    >
      <template v-slot:body-cell-actions="props">
        <q-btn-group spread>
          <q-btn dense color="primary" icon="edit" size="sm" @click="openEditDialog(props.row)" />
          <q-btn dense color="negative" icon="delete" size="sm" @click="confirmDeleteCategory(props.row.id_kategorije)" />
        </q-btn-group>
      </template>
    </q-table>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px; max-width: 500px;">
        <q-card-section>
          <div class="text-h6 q-mb-sm">{{ dialogTitle }}</div>
          <q-form @submit.prevent="saveCategory">
            <q-input
              filled
              v-model="categoryForm.naziv_kategorije"
              label="Naziv kategorije"
              :rules="nameRules"
              autofocus
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="secondary" v-close-popup @click="closeDialog" />
          <q-btn unelevated label="Spremi" color="primary" @click="saveCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const categories = ref([]);
const loading = ref(false);
const search = ref('');
const showDialog = ref(false);
const dialogMode = ref('add');
const categoryForm = ref({ id: null, naziv_kategorije: '' });

const columns = [
  { name: 'naziv_kategorije', label: 'Naziv', field: 'naziv_kategorije', align: 'left', sortable: true },
  { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
];

const nameRules = [(value) => !!value || 'Naziv kategorije je obavezan.'];

const filteredCategories = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) {
    return categories.value;
  }
  return categories.value.filter((item) => item.naziv_kategorije.toLowerCase().includes(term));
});

const dialogTitle = computed(() => (dialogMode.value === 'edit' ? 'Uredi kategoriju' : 'Dodaj kategoriju'));

const baseUrl = 'http://localhost:3000';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    $q.notify({ color: 'negative', position: 'top', message: 'Nije pronađen token, prijavite se ponovno.', icon: 'warning' });
    window.location.href = '/prijava';
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

const loadCategories = async () => {
  loading.value = true;
  const url = `${baseUrl}/all-kategorija`;
  console.log('Kategorije: dohvaćam sa URL-a:', url);
  try {
    const response = await axios.get(url);
    console.log('Kategorije response:', response.data);
    if (!response.data) {
      console.warn('Kategorije: response.data je null ili undefined', response);
    }
    if (!Array.isArray(response.data)) {
      console.error('Kategorije: očekivao sam niz, dobio sam:', response.data);
      categories.value = [];
      $q.notify({ color: 'negative', position: 'top', message: 'Greška: neispravan odgovor kategorija.', icon: 'warning' });
    } else {
      categories.value = response.data;
      if (response.data.length === 0) {
        $q.notify({ color: 'warning', position: 'top', message: 'Nema pronađenih kategorija.', icon: 'warning' });
      }
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju kategorija:', error);
    const message = error?.response?.data?.error || error?.message || 'Greška pri dohvaćanju kategorija.';
    $q.notify({ color: 'negative', position: 'top', message, icon: 'warning' });
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  dialogMode.value = 'add';
  categoryForm.value = { id: null, naziv_kategorije: '' };
  showDialog.value = true;
};

const openEditDialog = (category) => {
  dialogMode.value = 'edit';
  categoryForm.value = { id: category.id_kategorije, naziv_kategorije: category.naziv_kategorije };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const saveCategory = async () => {
  const naziv = categoryForm.value.naziv_kategorije?.trim();
  if (!naziv) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'Naziv kategorije je obavezan.',
      icon: 'warning',
    });
    return;
  }

  try {
    if (dialogMode.value === 'edit') {
      await axios.put(`http://localhost:3000/api/kategorije/${categoryForm.value.id}`,
        { naziv_kategorije: naziv },
        { headers: getHeaders() }
      );
      $q.notify({ color: 'positive', position: 'top', message: 'Kategorija uspješno ažurirana.' });
    } else {
      await axios.post('http://localhost:3000/api/kategorije',
        { naziv_kategorije: naziv },
        { headers: getHeaders() }
      );
      $q.notify({ color: 'positive', position: 'top', message: 'Kategorija uspješno dodana.' });
    }
    showDialog.value = false;
    loadCategories();
  } catch (error) {
    console.error('Greška pri spremanju kategorije:', error);
    const message = error?.response?.data?.message || 'Greška pri spremanju kategorije.';
    $q.notify({ color: 'negative', position: 'top', message, icon: 'warning' });
  }
};

const confirmDeleteCategory = (id) => {
  $q.dialog({
    title: 'Brisanje kategorije',
    message: 'Jeste li sigurni da želite obrisati ovu kategoriju?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`http://localhost:3000/api/deleteKategoriju/${id}`, {
        headers: getHeaders(),
      });
      $q.notify({ color: 'positive', position: 'top', message: 'Kategorija uspješno obrisana.' });
      loadCategories();
    } catch (error) {
      console.error('Greska pri brisanju kategorije:', error);
      const message = error?.response?.data?.message || 'Greška pri brisanju kategorije!';
      $q.notify({ color: 'negative', position: 'top', message, icon: 'warning' });
    }
  });
};

onMounted(() => {
  console.log('Kategorije komponenta mounted');
  loadCategories();
});
</script>

<style scoped>
.q-page {
  min-height: 100%;
}
</style>
