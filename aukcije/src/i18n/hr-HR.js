export default {
  common: {
    hello: 'Pozdrav'
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
  uploadImage: 'Unesite sliku:',
  submit: 'Postavi',
  cancel: 'Otkaži',
  success: 'Predmet je uspješno dodan!',
  notLoggedIn: 'Niste prijavljeni, pristup odbijen',
  onlyImages: 'Dopuštene su samo slike.',
  requiredFields: 'Niste ispunili sva polja',
  selectImage: 'Molimo odaberite barem jednu sliku.'
  },

  profilePage: {
  user: 'Korisnik',
  currentFirstName: 'Trenutno ime',
  currentLastName: 'Trenutno prezime',
  currentEmail: 'Trenutni email',
  currentAddress: 'Trenutna adresa',
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
  bidTime: 'Vrijeme postavljanja ponude',
  noAuctionItems: 'Nemate niti jedan predmet koji je ili je bio na aukciji!',
  noBids: 'Nemate niti jednu ponudu!',
  confirmDelete: 'Jeste li sigurni da želite obrisati predmet?',
  deleteSuccess: 'Brisanje podataka uspješno!'
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
  noChanges: 'Nije napravljena niti jedna izmjena!',
  passwordMismatch: 'Lozinke se ne podudaraju!',
  updateSuccess: 'Izmjena podataka uspješna!',
  updateFailed: 'Izmjena podataka neuspješna.'
  },

  auctionViewPage: {
  title: 'Prikaz aukcije',
  back: 'Natrag',
  productName: 'Naziv proizvoda',
  productDescription: 'Opis proizvoda',
  startTime: 'Početno vrijeme aukcije',
  endTime: 'Završno vrijeme aukcije',
  startPrice: 'Početna cijena proizvoda',
  currentPrice: 'Trenutna cijena',
  bid: 'Ponuda',
  makeBid: 'Ponudi',
  selectPrice: 'Odaberi cijenu',
  confirmBid: 'Potvrdi ponudu'
},

common: {
  cancel: 'Odustani'
  },

  categoryPage: {
  searchAuctions: 'Pretraži aukcije',
  sortBy: 'Sortiraj po',
  startingPrice: 'Početna cijena',
  startTime: 'Vrijeme početka',
  endTime: 'Vrijeme završetka',
  remainingTime: 'Preostalo vrijeme aukcije',
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
  users: 'Korisnički računi',
  auctions: 'Aukcije',
  addCategoryTitle: 'Unos kategorija',
  categoryName: 'Naziv kategorije',
  addCategory: 'Unesi kategoriju'
  },

  errorPage: {
  message: 'Ups. Tražena stranica ne postoji...',
  backHome: 'Povratak na početnu'
  },

  editAuctionPage: {
  item: 'Predmet',
  name: 'Naziv',
  currentName: 'Trenutni naziv predmeta',
  category: 'Kategorija',
  currentCategory: 'Trenutna kategorija',
  description: 'Opis',
  currentDescription: 'Trenutni opis',
  startPrice: 'Početna cijena',
  currentStartPrice: 'Trenutna početna cijena',
  startDate: 'Datum i vrijeme početka aukcije',
  endDate: 'Datum i vrijeme završetka aukcije',
  currentStartDate: 'Trenutni datum i vrijeme početka',
  currentEndDate: 'Trenutni datum i vrijeme završetka',
  edit: 'Izmijeni',
  noChanges: 'Nije napravljena niti jedna izmjena!',
  updateSuccess: 'Izmjena podataka uspješna!',
  updateFailed: 'Izmjena podataka neuspješna.',
  imageManagement: 'Upravljanje slikama',
  deleteImage: 'Obriši sliku',
  deleteImageHint: 'Ovaj gumb briše sliku koja je trenutno prikazana iznad.',
  addImages: 'Dodaj nove slike',
  imageDeleteSuccess: 'Slika uspješno obrisana.',
  imageDeleteFailed: 'Brisanje slike neuspješno.',
  addImagesSuccess: 'Dodavanje slika/e uspješno.',
  addImagesFailed: 'Dodavanje slika/e neuspješno.',
  imageCompressionError: 'Došlo je do pogreške prilikom kompresije slika.'
    },

  editCategoryPage: {
  title: 'Ažuriranje kategorije',
  name: 'Naziv',
  currentName: 'Trenutni naziv',
  edit: 'Izmijeni',
  updateSuccess: 'Izmjena podataka uspješna!',
  updateFailed: 'Izmjena podataka neuspješna.'
  },

  addCategoryPage: {
  title: 'Unos nove kategorije',
  name: 'Naziv',
  add: 'Dodaj',
  success: 'Kategorija uspješno unesena.',
  error: 'Greška pri unosu kategorije!',
  required: 'Niste unijeli naziv kategorije!'
  }

}