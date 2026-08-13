import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Namespaces placeholders - in a real app these would be separate JSON files
// We'll start with a few critical ones and expand
const resources = {
  'pt-BR': {
    navigation: {
      dashboard: 'Dashboard',
      contacts: 'Contatos',
      settings: 'Configurações',
      language: 'Idioma',
      checkin: 'Check-in',
      plans: 'Planos',
      chat: 'Chat',
      logout: 'Sair',
      profile: 'Meu Perfil'
    },
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      back: 'Voltar'
    }
  },
  'en-US': {
    navigation: {
      dashboard: 'Dashboard',
      contacts: 'Contacts',
      settings: 'Settings',
      language: 'Language',
      checkin: 'Check-in',
      plans: 'Plans',
      chat: 'Chat',
      logout: 'Logout',
      profile: 'My Profile'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      back: 'Back'
    }
  },
  'es-ES': {
    navigation: {
      dashboard: 'Panel',
      contacts: 'Contactos',
      settings: 'Configuración',
      language: 'Idioma',
      checkin: 'Check-in',
      plans: 'Planes',
      chat: 'Chat',
      logout: 'Salir',
      profile: 'Mi Perfil'
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      back: 'Volver'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    ns: ['navigation', 'common'],
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
