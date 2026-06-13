import Admin from "layouts/AdminLayout";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "/", component: () => import("pages/Pocetna.vue") },
      { path: "pocetna", component: () => import("pages/Pocetna.vue") },
      { path: "postavi", component: () => import("pages/PostaviAukciju.vue") },
      { path: "prikaz", component: () => import("pages/PrikazAukcije.vue") },
      { path: "sve-aukcije", component: () => import("pages/SveAukcije.vue") },
      { path: "kategorija", component: () => import("pages/PrikazPredmetaKategorije.vue") },
      { path: "konverter", component: () => import("pages/konverter.vue") },
      { path: "prijava", component: () => import("pages/Prijava_m.vue") },
      { path: "Logout", component: () => import("pages/Logout.vue") },
      { path: "registracija", component: () => import("pages/Registracija_m.vue") },
      { path: "Moj_profil", component: () => import("pages/Moj_profil.vue") },
      { path: "UpdateProfil", component: () => import("pages/UpdateProfil.vue") },
      { path: "admindash", component: () => import("pages/AdminDashboard.vue") },
      { path: "pregledkorisnika", component: () => import("pages/PregledKorisnika.vue") },
      { path: "izmjena_predmeta", component: () => import("pages/IzmjenaPredmeta.vue") },
      { path: "lista-pracenja", component: () => import("pages/ListaPracenja.vue") },
      { path: "racuni", component: () => import("pages/Racuni.vue") }
    ],
  },
  {
    path: "/admin",
    component: () => import("layouts/AdminLayout.vue"),
    children: [
      { 
        path: "dashboard", 
        name: "admin-dashboard",
        component: () => import("pages/AdminDashboard.vue") 
      },
      { 
        path: "kategorije", 
        name: "admin-kategorije",
        component: () => import("pages/Kategorije.vue") 
      },
      { 
        name: "kategorijadetalji", 
        path: "kategorija/:id", 
        component: () => import("pages/KategorijaDetalji.vue") 
      },
      { 
        path: "dodajkategoriju", 
        name: "admin-dodaj-kategoriju",
        component: () => import("pages/KategorijaDodaj.vue") 
      },
      { 
        path: "racuni", 
        name: "admin-racuni",
        component: () => import("pages/Racuni.vue") 
      },
      { 
        path: "korisnici", 
        name: "admin-korisnici",
        component: () => import("pages/PregledKorisnika.vue") 
      },
      { 
        name: "korisnikdetalji", 
        path: "korisnik/:id", 
        component: () => import("pages/KorisnikDetalji.vue") 
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
