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
          <q-btn
            flat
            color="primary"
            class="q-ml-sm menu-btn"
          >
            <q-icon name="menu" size="22px" />

            <q-icon
              name="keyboard_arrow_down"
              size="18px"
              class="arrow-icon q-ml-xs"
              :class="{ 'arrow-rotate': menuOpen }"
            />

            <q-menu
              v-model="menuOpen"
              anchor="bottom right"
              self="top right"
              :offset="[0, 14]"
              class="custom-dropdown"
            >
              <q-list class="dropdown-list">

                <router-link to="/" class="link-style">
                  <q-item clickable v-close-popup class="dropdown-item">
                    <q-item-section avatar>
                      <q-icon name="home" color="primary" />
                    </q-item-section>
                    <q-item-section>Početna</q-item-section>
                  </q-item>
                </router-link>

                <router-link to="/postavi" class="link-style">
                  <q-item clickable v-close-popup class="dropdown-item">
                    <q-item-section avatar>
                      <q-icon name="add_circle" color="primary" />
                    </q-item-section>
                    <q-item-section>Dodaj aukciju</q-item-section>
                  </q-item>
                </router-link>

                <router-link to="/Moj_profil" class="link-style">
                  <q-item clickable v-close-popup class="dropdown-item">
                    <q-item-section avatar>
                      <q-icon name="person" color="primary" />
                    </q-item-section>
                    <q-item-section>Moj profil</q-item-section>
                  </q-item>
                </router-link>

                <template v-if="isAdmin()">
                  <q-separator class="q-my-sm" />

                  <router-link to="/admin/" class="link-style">
                    <q-item clickable v-close-popup class="dropdown-item">
                      <q-item-section avatar>
                        <q-icon name="admin_panel_settings" color="primary" />
                      </q-item-section>
                      <q-item-section>Admin Dashboard</q-item-section>
                    </q-item>
                  </router-link>
                </template>

                <template v-if="isAuthenticated()">
                  <q-separator class="q-my-sm" />

                  <q-item
                    clickable
                    v-close-popup
                    @click="confirmLogout"
                    class="dropdown-item logout-item"
                  >
                    <q-item-section avatar>
                      <q-icon name="logout" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <span class="text-negative">Odjava</span>
                    </q-item-section>
                  </q-item>
                </template>

              </q-list>
            </q-menu>
          </q-btn>

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
          <q-btn flat :label="t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="t('menu.logout')" color="negative" @click="logoutAndReload" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { jwtDecode } from "jwt-decode";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const { locale, t } = useI18n();

    const lang = ref(localStorage.getItem("lang") || "hr-HR");

    const languageOptions = [
      { label: "HR", value: "hr-HR" },
      { label: "ENG", value: "en-US" },
    ];

    const changeLanguage = (value) => {
      lang.value = value;
      locale.value = value;
      localStorage.setItem("lang", value);
    };

    const leftDrawerOpen = ref(false);
    const confirmLogoutDialog = ref(false);
    const menuOpen = ref(false);
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
      lang,
      languageOptions,
      changeLanguage,
      leftDrawerOpen,
      confirmLogoutDialog,
      menuOpen,
      isAuthenticated,
      isAdmin,
      confirmLogout,
      logoutAndReload,
      userIme,
      userPrezime,
      t,
    };
  },
});
</script>

<style>
.link-style {
  text-decoration: none;
  color: inherit;
}

.menu-btn {
  border-radius: 10px;
  min-width: 64px;
}

.arrow-icon {
  transition: 0.25s ease;
}

.arrow-rotate {
  transform: rotate(180deg);
}

.dropdown-list {
  min-width: 260px;
  padding: 14px;
}

.dropdown-item {
  border-radius: 12px;
  margin: 6px 0;
  min-height: 54px;
  font-size: 15px;
  font-weight: 500;
}

.dropdown-item:hover {
  background: #eef4ff;
}

.logout-item:hover {
  background: #fff0f0;
}

.custom-dropdown {
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
}
</style>