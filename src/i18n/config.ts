import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from '@/lib/translations';

// Map namespaces from our centralized dictionary
const resources = {
  'pt-BR': {
    translation: translations['pt-BR']
  },
  'en-US': {
    translation: translations['en-US']
  },
  'es-ES': {
    translation: translations['es-ES']
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'zevva-language',
      caches: ['localStorage'],
    }
  });

export default i18n;