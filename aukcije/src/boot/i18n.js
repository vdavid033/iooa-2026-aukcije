import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

import enUS from '../i18n/en-US'
import bsBA from '../i18n/hr-HR'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'hr-HR',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'hr-HR': bsBA
  }
})

export default boot(({ app }) => {
  app.use(i18n)
})

export { i18n }