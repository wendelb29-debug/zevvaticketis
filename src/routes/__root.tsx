import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AuthModal } from "@/components/layout/AuthModal";
import { useUI } from "@/hooks/use-ui";
import { LocationModal } from "@/components/home/LocationModal";
import { ZevvaLoadingScreen } from "@/components/layout/ZevvaLoadingScreen";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { TenantProvider } from "@/hooks/use-tenants";
import { supabase } from "@/integrations/supabase/client";
import { i18nInstance, i18nReady } from "@/i18n/config";
import { normalizeLocale } from "@/lib/i18n/locales";




import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7F8] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-black text-[#17191C]">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-[#17191C]">Página não encontrada</h2>
        <p className="mt-4 text-base text-[#62666D]">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[#D94B52] px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-[#BE3941] shadow-lg shadow-[#D94B52]/10"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zevva | Experiências Internacionais e Ingressos Digitais" },
      { name: "description", content: "Plataforma premium para caravanas, eventos internacionais e ingressos digitais 3D. Estética editorial e tecnologia de ponta." },
      { property: "og:title", content: "Zevva | Experiências Internacionais" },
      { property: "og:description", content: "Redefinindo o acesso a experiências globais com design premium e segurança 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { language: rawLanguage, theme, resolvedTheme } = useUI();
  // Safe normalization
  const language = normalizeLocale(rawLanguage);

  useEffect(() => {
    let active = true;
    
    async function applyLanguage() {
      await i18nReady;
      if (!active) return;

      const locale = normalizeLocale(language);
      if (i18nInstance.language !== locale) {
        await i18nInstance.changeLanguage(locale);
      }
      document.documentElement.lang = locale;
    }

    applyLanguage().catch(err => {
      console.error("Failed to apply language", err);
      document.documentElement.lang = 'pt-BR';
    });

    return () => { active = false; };
  }, [language]);

  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storage = localStorage.getItem('zevva-ui-storage');
                  let theme = 'light';
                  let language = 'pt-BR';
                  if (storage) {
                    const parsed = JSON.parse(storage);
                    theme = parsed.state.theme || 'light';
                    let rawLang = parsed.state.language || 'pt-BR';
                    const aliases = {
                      'pt': 'pt-BR', 'pt-br': 'pt-BR', 'português': 'pt-BR', 'portugues': 'pt-BR',
                      'en': 'en-US', 'en-us': 'en-US', 'english': 'en-US',
                      'es': 'es-ES', 'es-es': 'es-ES', 'español': 'es-ES', 'espanol': 'es-ES'
                    };
                    language = aliases[rawLang.toLowerCase()] || (['pt-BR', 'en-US', 'es-ES'].includes(rawLang) ? rawLang : 'pt-BR');
                  }
                  
                  let resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  document.documentElement.classList.add(resolvedTheme);
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                  document.documentElement.style.colorScheme = resolvedTheme;
                  document.documentElement.lang = language;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={resolvedTheme}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { activeOverlay, authView, closeOverlay, language: rawLanguage, theme, fontSize, userId: storeUserId, logout: uiLogout } = useUI() as any;
  const language = normalizeLocale(rawLanguage);
  const router = useRouter();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        useUI.getState().syncWithBackend(session.user.id);
      } else if (storeUserId) {
        useUI.getState().syncWithBackend(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAppRoute = location.pathname.startsWith('/app');
    const isCheckinRoute = location.pathname.startsWith('/checkin');
    const isPrivateArea = isAdminRoute || isAppRoute || isCheckinRoute;
    const isUserLoggedIn = !!session;

    const applyTheme = () => {
      let effectiveTheme = theme;
      
      if (!isPrivateArea && !isUserLoggedIn) {
        effectiveTheme = 'light';
      } else if (!isPrivateArea && isUserLoggedIn) {
        if (location.pathname === '/' || location.pathname === '/eventos') {
           effectiveTheme = 'light';
        }
      }

      const resolvedTheme =
        effectiveTheme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : effectiveTheme;

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.setAttribute('data-theme', resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (theme === "system") {
      media.addEventListener("change", applyTheme);
      return () => {
        media.removeEventListener("change", applyTheme);
      };
    }
    
    return undefined;
  }, [theme, location.pathname, session]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${(fontSize / 100) * 16}px`;
  }, [fontSize]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (activeOverlay === 'language') {
        const target = event.target as HTMLElement;
        const isClickInsideLanguageDropdown = target.closest('.language-dropdown-container');
        if (!isClickInsideLanguageDropdown) {
          closeOverlay();
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeOverlay, closeOverlay]);

  useEffect(() => {
    return router.subscribe('onBeforeNavigate', () => setIsNavigating(true));
  }, [router]);

  useEffect(() => {
    return router.subscribe('onLoad', () => setIsNavigating(false));
  }, [router]);


  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-primary/20 overflow-hidden">
            <div className="h-full bg-primary w-1/2 animate-progress" />
          </div>
        )}
        <Outlet />
        
        {isNavigating && <ZevvaLoadingScreen />}
        
        <AuthModal 
          isOpen={activeOverlay === 'auth'} 
          onClose={closeOverlay} 
          defaultView={authView}
        />
        
        <AccountMenu
          user={session?.user}
          onLogout={async () => {
            await supabase.auth.signOut();
            await uiLogout();
          }}
          onNavigate={(path: string) => router.navigate({ to: path as any })}
          onOpenAuth={() => useUI.getState().openOverlay("auth", "login")}
        />

        <LocationModal 
          isOpen={activeOverlay === 'location'}
          onClose={closeOverlay}
          onSelect={(city) => {
            console.log("Selected city:", city);
            closeOverlay();
          }}
        />
      </TenantProvider>
    </QueryClientProvider>
  );
}
