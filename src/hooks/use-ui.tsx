import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'pt' | 'en' | 'es' | 'ja' | 'zh' | 'ar';

type OverlayType = 'auth' | 'location' | 'account' | 'language' | null;

interface UIStore {
  activeOverlay: OverlayType;
  authView: 'login' | 'register';
  language: Language;
  openOverlay: (type: OverlayType, view?: 'login' | 'register') => void;
  closeOverlay: () => void;
  setLanguage: (lang: Language) => void;
}

export const useUI = create<UIStore>()(
  persist(
    (set) => ({
      activeOverlay: null,
      authView: 'login',
      language: 'pt',
      openOverlay: (type, view = 'login') => {
        set({ activeOverlay: type, authView: view });
      },
      closeOverlay: () => set({ activeOverlay: null }),
      setLanguage: (lang) => set({ language: lang, activeOverlay: null }),
    }),
    {
      name: 'zevva-ui-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
