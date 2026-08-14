export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES';
export type ThemePreference = 'light' | 'dark' | 'system';
export type TranslationSchema = {
  nav: Record<string, string>;
  navigation: Record<string, string>;
  home: Record<string, string>;
  footer: Record<string, string>;
  common: Record<string, string>;
};
