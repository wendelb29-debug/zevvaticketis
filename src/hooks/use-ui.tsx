import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export { type SupportedLocale, type ThemePreference } from "@/lib/i18n/types";
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
  logout: () => Promise<void>;
  
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
      logout: async () => {
        set({ 
          userId: null,
          language: getBrowserLocale(),
          theme: 'system',
          fontSize: 100,
          timezone: null
        });
        get().updateResolvedTheme();
      },

      // Preference Actions
      setLanguage: async (lang) => {
        const normalizedLang = normalizeLocale(lang);
        set({ language: normalizedLang, isSaving: true });
        const { userId, deviceId } = get();
        
        try {
          if (userId) {
            const { error } = await supabase.from('user_device_preferences').upsert({
              user_id: userId,
              device_id: deviceId,
              language: normalizedLang,
              theme: get().theme,
              font_size: get().fontSize
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Failed to save language preference:", error);
        } finally {
          set({ isSaving: false, activeOverlay: null });
        }
      },

      setTheme: async (theme) => {
        const validThemes: ThemePreference[] = ['light', 'dark', 'system'];
        const validatedTheme = validThemes.includes(theme) ? theme : 'system';
        
        set({ theme: validatedTheme, isSaving: true });
        get().updateResolvedTheme();
        const { userId, deviceId } = get();
        
        try {
          if (userId) {
            const { error } = await supabase.from('user_device_preferences').upsert({
              user_id: userId,
              device_id: deviceId,
              language: get().language,
              theme: validatedTheme,
              font_size: get().fontSize
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Failed to save theme preference:", error);
        } finally {
          set({ isSaving: false });
        }
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
        if (!userId) {
          set({ 
            userId: null,
            language: getBrowserLocale(),
            theme: 'system',
            fontSize: 100,
            timezone: null
          });
          get().updateResolvedTheme();
          return;
        }

        const deviceId = get().deviceId;
        set({ userId });
        
        try {
          const { data: devicePrefs } = await supabase
            .from('user_device_preferences')
            .select('*')
            .eq('user_id', userId)
            .eq('device_id', deviceId)
            .maybeSingle();

          if (devicePrefs) {
            set({
              language: normalizeLocale(devicePrefs.language),
              theme: devicePrefs.theme as ThemePreference,
              fontSize: devicePrefs.font_size,
              timezone: devicePrefs.timezone
            });
          } else {
            const { data: accountPrefs } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();

            if (accountPrefs) {
              set({
                language: normalizeLocale(accountPrefs.default_language),
                theme: accountPrefs.default_theme as ThemePreference,
                fontSize: accountPrefs.default_font_size,
                timezone: accountPrefs.timezone
              });
            }
          }
        } catch (error) {
          console.error("Sync error:", error);
        } finally {
          get().updateResolvedTheme();
        }
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
          if (state.language) {
            state.language = normalizeLocale(state.language);
          }
          state.initialize();
          
          if (typeof window !== 'undefined') {
            const channel = new BroadcastChannel('zevva-ui-preferences');
            channel.onmessage = (event) => {
              const { userId: remoteUserId, language, theme, fontSize } = event.data;
              if (remoteUserId === state.userId) {
                const normalized = normalizeLocale(language);
                if (state.language !== normalized || state.theme !== theme || state.fontSize !== fontSize) {
                  useUI.setState({ 
                    language: normalized, 
                    theme: theme as ThemePreference, 
                    fontSize 
                  });
                  state.updateResolvedTheme();
                }
              }
            };
            
            const originalSetLanguage = state.setLanguage;
            state.setLanguage = async (l) => {
              await originalSetLanguage(l);
              channel.postMessage({ userId: state.userId, language: normalizeLocale(l), theme: state.theme, fontSize: state.fontSize });
            };
            
            const originalSetTheme = state.setTheme;
            state.setTheme = async (t) => {
              await originalSetTheme(t);
              channel.postMessage({ userId: state.userId, language: state.language, theme: t, fontSize: state.fontSize });
            };

            const originalSetFontSize = state.setFontSize;
            state.setFontSize = async (s) => {
              await originalSetFontSize(s);
              channel.postMessage({ userId: state.userId, language: state.language, theme: state.theme, fontSize: s });
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