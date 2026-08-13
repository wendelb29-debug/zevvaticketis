import { type SupportedLocale, type ThemePreference } from "@/hooks/use-ui";

export const translations = {
  "pt-BR": {
    nav: {
      explore: "Explorar",
      caravans: "Caravanas",
      courses: "Cursos",
      plans: "Planos",
      organizer: "Organizador",
      login: "Entrar"
    },
    home: {
      featuredLabel: "Destaque",
      ensureSpot: "Garantir Vaga",
      from: "A partir de",
      free: "Gratuito",
      toDefine: "A definir",
      checkTickets: "Consulte os ingressos",
      heroTitle: "Experiências memoráveis começam aqui",
      heroSubtitle: "A plataforma premium para os melhores eventos, caravanas e cursos internacionais.",
      exploreEvents: "Explorar Eventos",
      createMyEvent: "Criar meu Evento",
      featured: "Próximas experiências"
    },
    footer: {
      about: "Sobre a Zevva",
      aboutText: "A Zevva é a plataforma premium para gestão de eventos, caravanas e cursos internacionais.",
      platform: "Plataforma",
      help: "Ajuda",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Seu melhor e-mail",
      subscribe: "Assinar",
      rights: "Zevva. Todos os direitos reservados."
    }
  },
  "en-US": {
    nav: {
      explore: "Explore",
      caravans: "Caravans",
      courses: "Courses",
      plans: "Plans",
      organizer: "Organizer",
      login: "Login"
    },
    home: {
      featuredLabel: "Featured",
      ensureSpot: "Book Now",
      from: "From",
      free: "Free",
      toDefine: "To be defined",
      checkTickets: "Check tickets",
      heroTitle: "Memorable experiences start here",
      heroSubtitle: "The premium platform for the best international events, caravans, and courses.",
      exploreEvents: "Explore Events",
      createMyEvent: "Create my Event",
      featured: "Upcoming experiences"
    },
    footer: {
      about: "About Zevva",
      aboutText: "Zevva is the premium platform for managing international events, caravans, and courses.",
      platform: "Platform",
      help: "Help",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Your best email",
      subscribe: "Subscribe",
      rights: "Zevva. All rights reserved."
    }
  },
  "es-ES": {
    nav: {
      explore: "Explorar",
      caravans: "Caravanas",
      courses: "Cursos",
      plans: "Planes",
      organizer: "Organizador",
      login: "Acceder"
    },
    home: {
      featuredLabel: "Destacado",
      ensureSpot: "Reservar Ahora",
      from: "Desde",
      free: "Gratis",
      toDefine: "A definir",
      checkTickets: "Consultar entradas",
      heroTitle: "Las experiencias memorables comienzan aquí",
      heroSubtitle: "La plataforma premium para os melhores eventos, caravanas e cursos internacionais.",
      exploreEvents: "Explorar Eventos",
      createMyEvent: "Crear mi Evento",
      featured: "Próximas experiencias"
    },
    footer: {
      about: "Sobre Zevva",
      aboutText: "Zevva es la plataforma premium para la gestión de eventos internacionales, caravanas y cursos.",
      platform: "Plataforma",
      help: "Ayuda",
      newsletter: "Boletín",
      newsletterPlaceholder: "Tu mejor correo",
      subscribe: "Suscribirse",
      rights: "Zevva. Todos los derechos reservados."
    }
  }
} as const;

export type TranslationKeys = typeof translations;
