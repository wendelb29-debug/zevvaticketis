export const CATEGORIES = [
  {
    id: "CONFERENCIAS",
    slug: "conferencias",
    name: "Conferências",
    description: "Grandes encontros e congressos",
    icon: "Users",
    order: 1,
  },
  {
    id: "SHOWS_GOSPEL",
    slug: "shows-gospel",
    name: "Shows Gospel",
    description: "Eventos musicais e adoração",
    icon: "Music",
    order: 2,
  },
  {
    id: "RETIROS",
    slug: "retiros",
    name: "Retiros",
    description: "Momentos de pausa e reflexão",
    icon: "Trees",
    order: 3,
  },
  {
    id: "CARAVANAS",
    slug: "caravanas",
    name: "Caravanas",
    description: "Viagens e experiências internacionais",
    icon: "Plane",
    order: 4,
  },
  {
    id: "CURSOS",
    slug: "cursos",
    name: "Cursos e Workshops",
    description: "Aprenda e desenvolva novas habilidades",
    icon: "BookOpen",
    order: 5,
  },
  {
    id: "INFANTIL",
    slug: "infantil",
    name: "Infantil",
    description: "Diversão garantida para as crianças",
    icon: "Baby",
    order: 6,
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function normalizeCategory(value: string | null | undefined): CategoryId | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();

  const mapping: Record<string, CategoryId> = {
    "CONFERÊNCIAS": "CONFERENCIAS",
    "CONFERENCIAS": "CONFERENCIAS",
    "SHOWS GOSPEL": "SHOWS_GOSPEL",
    "SHOWS_GOSPEL": "SHOWS_GOSPEL",
    "RETIRO": "RETIROS",
    "RETIROS": "RETIROS",
    "CARAVANAS": "CARAVANAS",
    "CARAVANAS INTERNACIONAIS": "CARAVANAS",
    "CURSOS E WORKSHOPS": "CURSOS",
    "CURSOS": "CURSOS",
    "CURSOS E IMERSÕES": "CURSOS",
    "INFANTIL": "INFANTIL",
  };

  return mapping[normalized] || null;
}
