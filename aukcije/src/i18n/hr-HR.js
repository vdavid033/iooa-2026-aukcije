export default {
  common: {
    hello: 'Pozdrav',
    close: 'Zatvori',
    cancel: 'Odustani',
    back: 'Natrag',
    selectFile: 'Odaberi datoteku',
    noFileSelected: 'Nije odabrana niti jedna datoteka'
  },

  menu: {
    title: 'Mogućnosti',
    home: 'Početna stranica',
    login: 'Prijava',
    register: 'Registracija',
    addAuction: 'Dodaj aukciju',
    profile: 'Moj profil',
    logout: 'Odjava',
    logoutConfirm: 'Jeste li sigurni da se želite odjaviti?',
    admin: 'Admin Dashboard'
  },
  day: "dan",
  days: "dana",

  adminLayout: {
    title: 'Upravljačka ploča administratora',
    logout: 'Odjava',
    menu: 'Polja',
    categories: 'Kategorije',
    users: 'Pregled korisnika',
    exit: 'Izlazak',
    logoutConfirm: 'Jeste li sigurni da se želite odjaviti?'
  },

  loginPage: {
    title: 'Prijava',
    email: 'Vaš email',
    password: 'Lozinka',
    submit: 'Prijava',
    register: 'Registrirajte se!',
    failed: 'Prijava nije uspjela. Provjerite podatke i pokušajte ponovno.'
  },

  registerPage: {
    title: 'Registracija',
    firstName: 'Vaše ime',
    lastName: 'Vaše prezime',
    email: 'Vaš email',
    password: 'Lozinka',
    repeatPassword: 'Ponovi lozinku',
    address: 'Adresa',
    submit: 'Registracija',
    goToLogin: 'Prijeđi na prijavu',
    continueAsGuest: 'Nastavi kao gost',
    success: 'Registracija uspješna!',
    emailInUse: 'E-mail već u upotrebi!',
    registrationError: 'Greška pri registraciji!',
    passwordsMismatch: 'Lozinke se ne podudaraju!',
    requiredFields: 'Niste popunili sva polja!'
  },

  homePage: {
    searchPlaceholder: 'Pretraži aukcije',
    sortBy: 'Sortiraj po',
    categories: 'Kategorije',
    latestAuctions: 'Zadnje ili trenutne aukcije',
    startingPrice: 'Početna cijena',
    startTime: 'Vrijeme početka',
    endTime: 'Vrijeme završetka',
    timeRemaining: 'Preostalo vrijeme aukcije',
    currentPrice: 'Trenutna cijena',
    sortPriceAsc: 'Cijena: manja prema većoj',
    sortPriceDesc: 'Cijena: veća prema manjoj',
    sortNameAsc: 'Naziv: A do Z',
    sortNameDesc: 'Naziv: Z do A',
    sortExpiration: 'Vrijeme isteka'
  },

  createAuction: {
    title: 'Postavi aukciju',
    productName: 'Naziv proizvoda',
    enterName: 'Unesite naziv',
    category: 'Kategorija',
    selectCategory: 'Odaberite kategoriju',
    startPrice: 'Početna cijena proizvoda',
    enterPrice: 'Unesite početnu cijenu',
    priceNotNegative: 'Početna cijena ne može biti negativna',
    startDate: 'Datum i vrijeme početka aukcije',
    endDate: 'Datum i vrijeme završetka aukcije',
    description: 'Opis proizvoda',
    enterDescription: 'Unesite opis',
    uploadImage: 'Unesite sliku',
    submit: 'Postavi',
    cancel: 'Otkaži',
    close: 'Zatvori',
    success: 'Predmet je uspješno dodan!',
    notLoggedIn: 'Niste prijavljeni, pristup odbijen',
    onlyImages: 'Dopuštene su samo slike.',
    requiredFields: 'Niste ispunili sva polja',
    selectImage: 'Molimo odaberite barem jednu sliku.',
    invalidDateRange: 'Datum početka ne može biti kasnije od datuma završetka',
    imageCompressionError: 'Došlo je do pogreške prilikom kompresije slika.'
  },

  profilePage: {
    user: 'Korisnik',
    currentFirstName: 'Trenutno ime',
    currentLastName: 'Trenutno prezime',
    currentEmail: 'Trenutni email',
    currentAddress: 'Trenutna adresa',
    profileImage: 'Profilna slika',
    editUserData: 'Izmjena korisničkih podataka',
    yourAuctionItems: 'Vaši predmeti na aukciji',
    startingPrice: 'Početna cijena',
    startTime: 'Vrijeme početka',
    endTime: 'Vrijeme završetka',
    remainingTime: 'Preostalo vrijeme aukcije',
    currentPrice: 'Trenutna cijena',
    edit: 'Izmijeni',
    delete: 'Obriši',
    yourBids: 'Vaše ponude',
    description: 'Opis',
    bidValue: 'Vrijednost ponude',
    bidTime: 'Vrijeme ponude',
    noAuctionItems: 'Nemate niti jedan predmet na aukciji!',
    noBids: 'Nemate niti jednu ponudu!',
    confirmDelete: 'Jeste li sigurni da želite obrisati predmet?',
    deleteSuccess: 'Brisanje uspješno!'
  },

  updateProfilePage: {
    user: 'Korisnik',
    firstName: 'Ime',
    lastName: 'Prezime',
    email: 'E-mail',
    password: 'Lozinka',
    confirmPassword: 'Potvrda lozinke',
    address: 'Adresa',
    edit: 'Izmijeni',
    currentFirstName: 'Trenutno ime',
    currentLastName: 'Trenutno prezime',
    currentEmail: 'Trenutni email',
    currentAddress: 'Trenutna adresa',
    noChanges: 'Nema izmjena!',
    passwordMismatch: 'Lozinke se ne podudaraju!',
    updateSuccess: 'Podaci ažurirani!',
    updateFailed: 'Greška pri ažuriranju.'
  },

  auctionViewPage: {
    title: "Pregled aukcije",
    back: "Natrag",
    productName: "Naziv predmeta",
    productDescription: "Opis predmeta",
    startTime: "Vrijeme početka",
    endTime: "Vrijeme završetka",
    startPrice: "Početna cijena",
    currentPrice: "Trenutna cijena",
    bid: "Ponudi",
    makeBid: "Unesi ponudu",
    selectPrice: "Odaberi cijenu",
    confirmBid: "Potvrdi ponudu"
  },

  categoryPage: {
    searchAuctions: 'Pretraži aukcije',
    sortBy: 'Sortiraj po',
    startingPrice: 'Početna cijena',
    startTime: 'Vrijeme početka',
    endTime: 'Vrijeme završetka',
    remainingTime: 'Preostalo vrijeme aukcije',
    remainingHours: '{hours} h',
    currentPrice: 'Trenutna cijena',
    sortPriceAsc: 'Cijena: manja prema većoj',
    sortPriceDesc: 'Cijena: veća prema manjoj',
    sortNameAsc: 'Naziv: A do Z',
    sortNameDesc: 'Naziv: Z do A',
    sortExpiration: 'Vrijeme isteka'
  },

  adminPage: {
    title: 'Upravljačka ploča administratora',
    categories: 'Kategorije',
    users: 'Korisnici',
    auctions: 'Aukcije',
    addCategoryTitle: 'Dodaj kategoriju',
    categoryName: 'Naziv kategorije',
    addCategory: 'Dodaj'
  },

  errorPage: {
    message: 'Stranica ne postoji...',
    backHome: 'Povratak'
  },

  editCategoryPage: {
    title: 'Izmjena kategorije',
    name: 'Naziv',
    currentName: 'Trenutni naziv',
    edit: 'Izmijeni',
    updateSuccess: 'Kategorija izmijenjena!',
    updateFailed: 'Greška!'
  },

  addCategoryPage: {
    title: 'Nova kategorija',
    name: 'Naziv',
    add: 'Dodaj',
    success: 'Dodano!',
    error: 'Greška!',
    required: 'Naziv je obavezan!'
  },

  categoriesPage: {
    title: 'Kategorije',
    rowsPerPage: 'Broj redova:',
    name: 'Naziv',
    actions: 'Akcije',
    edit: 'Izmijeni',
    delete: 'Obriši',
    addNew: 'Dodaj novu',
    deleteSuccess: 'Obrisano!',
    deleteError: 'Greška!'
  },

  auth: {
    logoutSuccess: "Odjavljeni ste!",
    logoutError: "Greška pri odjavi!"
  },

  editAuctionPage: {
    item: "Predmet",
    name: "Naziv predmeta",
    currentName: "Trenutni naziv",
    category: "Kategorija",
    currentCategory: "Trenutna kategorija",
    description: "Opis predmeta",
    currentDescription: "Trenutni opis",
    startPrice: "Početna cijena",
    currentStartPrice: "Trenutna početna cijena",
    startDate: "Datum početka",
    endDate: "Datum završetka",
    currentStartDate: "Trenutni datum početka",
    currentEndDate: "Trenutni datum završetka",
    edit: "Uredi",
    imageManagement: "Upravljanje slikama",
    deleteImage: "Obriši sliku",
    deleteImageHint: "Briše se trenutno prikazana slika.",
    addImages: "Dodaj slike",
    noChanges: "Niste unijeli nikakve promjene.",
    updateSuccess: "Predmet je uspješno izmijenjen.",
    updateFailed: "Greška pri izmjeni predmeta.",
    imageDeleteSuccess: "Slika je uspješno obrisana.",
    imageDeleteFailed: "Greška pri brisanju slike.",
    addImagesSuccess: "Slike su uspješno dodane.",
    addImagesFailed: "Greška pri dodavanju slika.",
    imageCompressionError: "Došlo je do pogreške prilikom kompresije slike."
    }
};