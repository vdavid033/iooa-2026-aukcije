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
          {{ $t('common.appName') }}
        </div>

        <q-space />
        <!-- DESNA STRANA -->
        <div class="row items-center q-gutter-sm">

          <!-- PREBACIVAC JEZIKA -->
          <q-btn-toggle
            v-model="lang"
            unelevated
            dense
            no-caps
            size="sm"
            toggle-color="primary"
            color="grey-3"
            text-color="primary"
            :options="[
              { label: 'HR', value: 'hr-HR' },
              { label: 'EN', value: 'en-US' }
            ]"
            @update:model-value="setLang"
          />

          <!-- GUEST -->
          <template v-if="!isAuthenticated()">
            <q-btn flat :label="$t('menu.register')" to="/registracija" />
            <q-btn color="primary" unelevated :label="$t('menu.login')" to="/prijava" />
          </template>

          <!-- NOTIFIKACIJE -->
          <template v-if="isAuthenticated()">
            <q-btn flat round dense icon="notifications" color="primary" class="q-mr-sm">
              <q-badge v-if="neprocitanoCount > 0" color="red" floating>{{ neprocitanoCount }}</q-badge>
              <q-menu style="width: 340px; max-height: 420px">
                <q-toolbar class="bg-primary text-white">
                  <q-toolbar-title style="font-size: 14px">Obavijesti</q-toolbar-title>
                  <q-btn v-if="notifikacije.length" flat dense size="sm" label="Označi sve pročitano" @click="oznacilSveKaoProcitano" />
                </q-toolbar>
                <q-list separator>
                  <q-item v-if="!notifikacije.length">
                    <q-item-section class="text-grey text-center q-pa-md">Nema novih obavijesti.</q-item-section>
                  </q-item>
                  <q-item
                    v-for="n in notifikacije"
                    :key="n.id_notifikacija"
                    clickable
                    :class="n.procitano ? '' : 'bg-blue-1'"
                    @click="klikNaObavijest(n)"
                    v-close-popup
                  >
                    <q-item-section avatar>
                      <q-icon :name="n.procitano ? 'notifications_none' : 'notifications_active'" :color="n.procitano ? 'grey' : 'blue'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ n.poruka }}</q-item-label>
                      <q-item-label caption>{{ formatirajDatum(n.datum_kreiranja) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
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
                    <q-item-section>{{ $t('menu.home') }}</q-item-section>
                  </q-item>
                </router-link>

                <router-link to="/postavi" class="link-style">
                  <q-item clickable v-close-popup class="dropdown-item">
                    <q-item-section avatar>
                      <q-icon name="add_circle" color="primary" />
                    </q-item-section>
                    <q-item-section>{{ $t('menu.addAuction') }}</q-item-section>
                  </q-item>
                </router-link>

                <router-link to="/Moj_profil" class="link-style">
                  <q-item clickable v-close-popup class="dropdown-item">
                    <q-item-section avatar>
                      <q-icon name="person" color="primary" />
                    </q-item-section>
                    <q-item-section>{{ $t('menu.profile') }}</q-item-section>
                  </q-item>
                </router-link>

                <template v-if="isAuthenticated()">
                  <router-link to="/lista-pracenja" class="link-style">
                    <q-item clickable v-close-popup class="dropdown-item">
                      <q-item-section avatar>
                        <q-icon name="visibility" color="primary" />
                      </q-item-section>
                      <q-item-section>Lista praćenja</q-item-section>
                    </q-item>
                  </router-link>

                  <router-link to="/racuni" class="link-style">
                    <q-item clickable v-close-popup class="dropdown-item">
                      <q-item-section avatar>
                        <q-icon name="receipt_long" color="primary" />
                      </q-item-section>
                      <q-item-section>Računi</q-item-section>
                    </q-item>
                  </router-link>
                </template>

                <template v-if="isAdmin()">
                  <q-separator class="q-my-sm" />

                  <router-link to="/admin/" class="link-style">
                    <q-item clickable v-close-popup class="dropdown-item">
                      <q-item-section avatar>
                        <q-icon name="admin_panel_settings" color="primary" />
                      </q-item-section>
                      <q-item-section>{{ $t('menu.admin') }}</q-item-section>
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
                      <span class="text-negative">{{ $t('menu.logout') }}</span>
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
        © 2026 {{ $t('common.appName') }}
      </div>
    </q-page-container>

    <!-- Pobjednik Dialog -->
    <q-dialog v-model="pobjednikDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Pobjednik aukcije</div>
          <div class="text-caption">{{ pobjednikInfo.naziv_predmeta }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm q-pt-md">
          <div class="row items-center">
            <q-icon name="person" color="primary" size="sm" class="q-mr-sm" />
            <span>{{ pobjednikInfo.ime_korisnika }} {{ pobjednikInfo.prezime_korisnika }}</span>
          </div>
          <div class="row items-center">
            <q-icon name="email" color="primary" size="sm" class="q-mr-sm" />
            <span>{{ pobjednikInfo.email_korisnika }}</span>
          </div>
          <div v-if="pobjednikInfo.adresa_korisnika" class="row items-center">
            <q-icon name="home" color="primary" size="sm" class="q-mr-sm" />
            <span>{{ pobjednikInfo.adresa_korisnika }}</span>
          </div>
          <div class="row items-center">
            <q-icon name="gavel" color="green" size="sm" class="q-mr-sm" />
            <span>Pobjednička ponuda: <strong>{{ pobjednikInfo.vrijednost_ponude }}$</strong></span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Zatvori" v-close-popup />
          <q-btn color="primary" icon="email" label="Pošalji email" @click="otvoriMail" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- LOGOUT DIALOG -->
    <q-dialog v-model="confirmLogoutDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            {{ $t('menu.logoutConfirm') }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('menu.logout')" color="negative" @click="logoutAndReload" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import axios from "axios";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const { locale } = useI18n({ useScope: "global" });
    const lang = ref(localStorage.getItem("lang") || "hr-HR");
    const setLang = (val) => {
      lang.value = val;
      locale.value = val;
      localStorage.setItem("lang", val);
    };

    const confirmLogoutDialog = ref(false);
    const menuOpen = ref(false);
    const token = ref(localStorage.getItem("token"));

    const notifikacije = ref([]);
    const pobjednikDialog = ref(false);
    const pobjednikInfo = ref({});
    const neprocitanoCount = computed(() => notifikacije.value.filter((n) => !n.procitano).length);
    const router = useRouter();

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

    let socket = null;

    const ucitajNotifikacije = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      const decoded = jwtDecode(t);
      axios
        .get(`http://localhost:3000/api/notifikacije/${decoded.id}`, {
          headers: { Authorization: `Bearer ${t}` },
        })
        .then((res) => { notifikacije.value = res.data; })
        .catch(() => {});
    };

    const oznacilSveKaoProcitano = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      const decoded = jwtDecode(t);
      axios
        .put(`http://localhost:3000/api/notifikacije/procitaj-sve/${decoded.id}`, {}, {
          headers: { Authorization: `Bearer ${t}` },
        })
        .then(() => { notifikacije.value.forEach((n) => (n.procitano = 1)); })
        .catch(() => {});
    };

    const otvoriAukciju = (id_predmeta) => {
      router.push({ path: "/prikaz", query: { id_predmeta } });
    };

    const klikNaObavijest = (n) => {
      n.procitano = 1;
      if (n.poruka && n.poruka.includes("Pobjednik:")) {
        const t = localStorage.getItem("token");
        axios
          .get(`http://localhost:3000/api/pobjednik/${n.id_predmeta}`, {
            headers: { Authorization: `Bearer ${t}` },
          })
          .then((res) => {
            pobjednikInfo.value = res.data;
            pobjednikDialog.value = true;
          })
          .catch(() => {
            router.push({ path: "/prikaz", query: { id_predmeta: n.id_predmeta } });
          });
      } else {
        router.push({ path: "/prikaz", query: { id_predmeta: n.id_predmeta } });
      }
    };

    const mailtoLink = computed(() => {
      const p = pobjednikInfo.value;
      if (!p.email_korisnika) return "#";
      const subject = encodeURIComponent(`Aukcija "${p.naziv_predmeta}" - preuzimanje predmeta`);
      const body = encodeURIComponent(
        `Poštovani ${p.ime_korisnika} ${p.prezime_korisnika},\n\n` +
        `čestitam na pobjedi na aukciji "${p.naziv_predmeta}"!\n` +
        `Vaša pobjednička ponuda: ${p.vrijednost_ponude}$\n\n` +
        `Molim Vas da mi se javite kako bismo dogovorili detalje preuzimanja predmeta.\n\n` +
        `S poštovanjem`
      );
      return `mailto:${p.email_korisnika}?subject=${subject}&body=${body}`;
    });

    const otvoriMail = () => {
      window.location.href = mailtoLink.value;
    };

    const formatirajDatum = (d) => new Date(d).toLocaleString("hr-HR").replace(",", "");

    onMounted(() => {
      const t = localStorage.getItem("token");
      if (!t) return;
      const decoded = jwtDecode(t);
      ucitajNotifikacije();

      socket = io("http://localhost:3000");
      socket.emit("pridruzi_se_korisniku", decoded.id);
      socket.on("nova_notifikacija", (data) => {
        notifikacije.value.unshift({
          id_notifikacija: Date.now(),
          poruka: data.poruka,
          id_predmeta: data.id_predmeta,
          procitano: 0,
          datum_kreiranja: data.datum_kreiranja,
        });
      });
    });

    onBeforeUnmount(() => {
      if (socket) socket.disconnect();
    });

    return {
      lang,
      setLang,
      confirmLogoutDialog,
      menuOpen,
      notifikacije,
      neprocitanoCount,
      pobjednikDialog,
      pobjednikInfo,
      isAuthenticated,
      isAdmin,
      confirmLogout,
      logoutAndReload,
      ucitajNotifikacije,
      oznacilSveKaoProcitano,
      otvoriAukciju,
      klikNaObavijest,
      mailtoLink,
      otvoriMail,
      formatirajDatum,
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
