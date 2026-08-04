import { create } from 'zustand';

type OverlayType = 'auth' | 'location' | 'account' | null;

interface UIStore {
  activeOverlay: OverlayType;
  authView: 'login' | 'register';
  openOverlay: (type: OverlayType, view?: 'login' | 'register') => void;
  closeOverlay: () => void;
}

export const useUI = create<UIStore>((set) => ({
  activeOverlay: null,
  authView: 'login',
  openOverlay: (type, view = 'login') => set({ activeOverlay: type, authView: view }),
  closeOverlay: () => set({ activeOverlay: null }),
}));
