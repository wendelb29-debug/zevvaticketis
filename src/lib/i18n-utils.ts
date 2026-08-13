import { translations, type TranslationKeys } from "./translations";
import { normalizeLocale, DEFAULT_LOCALE, type SupportedLocale } from "@/hooks/use-ui";

/**
 * Padrão canônico para acesso a traduções.
 * Evita erros de 'undefined' ao tentar acessar idiomas inexistentes ou mal formatados.
 */
export function getTranslations(lang: string | null | undefined) {
  const locale = normalizeLocale(lang);
  
  // console.debug({
  //   requested: lang,
  //   resolved: locale,
  //   available: Object.keys(translations)
  // });

  return (translations[locale] || translations[DEFAULT_LOCALE]) as any;
}

/**
 * Verifica se um idioma possui traduções mínimas carregadas.
 */
export function hasLanguageSomeTranslations(locale: string | null | undefined): boolean {
  const normalized = normalizeLocale(locale);
  return Boolean(translations[normalized as SupportedLocale]);
}
