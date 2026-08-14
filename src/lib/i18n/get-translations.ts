import { translations } from "../translations";
import { normalizeLocale, DEFAULT_LOCALE } from "./locales";
import { type TranslationSchema } from "./types";

/**
 * Padrão canônico para acesso a traduções.
 * Garante que nunca retorne undefined e sempre forneça o schema completo via fallback.
 */
export function getTranslations(lang: unknown): TranslationSchema {
  const locale = normalizeLocale(lang);
  
  const selectedTranslations = translations[locale];
  
  if (!selectedTranslations) {
    console.warn(`Translation for ${locale} not found, falling back to ${DEFAULT_LOCALE}`);
    return translations[DEFAULT_LOCALE];
  }

  return selectedTranslations;
}
