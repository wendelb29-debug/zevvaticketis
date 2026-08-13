import { type SupportedLocale, type ThemePreference } from "@/hooks/use-ui";

export const translations = {
  "pt-BR": {
    home: {
      featuredLabel: "Destaque",
      ensureSpot: "Garantir Vaga",
      from: "A partir de",
      free: "Gratuito",
      toDefine: "A definir",
      checkTickets: "Consulte os ingressos"
    }
  },
  "en-US": {
    home: {
      featuredLabel: "Featured",
      ensureSpot: "Book Now",
      from: "From",
      free: "Free",
      toDefine: "To be defined",
      checkTickets: "Check tickets"
    }
  },
  "es-ES": {
    home: {
      featuredLabel: "Destacado",
      ensureSpot: "Reservar Ahora",
      from: "Desde",
      free: "Gratis",
      toDefine: "A definir",
      checkTickets: "Consultar entradas"
    }
  }
} as const;

export type TranslationKeys = typeof translations;
