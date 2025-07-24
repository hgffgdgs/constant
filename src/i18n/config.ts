import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import bm from './locales/bm.json';

const resources = {
  fr: {
    translation: fr
  },
  bm: {
    translation: bm
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;