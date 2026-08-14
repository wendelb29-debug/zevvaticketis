import { translations } from "../translations";
import { normalizeLocale, DEFAULT_LOCALE } from "./locales";
import { type TranslationSchema } from "./types";

/**
 * Padrão canônico para acesso a traduções.
 * Garante que nunca retorne undefined e sempre forneça o schema completo via fallback.
 */
export function getTranslations(lang: unknown): TranslationSchema {
  const locale = normalizeLocale(lang);
  
  const selected = (translations as any)[locale];
  const fallback = translations[DEFAULT_LOCALE];

  if (!fallback) {
    throw new Error("Catálogo obrigatório pt-BR não foi carregado em translations.ts");
  }

  // Se o idioma selecionado não existe (por erro no normalize ou no schema), usa o fallback
  if (!selected) return fallback as any;

  return selected as any;
}
