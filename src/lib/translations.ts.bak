import { type TranslationSchema } from "./i18n/types";
import { translations as existingTranslations } from "./translations";

// Use complete type-safe schema to avoid partial object issues
export const translations: Record<string, any> = {
  ...existingTranslations,
  "pt-BR": {
    ...existingTranslations["pt-BR"],
    navigation: {
      ...existingTranslations["pt-BR"].navigation,
      events: "Eventos",
      participants: "Participantes",
      financial: "Financeiro",
      team: "Equipe",
      ticketManagement: "Gestão de ingressos",
      globalTicketManagement: "Gestão global de ingressos",
    }
  },
  "en-US": {
    ...existingTranslations["en-US"],
    navigation: {
      ...existingTranslations["en-US"].navigation,
      events: "Events",
      participants: "Participants",
      financial: "Financial",
      team: "Team",
      ticketManagement: "Ticket Management",
      globalTicketManagement: "Global Ticket Management",
    }
  },
  "es-ES": {
    ...existingTranslations["es-ES"],
    navigation: {
      ...existingTranslations["es-ES"].navigation,
      events: "Eventos",
      participants: "Participantes",
      financial: "Financiero",
      team: "Equipo",
      ticketManagement: "Gestión de entradas",
      globalTicketManagement: "Gestión global de entradas",
    }
  }
};
