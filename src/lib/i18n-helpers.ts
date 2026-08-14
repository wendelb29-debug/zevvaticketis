import { type SupportedLocale } from "@/lib/i18n/types";

export const formatCurrency = (amount: number, currency: string = 'BRL', locale: SupportedLocale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, locale: SupportedLocale = 'pt-BR', options?: Intl.DateTimeFormatOptions) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options || {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

export const formatNumber = (num: number, locale: SupportedLocale = 'pt-BR') => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatDateTime = (date: Date | string, locale: SupportedLocale = 'pt-BR') => {
  return formatDate(date, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
