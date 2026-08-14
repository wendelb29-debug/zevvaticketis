import { type SupportedLocale } from "./types";

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export function normalizeLocale(value: unknown): SupportedLocale {
  if (typeof value !== 'string') return DEFAULT_LOCALE;
  
  const normalized = value.trim().toLowerCase();
  
  const aliases: Record<string, SupportedLocale> = {
    'pt': 'pt-BR',
    'pt-br': 'pt-BR',
    'português': 'pt-BR',
    'portugues': 'pt-BR',
    'en': 'en-US',
    'en-us': 'en-US',
    'english': 'en-US',
    'es': 'es-ES',
    'es-es': 'es-ES',
    'español': 'es-ES',
    'espanol': 'es-ES',
  };

  if (aliases[normalized]) return aliases[normalized];
  if (['pt-BR', 'en-US', 'es-ES'].includes(value as string)) return value as SupportedLocale;
  
  return DEFAULT_LOCALE;
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return ['pt-BR', 'en-US', 'es-ES'].includes(value as string);
}
