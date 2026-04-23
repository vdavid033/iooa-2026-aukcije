<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <router-link to="/" class="link-style">
            <q-avatar>
              <img src="~assets/aukcije_logo.jpg" alt="Logo" />
            </q-avatar>
          </router-link>
          {{ t('adminLayout.title') }}
        </q-toolbar-title>

        <q-space /><q-space /><q-space /><q-space /><q-space /><q-space /><q-space /><q-space />

        <template v-if="isAuthenticated()">
          <q-btn
            :label="t('adminLayout.logout')"
            color="negative"
            class="q-mr-md"
            @click="confirmLogout"
          />
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header class="text-bold text-black">
          {{ t('adminLayout.menu') }}
        </q-item-label>

        <div class="q-pa-sm col">
          <router-link to="kategorije" class="link-style" @click="toggleLeftDrawerClose">
            <q-btn class="flex flex-center" color="positive" style="width: 280px">
              {{ t('adminLayout.categories') }}
            </q-btn>
          </router-link>
        </div>

        <div class="q-pa-sm col">
          <router-link to="pregledkorisnika" class="link-style" @click="toggleLeftDrawerClose">
            <q-btn class="flex flex-center" color="positive" style="width: 280px">
              {{ t('adminLayout.users') }}
            </q-btn>
          </router-link>
        </div>

        <div class="q-pa-sm col">
          <router-link to="/" class="link-style" @click="toggleLeftDrawerClose">
            <q-btn class="flex flex-center" color="negative" style="width: 280px">
              {{ t('adminLayout.exit') }}
            </q-btn>
          </router-link>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Logout Dialog -->
    <q-dialog v-model="confirmLogoutDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            {{ t('adminLayout.logoutConfirm') }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" color="primary" v-close-popup />
          <router-link to="/" class="link-style" @click="toggleLeftDrawerClose">
            <q-btn
              flat
              :label="t('adminLayout.logout')"
              color="negative"
              @click="logoutAndReload"
            />
          </router-link>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script>
import Pocetna from "src/pages/Pocetna.vue";
import router from "src/router";
import { ref } from "vue";
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const confirmLogoutDialog = ref(false);
    const leftDrawerOpen = ref(false);
    const token = ref(localStorage.getItem("token"));
    const { t } = useI18n();

    const isAuthenticated = () => {
      const token = localStorage.getItem("token");
      return !!token;
    };

    const confirmLogout = () => {
      confirmLogoutDialog.value = true;
    };

    const toggleLeftDrawerClose = () => {
      leftDrawerOpen.value = false;
    };

    const logoutAndReload = () => {
      // Clear JWT token from local storage
      localStorage.removeItem("token");
    };
    return {
      toggleLeftDrawerClose,
      confirmLogoutDialog,
      isAuthenticated,
      confirmLogout,
      leftDrawerOpen,
      logoutAndReload,
      t,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
};
</script>
