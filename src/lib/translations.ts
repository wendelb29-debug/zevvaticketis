import { type TranslationSchema } from "./i18n/types";
import { translations as existingTranslations } from "./translations";

// We'll update the existing object by extending it
export const translations: Record<string, any> = {
  ...existingTranslations,
  "pt-BR": {
    ...existingTranslations["pt-BR"],
    navigation: {
      ...existingTranslations["pt-BR"].navigation,
      ticketManagement: "Gestão de ingressos",
      globalTicketManagement: "Gestão global de ingressos",
    }
  },
  "en-US": {
    ...existingTranslations["en-US"],
    navigation: {
      ...existingTranslations["en-US"].navigation,
      ticketManagement: "Ticket Management",
      globalTicketManagement: "Global Ticket Management",
    }
  },
  "es-ES": {
    ...existingTranslations["es-ES"],
    navigation: {
      ...existingTranslations["es-ES"].navigation,
      ticketManagement: "Gestión de entradas",
      globalTicketManagement: "Gestión global de entradas",
    }
  }
};
