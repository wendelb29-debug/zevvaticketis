import { useState, useEffect } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { MapPin, Search, Ticket, Globe, Menu } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { useUI } from "@/hooks/use-ui";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo-zevva.png.asset.json";
import { translations } from "@/lib/translations";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  selectedCity?: string | null;
}

export function Navbar({ selectedCity }: { selectedCity?: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { openOverlay, activeOverlay, language, setLanguage } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-surface-base/80 backdrop-blur-xl border-b border-border",
        isScrolled ? "h-16" : "h-20"
      )}
    >
      <div className={cn("max-w-7xl mx-auto px-6 h-full flex items-center justify-between", language === 'ar' ? "text-right" : "text-left")}>
        {/* Row 1: Logo & Nav Links */}
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain grayscale brightness-50 contrast-125 group-hover:grayscale-0 group-hover:brightness-100" />
            </div>
            <span className="text-lg font-serif italic text-foreground tracking-tight">
              Zevva <span className="not-italic font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-accent ml-1">Tickets</span>
            </span>
          </Link>

          {/* Main Navigation (Visible when not scrolled or in simpler desktop layout) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/eventos" search={{ id: undefined, categoria: undefined }} className="text-[10px] font-bold text-foreground-muted hover:text-primary uppercase tracking-[0.15em] transition-colors">
              Explorar
            </Link>
            <Link to="/eventos" search={{ id: undefined, categoria: 'CARAVANAS INTERNACIONAIS' }} className="text-[10px] font-bold text-foreground-muted hover:text-primary uppercase tracking-[0.15em] transition-colors">
              Caravanas
            </Link>
            <Link to="/eventos" search={{ id: undefined, categoria: 'CURSOS E IMERSÕES' }} className="text-[10px] font-bold text-foreground-muted hover:text-primary uppercase tracking-[0.15em] transition-colors">
              Cursos
            </Link>
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-6">
          {isScrolled && (
            <div className="hidden md:flex items-center animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="relative w-64">
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full bg-background h-10 pl-10 pr-4 rounded-sm text-xs border border-border focus:border-border-strong outline-none text-foreground font-medium transition-all"
                />
                <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-foreground-muted" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Link 
              to={user ? "/criar-evento" : "/cadastro"} 
              onClick={(e) => { if (!user) { e.preventDefault(); openOverlay('auth', 'register'); } }}
              className="hidden sm:flex h-10 px-5 items-center justify-center border border-border text-[10px] font-bold text-foreground uppercase tracking-widest hover:bg-background transition-all rounded-sm"
            >
              Organizar Evento
            </Link>
            
            <button 
              onClick={() => openOverlay('language')}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-border bg-transparent hover:bg-background transition-colors cursor-pointer group relative language-dropdown-container"
            >
              <Globe className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
              {activeOverlay === 'language' && (
                <div className="absolute top-full right-0 mt-4 w-48 bg-surface-elevated border border-border rounded-lg shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-300">
                  {[
                    { id: 'pt', label: 'Português' },
                    { id: 'en', label: 'English' },
                    { id: 'es', label: 'Español' },
                  ].map((lang) => (
                    <button 
                      key={lang.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.id as any);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-xs font-bold transition-all",
                        language === lang.id ? "bg-primary/5 text-primary" : "text-foreground-muted hover:bg-background"
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
              onOpenAuth={() => openOverlay('auth', 'login')}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
