import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '@/lib/translations';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';

const resources = {
  'pt-BR': { translation: translations['pt-BR'] },
  'en-US': { translation: translations['en-US'] },
  'es-ES': { translation: translations['es-ES'] }
};

export const i18nInstance = i18n.createInstance();

export const i18nReady = i18nInstance
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['pt-BR', 'en-US', 'es-ES'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    }
  });

export default i18nInstance;
