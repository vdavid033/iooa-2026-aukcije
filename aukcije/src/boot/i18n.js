import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

import enUS from '../i18n/en-US'
import bsBA from '../i18n/hr-HR'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('lang') || 'hr-HR',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'hr-HR': bsBA
  }
})

// Helper za prijevod sadrzaja iz baze: vrati englesku vrijednost ako je
// trenutni jezik engleski i ona postoji, inace hrvatsku (fallback).
export function pickLang (hr, en) {
  if (i18n.global.locale.value === 'en-US' && en !== null && en !== undefined && en !== '') {
    return en
  }
  return hr === null || hr === undefined ? '' : hr
}

export default boot(({ app }) => {
  app.use(i18n)
  // Globalno dostupan u svim templateima kao $pick(hr, en)
  app.config.globalProperties.$pick = pickLang
})

export { i18n }