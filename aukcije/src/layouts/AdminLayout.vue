<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title class="text-h6 text-weight-bold">
          Admin Panel
        </q-toolbar-title>
        <q-space />
        <q-btn
          label="Odjava"
          color="negative"
          flat
          @click="showLogoutConfirm = true"
          class="q-mr-md"
        />
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      side="left"
      bordered
      :width="250"
      class="bg-grey-1"
    >
      <q-list class="q-mt-md">
        <q-item-label header class="text-h6 text-weight-bold text-primary">
          Navigacija
        </q-item-label>

        <!-- Dashboard -->
        <q-item
          :to="{ name: 'admin-dashboard' }"
          exact
          clickable
          v-ripple
          :active="$route.name === 'admin-dashboard'"
          active-class="bg-blue-1 text-primary"
          class="q-mb-sm"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Kategorije -->
        <q-item
          :to="{ name: 'admin-kategorije' }"
          exact
          clickable
          v-ripple
          :active="$route.name === 'admin-kategorije'"
          active-class="bg-blue-1 text-primary"
          class="q-mb-sm"
        >
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Kategorije</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Korisnici -->
        <q-item
          :to="{ name: 'admin-korisnici' }"
          exact
          clickable
          v-ripple
          :active="$route.name === 'admin-korisnici'"
          active-class="bg-blue-1 text-primary"
          class="q-mb-sm"
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Korisnici</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Logout Confirmation Dialog -->
    <q-dialog v-model="showLogoutConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-md text-body1">Jeste li sigurni da želite se odjaviti?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Odjavi se" color="negative" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const drawerOpen = ref(false);
const showLogoutConfirm = ref(false);

const logout = () => {
  localStorage.removeItem('token');
  showLogoutConfirm.value = false;
  router.push('/prijava');
};
</script>

<style scoped>
:deep(.q-drawer__content) {
  background-color: #f5f5f5;
}
</style>
