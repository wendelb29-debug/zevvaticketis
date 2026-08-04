import { 
  Mic2, 
  Music, 
  TreePine, 
  Leaf, 
  Globe2, 
  Plane, 
  BookOpen, 
  Award, 
  Baby, 
  Palette,
  LayoutDashboard
} from "lucide-react";
import React from "react";

export type CategoryType = 
  | "CONFERÊNCIAS" 
  | "SHOWS GOSPEL" 
  | "RETIROS" 
  | "CARAVANAS INTERNACIONAIS" 
  | "CURSOS E WORKSHOPS" 
  | "INFANTIL";

export interface CategoryTheme {
  name: string;
  accentColor: string;
  secondaryColor?: string;
  icon: React.ElementType;
  fontFamily?: string;
  animationSpeed: string; // Tailwind duration
  paddingBoost?: string; // Tailwind extra padding
  customClass?: string;
  heroPattern?: string;
  buttonRadius?: string;
  cardAnimation?: string;
}

export const CATEGORY_THEMES: Record<CategoryType, CategoryTheme> = {
  "CONFERÊNCIAS": {
    name: "Conferências",
    accentColor: "#C99A3E", // Gold
    icon: LayoutDashboard,
    animationSpeed: "duration-200",
  },
  "SHOWS GOSPEL": {
    name: "Shows Gospel",
    accentColor: "#E85D4C", // Warm Coral
    icon: Mic2,
    animationSpeed: "duration-300",
    customClass: "animate-pulse-subtle shadow-[0_0_15px_rgba(232,93,76,0.3)]",
    cardAnimation: "hover:shadow-[0_0_25px_rgba(232,93,76,0.5)] transition-shadow duration-1000",
  },
  "RETIROS": {
    name: "Retiros",
    accentColor: "#7A9B76", // Olive Green
    icon: TreePine,
    animationSpeed: "duration-500",
    paddingBoost: "p-8 sm:p-10",
    customClass: "transition-all ease-in-out duration-500",
  },
  "CARAVANAS INTERNACIONAIS": {
    name: "Caravanas Internacionais",
    accentColor: "#2C6E7F", // Petrol Blue
    icon: Globe2,
    animationSpeed: "duration-300",
    heroPattern: "bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-fixed opacity-10",
  },
  "CURSOS E WORKSHOPS": {
    name: "Cursos e Workshops",
    accentColor: "#4A5FC1", // Indigo
    icon: BookOpen,
    animationSpeed: "duration-200",
    customClass: "grid-cols-1 md:grid-cols-3 gap-2 text-sm", // Denser layout idea
  },
  "INFANTIL": {
    name: "Infantil",
    accentColor: "#FFC845", // Yellow
    secondaryColor: "#FF6FA5", // Pink
    icon: Baby,
    fontFamily: "font-fredoka",
    animationSpeed: "duration-300",
    buttonRadius: "rounded-[24px]",
    customClass: "hover:scale-105 transition-transform duration-300 ease-spring",
  }
};

export const getThemeByCategory = (category?: string): CategoryTheme => {
  const normalizedCategory = (category?.toUpperCase() || "CONFERÊNCIAS") as CategoryType;
  return CATEGORY_THEMES[normalizedCategory] || CATEGORY_THEMES["CONFERÊNCIAS"];
};
