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
  openOverlay: (type: OverlayType, view?: 'login' | 'register') => void;
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
      theme: 'system',
      fontSize: 100,
      openOverlay: (type, view = 'login') => {
        set({ activeOverlay: type, authView: view });
      },
      closeOverlay: () => set({ activeOverlay: null }),
      setLanguage: (lang) => set({ language: lang, activeOverlay: null }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: 'zevva-ui-storage',
      partialize: (state) => ({ language: state.language, theme: state.theme, fontSize: state.fontSize }),
    }
  )
);
