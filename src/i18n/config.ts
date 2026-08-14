import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from '@/lib/translations';

// Map namespaces from our centralized dictionary
const ptBR = {
  navigation: translations['pt-BR'].navigation,
  nav: translations['pt-BR'].nav,
  home: translations['pt-BR'].home,
  footer: translations['pt-BR'].footer,
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    back: 'Voltar'
  }
};

const enUS = {
  navigation: translations['en-US'].navigation,
  nav: translations['en-US'].nav,
  home: translations['en-US'].home,
  footer: translations['en-US'].footer,
  common: {
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back'
  }
};

const esES = {
  navigation: translations['es-ES'].navigation,
  nav: translations['es-ES'].nav,
  home: translations['es-ES'].home,
  footer: translations['es-ES'].footer,
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    back: 'Volver'
  }
};

const resources = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    ns: ['navigation', 'nav', 'home', 'footer', 'common'],
    defaultNS: 'common',
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
