import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { AuthModal } from "@/components/layout/AuthModal";
import { useUI } from "@/hooks/use-ui";
import { LocationModal } from "@/components/home/LocationModal";
import { ZevvaLoadingScreen } from "@/components/layout/ZevvaLoadingScreen";
import { TenantProvider } from "@/hooks/use-tenants";




import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
  const { language, activeOverlay, closeOverlay } = useUI();

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

  return (
    <html lang={language}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { activeOverlay, authView, closeOverlay, language, theme, fontSize } = useUI();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${(fontSize / 100) * 16}px`;
  }, [fontSize]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if the click was outside any active dropdown/overlay logic
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
          <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-coral/20 overflow-hidden">
            <div className="h-full bg-coral w-1/2 animate-progress" />
          </div>
        )}
        <Outlet />
        
        {isNavigating && <ZevvaLoadingScreen />}
        
        <AuthModal 
          isOpen={activeOverlay === 'auth'} 
          onClose={closeOverlay} 
          defaultView={authView}
        />
        
        <LocationModal 
          isOpen={activeOverlay === 'location'}
          onClose={closeOverlay}
          onSelect={(city) => {
            // In a real app we'd dispatch this to a global state or search params
            console.log("Selected city:", city);
            closeOverlay();
          }}
        />
      </TenantProvider>
    </QueryClientProvider>
  );
}
