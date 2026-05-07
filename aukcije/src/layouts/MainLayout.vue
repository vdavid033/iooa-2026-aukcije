<template>
  <q-layout view="lHh Lpr lFf">

    <!-- HEADER -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>

        <!-- LOGO -->
        <router-link to="/" class="link-style row items-center">
          <q-avatar size="50px">
            <img src="~assets/aukcije_logo.jpg" alt="Logo" />
          </q-avatar>
        </router-link>

        <!-- NASLOV -->
        <div class="q-ml-md text-weight-bold text-h6">
          Aukcijska Platforma
        </div>

        <q-space />

        <!-- DESNA STRANA -->
        <div class="row items-center q-gutter-sm">

          <!-- GUEST -->
          <template v-if="!isAuthenticated()">
            <q-btn flat label="Registracija" to="/registracija" />
            <q-btn color="primary" unelevated label="Prijava" to="/prijava" />
          </template>

          <!-- DROPDOWN -->
          <q-btn-dropdown
            flat
            color="primary"
            icon="menu"
            no-caret
            class="q-ml-sm"
          >
            <q-list style="min-width: 200px">

              <router-link to="/" class="link-style">
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Početna</q-item-label>
                  </q-item-section>
                </q-item>
              </router-link>

              <router-link to="/postavi" class="link-style">
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Dodaj aukciju</q-item-label>
                  </q-item-section>
                </q-item>
              </router-link>

              <router-link to="/Moj_profil" class="link-style">
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Moj profil</q-item-label>
                  </q-item-section>
                </q-item>
              </router-link>

              <!-- LOGGED USER -->
              <template v-if="isAuthenticated()">
                <q-separator />

                <q-item clickable v-close-popup @click="confirmLogout">
                  <q-item-section>
                    <q-item-label class="text-negative">
                      Odjava
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <!-- ADMIN -->
              <template v-if="isAdmin()">
                <q-separator />
                <router-link to="/admin/" class="link-style">
                  <q-item clickable v-close-popup>
                    <q-item-section>
                      <q-item-label class="text-primary">
                        Admin Dashboard
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </router-link>
              </template>

            </q-list>
          </q-btn-dropdown>

        </div>
      </q-toolbar>
    </q-header>

    <!-- PAGE -->
    <q-page-container>
      <router-view />

      <div class="app-footer bg-white text-grey-8 text-center q-pa-md shadow-2">
        © 2026 Aukcijska Platforma
      </div>
    </q-page-container>

    <!-- LOGOUT DIALOG -->
    <q-dialog v-model="confirmLogoutDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            Jeste li sigurni da želite se odjaviti?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Odjavi se" color="negative" @click="logoutAndReload" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const confirmLogoutDialog = ref(false);
    const token = ref(localStorage.getItem("token"));

    const userIme = computed(() => {
      try {
        return token.value ? jwtDecode(token.value).ime : "";
      } catch {
        return "";
      }
    });

    const userPrezime = computed(() => {
      try {
        return token.value ? jwtDecode(token.value).prezime : "";
      } catch {
        return "";
      }
    });

    const isAuthenticated = () => {
      return !!localStorage.getItem("token");
    };

    const isAdmin = () => {
      if (!isAuthenticated()) return false;
      try {
        return jwtDecode(token.value).uloga === "admin";
      } catch {
        return false;
      }
    };

    const confirmLogout = () => {
      confirmLogoutDialog.value = true;
    };

    const logoutAndReload = () => {
      localStorage.removeItem("token");
      window.location.reload();
    };

    return {
      confirmLogoutDialog,
      isAuthenticated,
      isAdmin,
      confirmLogout,
      logoutAndReload,
      userIme,
      userPrezime,
    };
  },
});
</script>

<style>
.link-style {
  text-decoration: none;
  color: inherit;
}
</style>