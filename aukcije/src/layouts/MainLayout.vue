<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <router-link to="/" class="link-style">
            <q-avatar>
              <img src="~assets\aukcije_logo.jpg" alt="Logo" />
            </q-avatar>
          </router-link>
        </q-toolbar-title>
        <q-space></q-space>
        <q-space /><q-space /><q-space /><q-space /><q-space /><q-space /><q-space /><q-space />
        <template v-if="isAuthenticated()">
          <q-btn flat round dense icon="notifications" color="white" class="q-mr-sm">
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
          <div class="q-pa-md">
            <q-btn-dropdown  ripple="false" stretch flat text-color="white" color="primary" :label="`${userIme} ${userPrezime}`" >
              <q-list>
                <router-link to="/Moj_profil" class="link-style" @click="toggleLeftDrawerClose">
                  <q-item clickable v-close-popup @click="onItemClick">
                    <q-item-section>
                      <q-item-label>Moj profil</q-item-label>
                    </q-item-section>
                  </q-item>
                </router-link>
                <q-item clickable v-close-popup @click="confirmLogout">
                  <q-item-section>
                    <q-item-label>Odjava</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header class="text-bold text-black"> Mogućnosti </q-item-label>

        <div class="q-pa-sm col">
          <!--        Za navigaciju bez otvaranja novog tab-a-->
          <template v-if="!isAuthenticated()">
            <div class="q-pa-sm col">
              <router-link to="/prijava" class="link-style" @click="toggleLeftDrawerClose">
                <q-btn class="flex flex-center" style="width: 280px"> Prijava </q-btn>
              </router-link>
            </div>
            <div class="q-pa-sm col">
              <router-link to="/registracija" class="link-style" @click="toggleLeftDrawerClose">
                <q-btn class="flex flex-center" style="width: 280px"> Registracija </q-btn>
              </router-link>
            </div>
          </template>
          <div class="q-pa-sm col">
            <router-link to="/" class="link-style" @click="toggleLeftDrawerClose">
              <q-btn class="flex flex-center" style="width: 280px"> Početna stranica </q-btn>
            </router-link>
          </div>
          <div class="q-pa-sm col">
            <router-link to="postavi" class="link-style" @click="toggleLeftDrawerClose">
              <q-btn class="flex flex-center" style="width: 280px"> Dodaj aukciju </q-btn>
            </router-link>
          </div>
          <template v-if="isAuthenticated()">
            <div class="q-pa-sm col">
              <router-link to="/Moj_profil" class="link-style" @click="toggleLeftDrawerClose">
                <q-btn class="flex flex-center" style="width: 280px"> Moj profil </q-btn>
              </router-link>
            </div>
            <div class="q-pa-sm col">
              <router-link to="/lista-pracenja" class="link-style" @click="toggleLeftDrawerClose">
                <q-btn class="flex flex-center" style="width: 280px" icon="visibility"> Lista praćenja </q-btn>
              </router-link>
            </div>
          </template>
          <template v-if="isAdmin()">
            <div class="q-pa-sm col">
              <router-link to="/admin/" class="link-style" @click="toggleLeftDrawer">
                <q-btn class="flex flex-center" color="primary" style="width: 280px">Admin Dashboard</q-btn>
              </router-link>
            </div>
          </template>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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

    <!-- Logout Confirmation Dialog -->
    <q-dialog v-model="confirmLogoutDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Jeste li sigurni da želite se odjaviti?</span>
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
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import axios from "axios";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const leftDrawerOpen = ref(false);
    const confirmLogoutDialog = ref(false);
    const notifikacije = ref([]);
    const pobjednikDialog = ref(false);
    const pobjednikInfo = ref({});
    const neprocitanoCount = computed(() => notifikacije.value.filter((n) => !n.procitano).length);
    const router = useRouter();

    const token = ref(localStorage.getItem("token"));

    // Decode the JWT token and extract the user's name and surname
    const userIme = computed(() => {
      if (token.value) {
        try {
          const decodedToken = jwtDecode(token.value);
          return decodedToken.ime; // Return user's name from token
        } catch (error) {
          console.error("Error decoding token:", error);
          return "";
        }
      }
      return "";
    });

    const userPrezime = computed(() => {
      if (token.value) {
        try {
          const decodedToken = jwtDecode(token.value);
          return decodedToken.prezime; // Return user's surname from token
        } catch (error) {
          console.error("Error decoding token:", error);
          return "";
        }
      }
      return "";
    });

    const isAdmin = () => {
      if (isAuthenticated() && token.value) {
        const decodedToken = jwtDecode(token.value);
        return decodedToken.uloga === "admin";
      }
      return false;
    };

    const isAuthenticated = () => {
      const token = localStorage.getItem("token");
      return !!token;
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const toggleLeftDrawerClose = () => {
      leftDrawerOpen.value = false;
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
      leftDrawerOpen,
      confirmLogoutDialog,
      notifikacije,
      neprocitanoCount,
      pobjednikDialog,
      pobjednikInfo,
      isAuthenticated,
      isAdmin,
      toggleLeftDrawer,
      toggleLeftDrawerClose,
      confirmLogout,
      logoutAndReload,
      ucitajNotifikacije,
      oznacilSveKaoProcitano,
      otvoriAukciju,
      klikNaObavijest,
      mailtoLink,
      otvoriMail,
      formatirajDatum,
      userPrezime,
      userIme,
    };
  },
});
</script>
