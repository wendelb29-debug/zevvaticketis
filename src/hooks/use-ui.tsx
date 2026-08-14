import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

import { type SupportedLocale, type ThemePreference } from "@/lib/i18n/types";


export interface UIPreferences {
  language: SupportedLocale;
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  fontSize: number;
  timezone: string | null;
  isHydrated: boolean;
  isSaving: boolean;
}

type OverlayType = 'auth' | 'location' | 'account' | 'language' | null;

interface UIStore extends UIPreferences {
  activeOverlay: OverlayType;
  authView: 'login' | 'register';
  isHomeSearchVisible: boolean;
  homeSearchTerm: string;
  deviceId: string;
  userId: string | null;

  // Actions
  openOverlay: (type: OverlayType, view?: 'login' | 'register') => void;
  closeOverlay: () => void;
  setLanguage: (lang: SupportedLocale) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setFontSize: (size: number) => Promise<void>;
  setIsHomeSearchVisible: (visible: boolean) => void;
  setHomeSearchTerm: (term: string) => void;
  
  // Internal/Sync Actions
  initialize: () => Promise<void>;
  syncWithBackend: (userId: string | null) => Promise<void>;
  updateResolvedTheme: () => void;
}

import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
export { DEFAULT_LOCALE, normalizeLocale };


const getBrowserLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return normalizeLocale(navigator.language);
};

const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('zevva-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('zevva-device-id', id);
  }
  return id;
};

export const useUI = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      language: DEFAULT_LOCALE,
      theme: 'system',
      resolvedTheme: 'light',
      fontSize: 100,
      timezone: null,
      isHydrated: false,
      isSaving: false,
      activeOverlay: null,
      authView: 'login',
      isHomeSearchVisible: true,
      homeSearchTerm: '',
      deviceId: getDeviceId(),
      userId: null,

      // UI Actions
      openOverlay: (type, view = 'login') => set({ activeOverlay: type, authView: view }),
      closeOverlay: () => set({ activeOverlay: null }),
      setIsHomeSearchVisible: (visible) => set({ isHomeSearchVisible: visible }),
      setHomeSearchTerm: (term) => set({ homeSearchTerm: term }),

      // Preference Actions
      setLanguage: async (lang) => {
        const normalizedLang = normalizeLocale(lang);
        set({ language: normalizedLang, isSaving: true });
        const { userId, deviceId } = get();
        if (userId) {
          await supabase.from('user_device_preferences').upsert({
            user_id: userId,
            device_id: deviceId,
            language: lang,
            theme: get().theme,
            font_size: get().fontSize
          });
        }
        set({ isSaving: false, activeOverlay: null });
      },

      setTheme: async (theme) => {
        set({ theme, isSaving: true });
        get().updateResolvedTheme();
        const { userId, deviceId } = get();
        if (userId) {
          await supabase.from('user_device_preferences').upsert({
            user_id: userId,
            device_id: deviceId,
            language: get().language,
            theme: theme,
            font_size: get().fontSize
          });
        }
        set({ isSaving: false });
      },

      setFontSize: async (size) => {
        const clampedSize = Math.min(Math.max(size, 80), 130);
        set({ fontSize: clampedSize, isSaving: true });
        const { userId, deviceId } = get();
        if (userId) {
          await supabase.from('user_device_preferences').upsert({
            user_id: userId,
            device_id: deviceId,
            language: get().language,
            theme: get().theme,
            font_size: clampedSize
          });
        }
        set({ isSaving: false });
      },

      updateResolvedTheme: () => {
        const { theme } = get();
        let resolved: 'light' | 'dark' = 'light';
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          resolved = theme as 'light' | 'dark';
        }
        set({ resolvedTheme: resolved });
      },

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        set({ userId, isHydrated: true });
        await get().syncWithBackend(userId);
        get().updateResolvedTheme();
      },

      syncWithBackend: async (userId) => {
        if (!userId) return;
        const deviceId = get().deviceId;
        
        // Try to get device-specific prefs
        const { data: devicePrefs } = await supabase
          .from('user_device_preferences')
          .select('*')
          .eq('user_id', userId)
          .eq('device_id', deviceId)
          .single();


        if (devicePrefs) {
          set({
            language: normalizeLocale(devicePrefs.language),
            theme: devicePrefs.theme as ThemePreference,
            fontSize: devicePrefs.font_size,
            timezone: devicePrefs.timezone
          });
        } else {
          // Fallback to account defaults
          const { data: accountPrefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (accountPrefs) {
            set({
              language: normalizeLocale(accountPrefs.default_language),
              theme: accountPrefs.default_theme as ThemePreference,
              fontSize: accountPrefs.default_font_size,
              timezone: accountPrefs.timezone
            });
          }
        }
        get().updateResolvedTheme();
      }
    }),
    {
      name: 'zevva-ui-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            language: normalizeLocale(persistedState?.language),
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Double check the language is normalized after hydration
          if (state.language) {
            state.language = normalizeLocale(state.language);
          }
          state.initialize();
          // Set up broadcast channel for cross-tab sync
          if (typeof window !== 'undefined') {
            const channel = new BroadcastChannel('zevva-ui-preferences');
            channel.onmessage = (event) => {
              const { userId, language, theme, fontSize } = event.data;
              if (userId === state.userId) {
                state.setLanguage(normalizeLocale(language));
                state.setTheme(theme);
                state.setFontSize(fontSize);
              }
            };
          }
        }
      },
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        fontSize: state.fontSize,
        deviceId: state.deviceId
      })
    }
  )
);
