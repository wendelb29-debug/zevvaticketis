import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'pt' | 'en' | 'es' | 'ja' | 'zh' | 'ar';
export type Theme = 'light' | 'dark' | 'system';

type OverlayType = 'auth' | 'location' | 'account' | 'language' | null;

interface UIStore {
  activeOverlay: OverlayType;
  authView: 'login' | 'register';
  language: Language;
  theme: Theme;
  fontSize: number;
  isHomeSearchVisible: boolean;
  homeSearchTerm: string;
  openOverlay: (type: OverlayType, view?: 'login' | 'register') => void;
  closeOverlay: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setIsHomeSearchVisible: (visible: boolean) => void;
  setHomeSearchTerm: (term: string) => void;
  closeOverlay: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
}

export const useUI = create<UIStore>()(
  persist(
    (set) => ({
      activeOverlay: null,
      authView: 'login',
      language: 'pt',
      theme: 'light',
      fontSize: 100,
      isHomeSearchVisible: true,
      homeSearchTerm: '',
      openOverlay: (type, view = 'login') => {
        set({ activeOverlay: type, authView: view });
      },
      closeOverlay: () => set({ activeOverlay: null }),
      setLanguage: (lang) => set({ language: lang, activeOverlay: null }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setIsHomeSearchVisible: (visible) => set({ isHomeSearchVisible: visible }),
      setHomeSearchTerm: (term) => set({ homeSearchTerm: term }),
    }),
    {
      name: 'zevva-ui-storage',
      partialize: (state) => ({ language: state.language, theme: state.theme, fontSize: state.fontSize }),
    }
  )
);
