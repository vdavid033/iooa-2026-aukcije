export default {
  
  common: {
    hello: 'Hello',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back'
  },

  menu: {
  title: 'Menu',
  home: 'Home',
  login: 'Login',
  register: 'Register',
  addAuction: 'Add auction',
  profile: 'My profile',
  logout: 'Logout',
  logoutConfirm: 'Are you sure you want to log out?',
  admin: 'Admin Dashboard'
  },

  adminLayout: {
  title: 'Admin Dashboard',
  logout: 'Logout',
  menu: 'Menu',
  categories: 'Categories',
  users: 'User overview',
  exit: 'Exit',
  logoutConfirm: 'Are you sure you want to log out?'
  },

  loginPage: {
    title: 'Login',
    email: 'Your email',
    password: 'Password',
    submit: 'Login',
    register: 'Register!',
    failed: 'Login failed. Check your details and try again.'
  },

  registerPage: {
    title: 'Registration',
    firstName: 'Your first name',
    lastName: 'Your last name',
    email: 'Your email',
    password: 'Password',
    repeatPassword: 'Repeat password',
    address: 'Address',
    submit: 'Register',
    goToLogin: 'Go to login',
    continueAsGuest: 'Continue as guest',
    success: 'Registration successful!',
    emailInUse: 'Email is already in use!',
    registrationError: 'Registration error!',
    passwordsMismatch: 'Passwords do not match!',
    requiredFields: 'You have not filled in all fields!'
  },

  homePage: {
  searchPlaceholder: 'Search auctions',
  sortBy: 'Sort by',
  categories: 'Categories',
  latestAuctions: 'Latest or current auctions',
  startingPrice: 'Starting price',
  startTime: 'Start time',
  endTime: 'End time',
  timeRemaining: 'Time remaining',
  currentPrice: 'Current price',
  sortPriceAsc: 'Price: low to high',
  sortPriceDesc: 'Price: high to low',
  sortNameAsc: 'Name: A to Z',
  sortNameDesc: 'Name: Z to A',
  sortExpiration: 'Expiration time'
  },

  createAuction: {
  title: 'Create auction',
  productName: 'Product name',
  enterName: 'Enter name',
  category: 'Category',
  selectCategory: 'Select category',
  startPrice: 'Starting price',
  enterPrice: 'Enter starting price',
  priceNotNegative: 'Price cannot be negative',
  startDate: 'Start date and time',
  endDate: 'End date and time',
  description: 'Product description',
  enterDescription: 'Enter description',
  uploadImage: 'Upload image',
  submit: 'Submit',
  cancel: 'Cancel',
  close: 'Close',
  success: 'Item successfully added!',
  notLoggedIn: 'You are not logged in, access denied',
  onlyImages: 'Only images are allowed.',
  requiredFields: 'You did not fill all fields',
  selectImage: 'Please select at least one image.',
  invalidDateRange: 'Start date cannot be later than end date',
  imageCompressionError: 'An error occurred while compressing images.'
  },

  profilePage: {
  user: 'User',
  currentFirstName: 'Current first name',
  currentLastName: 'Current last name',
  currentEmail: 'Current email',
  currentAddress: 'Current address',
  profileImage: 'Profile image',
  editUserData: 'Edit user data',
  yourAuctionItems: 'Your auction items',
  startingPrice: 'Starting price',
  startTime: 'Start time',
  endTime: 'End time',
  remainingTime: 'Remaining auction time',
  currentPrice: 'Current price',
  edit: 'Edit',
  delete: 'Delete',
  yourBids: 'Your bids',
  description: 'Description',
  bidValue: 'Bid value',
  bidTime: 'Bid time',
  noAuctionItems: 'You do not have any items that are or were on auction!',
  noBids: 'You do not have any bids!',
  confirmDelete: 'Are you sure you want to delete the item?',
  deleteSuccess: 'Data deleted successfully!'
  },

  updateProfilePage: {
  user: 'User',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'E-mail',
  password: 'Password',
  confirmPassword: 'Confirm password',
  address: 'Address',
  edit: 'Edit',
  currentFirstName: 'Current first name',
  currentLastName: 'Current last name',
  currentEmail: 'Current email',
  currentAddress: 'Current address',
  noChanges: 'No changes have been made!',
  passwordMismatch: 'Passwords do not match!',
  updateSuccess: 'Data updated successfully!',
  updateFailed: 'Data update failed.'
  },

 auctionViewPage: {
  title: 'Auction view',
  back: 'Back',
  productName: 'Product name',
  productDescription: 'Product description',
  startTime: 'Auction start time',
  endTime: 'Auction end time',
  startPrice: 'Starting price',
  currentPrice: 'Current price',
  bid: 'Bid',
  makeBid: 'Make a bid',
  selectPrice: 'Select price',
  confirmBid: 'Confirm bid'
  },

categoryPage: {
  searchAuctions: 'Search auctions',
  sortBy: 'Sort by',
  startingPrice: 'Starting price',
  startTime: 'Start time',
  endTime: 'End time',
  remainingTime: 'Remaining auction time',
  currentPrice: 'Current price',
  sortPriceAsc: 'Price: low to high',
  sortPriceDesc: 'Price: high to low',
  sortNameAsc: 'Name: A to Z',
  sortNameDesc: 'Name: Z to A',
  sortExpiration: 'Expiration time'
    },

  adminPage: {
  title: 'Admin Dashboard',
  categories: 'Categories',
  users: 'User Accounts',
  auctions: 'Auctions',
  addCategoryTitle: 'Add Category',
  categoryName: 'Category name',
  addCategory: 'Add Category'
  },

  errorPage: {
  message: 'Oops. The page you are looking for does not exist...',
  backHome: 'Back to home'
  },

  editAuctionPage: {
  item: 'Item',
  name: 'Name',
  currentName: 'Current item name',
  category: 'Category',
  currentCategory: 'Current category',
  description: 'Description',
  currentDescription: 'Current description',
  startPrice: 'Starting price',
  currentStartPrice: 'Current starting price',
  startDate: 'Auction start date and time',
  endDate: 'Auction end date and time',
  currentStartDate: 'Current start date and time',
  currentEndDate: 'Current end date and time',
  edit: 'Edit',
  noChanges: 'No changes have been made!',
  updateSuccess: 'Data updated successfully!',
  updateFailed: 'Data update failed.',
  imageManagement: 'Image management',
  deleteImage: 'Delete image',
  deleteImageHint: 'This button deletes the image currently shown above.',
  addImages: 'Add new images',
  imageDeleteSuccess: 'Image deleted successfully.',
  imageDeleteFailed: 'Image deletion failed.',
  addImagesSuccess: 'Image(s) added successfully.',
  addImagesFailed: 'Adding image(s) failed.',
  imageCompressionError: 'An error occurred while compressing images.'
  },

  editCategoryPage: {
  title: 'Update category',
  name: 'Name',
  currentName: 'Current name',
  edit: 'Edit',
  updateSuccess: 'Data updated successfully!',
  updateFailed: 'Data update failed.'
  },

  addCategoryPage: {
  title: 'Add new category',
  name: 'Name',
  add: 'Add',
  success: 'Category successfully added.',
  error: 'Error while adding category!',
  required: 'Category name is required!'
  },

  categoriesPage: {
  title: 'Categories',
  rowsPerPage: 'Rows per page:',
  name: 'Category name',
  actions: 'Actions',
  edit: 'Edit',
  delete: 'Delete',
  addNew: 'Add new category',
  deleteSuccess: 'Category successfully deleted.',
  deleteError: 'Error deleting category!'
  },
  
  imageConverterPage: {
  enterUrl: 'Enter image URL',
  convert: 'Convert to Base64',
  copy: 'Copy to clipboard',
  noInput: 'Please select an image or enter an image URL.',
  fetchError: 'An error occurred while fetching the image from the URL.',
  copySuccess: 'Text successfully copied to clipboard!',
  copyError: 'Copy failed.'
  },

  adminUserEditPage: {
  user: 'User',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'E-mail',
  password: 'Password',
  confirmPassword: 'Confirm password',
  address: 'Address',
  edit: 'Edit',
  currentFirstName: 'Current first name',
  currentLastName: 'Current last name',
  currentEmail: 'Current email',
  currentAddress: 'Current address',
  noChanges: 'No changes have been made!',
  passwordMismatch: 'Passwords do not match!',
  updateSuccess: 'Data updated successfully!',
  updateFailed: 'Data update failed.'
  },

  adminUsersPage: {
  title: "Users",
  rowsPerPage: "Rows per page:",
  firstName: "First name",
  lastName: "Last name",
  email: "E-mail",
  address: "Address",
  actions: "Actions",
  confirmDelete: "Are you sure you want to delete the user?",
  deleteSuccess: "User successfully deleted.",
  deleteError: "Error deleting user!"
  },

  auth: {
  logoutSuccess: "You have been logged out!",
  logoutError: "Error during logout!"
  },

  accountsPage: {
  title: "Accounts"
  }

}