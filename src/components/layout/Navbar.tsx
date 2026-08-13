import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { MapPin, Search, Ticket, Globe, Menu } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { useUI } from "@/hooks/use-ui";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo-zevva.png.asset.json";
import { translations } from "@/lib/translations";
import { getTranslations } from "@/lib/i18n-utils";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  selectedCity?: string | null;
}

export function Navbar({ selectedCity }: { selectedCity?: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { openOverlay, activeOverlay, language, setLanguage, isHomeSearchVisible, homeSearchTerm, setHomeSearchTerm } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-card/95 backdrop-blur-md border-b border-border",
        isScrolled ? "h-16 shadow-md" : "h-20",
      )}
      data-scrolled={isScrolled}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-manrope font-extrabold text-foreground tracking-tight">
              ZEVVA<span className="text-primary ml-0.5">.</span>
            </span>
          </Link>

          {/* Main Navigation (Visible when not scrolled or in simpler desktop layout) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/eventos"
              search={
                {
                  busca: undefined,
                  categoria: undefined,
                  cidade: undefined,
                  data: undefined,
                } as any
              }
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {getTranslations(language).nav.explore}
            </Link>
            <Link
              to="/eventos/categoria/$slug"
              params={{ slug: "caravanas" }}
              search={{ busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {getTranslations(language).nav.caravans}
            </Link>
            <Link
              to="/cursos"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {getTranslations(language).nav.courses}
            </Link>
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-6">
          {(!isHomeSearchVisible || location.pathname !== "/") && isScrolled && (
            <div className="hidden md:flex items-center animate-in fade-in slide-in-from-right-1.5 duration-200">
              <div className="relative w-64">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={getTranslations(language).nav.searchPlaceholder}
                  value={homeSearchTerm}
                  onChange={(e) => setHomeSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate({
                        to: "/eventos",
                        search: {
                          busca: homeSearchTerm,
                          categoria: undefined,
                          cidade: undefined,
                          data: undefined,
                        } as any,
                      });
                    }
                  }}
                  className="w-full bg-background h-10 pl-10 pr-4 rounded-sm text-xs border border-border focus:border-border-strong outline-none text-foreground font-medium transition-all"
                />
                <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Link
              to={user ? "/criar-evento" : "/cadastro"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openOverlay("auth", "register");
                }
              }}
              className="hidden sm:flex h-11 px-6 items-center justify-center bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover transition-all rounded-md shadow-lg shadow-primary/10"
            >
              {getTranslations(language).nav.createEvent}
            </Link>

            <button
              onClick={() => openOverlay("language")}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-border bg-transparent hover:bg-background transition-colors cursor-pointer group relative language-dropdown-container"
            >
              <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              {activeOverlay === "language" && (
                <div className="absolute top-full right-0 mt-4 w-48 bg-popover border border-border rounded-lg shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-300">
                  {[
                    { id: "pt-BR", label: "Português" },
                    { id: "en-US", label: "English" },
                    { id: "es-ES", label: "Español" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.id as any);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-xs font-bold transition-all",
                        language === lang.id || (language.split('-')[0] === lang.id.split('-')[0])
                          ? "bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-background",
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </button>

            <AccountMenu
              user={user}
              onLogout={() => supabase.auth.signOut()}
              onNavigate={(path) => navigate({ to: path as any })}
              onOpenAuth={() => openOverlay("auth", "login")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
