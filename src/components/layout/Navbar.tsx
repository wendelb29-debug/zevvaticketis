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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out bg-white border-b border-line",
        isScrolled ? "h-16 backdrop-blur-md bg-white/90" : "h-36"
      )}
    >
      <div className={cn("max-w-7xl mx-auto px-6 h-full flex flex-col justify-center", language === 'ar' ? "text-right" : "text-left")}>
        {/* Row 1: Logo & Nav Links */}
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-full" : "h-16"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain" />
            </div>
            {!isScrolled && (
              <span className="text-xl font-['Montserrat'] font-medium text-coral tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300">
                ZEVVA <span className="text-navy font-['Montserrat']">TICKETS</span>
              </span>
            )}
          </Link>

          {/* Compact Search in Row 1 when scrolled */}
          {isScrolled && (
            <div className="flex-1 max-w-xl mx-8 animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
               <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder={translations[language].nav.searchPlaceholder} 
                  className="w-full bg-surface h-10 px-10 rounded-full text-xs border border-line focus:ring-1 focus:ring-coral outline-none text-navy font-bold"
                />
                <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted" />
              </div>
              <div 
                onClick={() => openOverlay('location')}
                className="flex items-center gap-2 bg-surface h-10 px-4 rounded-full text-xs font-extrabold cursor-pointer hover:bg-line transition-all border border-line text-navy"
              >
                <MapPin className="w-3.5 h-3.5 text-coral" />
                <span className="truncate max-w-[100px]">
                  {selectedCity ? selectedCity.toUpperCase() : translations[language].nav.location}
                </span>
              </div>
            </div>
          )}

          {/* Right Links */}
          <div className="flex items-center gap-4">
            <Link 
              to={user ? "/criar-evento" : "/cadastro"} 
              onClick={(e) => { if (!user) { e.preventDefault(); openOverlay('auth', 'register'); } }}
              className="hidden md:flex items-center gap-2 text-xs font-extrabold text-navy hover:text-coral transition-colors uppercase tracking-widest"
            >
              {translations[language].nav.createEvent}
            </Link>
            <Link 
              to="/app" 
              className="flex items-center gap-2 text-xs font-extrabold text-navy hover:text-coral transition-colors uppercase tracking-widest"
            >
              <Ticket className="w-4 h-4 text-coral" />
              Meus Ingressos / Projetos
            </Link>
            
            <div 
              onClick={() => openOverlay('language')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-surface hover:bg-line transition-colors cursor-pointer group relative language-dropdown-container"
            >
              <Globe className="w-4 h-4 text-navy group-hover:text-coral transition-colors" />
              {activeOverlay === 'language' && (

                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { id: 'pt', label: '🇧🇷 Português' },
                    { id: 'en', label: '🇺🇸 English' },
                    { id: 'es', label: '🇪🇸 Español' },
                    { id: 'ja', label: '🇯🇵 日本語' },
                    { id: 'zh', label: '🇨🇳 中文' },
                    { id: 'ar', label: '🇸🇦 العربية' }
                  ].map((lang) => (
                    <button 
                      key={lang.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.id as any);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between",
                        language === lang.id ? "bg-coral/10 text-coral" : "text-navy hover:bg-surface"
                      )}
                    >
                      {lang.label}
                      {language === lang.id && <div className="w-1.5 h-1.5 rounded-full bg-coral" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <AccountMenu 
              user={user}
              onLogout={() => supabase.auth.signOut()}
              onNavigate={(path) => navigate({ to: path as any })}
              onOpenAuth={() => openOverlay('auth', 'login')}
            />
          </div>
        </div>

        {/* Row 2: Large Search (Visible when not scrolled) */}
        {!isScrolled && (
          <div className="h-16 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1 flex items-center gap-3">
              <div className="relative flex-[2]">
                <input 
                  type="text" 
                  placeholder={translations[language].nav.searchPlaceholder} 
                  className="w-full bg-white h-12 px-12 rounded-xl text-sm border-2 border-line focus:ring-2 focus:ring-coral focus:border-coral outline-none text-navy placeholder:text-muted font-bold shadow-sm"
                />
                <Search className="absolute left-4 top-4 w-4 h-4 text-muted" />
              </div>
              
              <div 
                onClick={() => openOverlay('location')}
                className="flex-[1] flex items-center gap-3 bg-white h-12 px-5 rounded-xl text-sm font-extrabold cursor-pointer hover:border-coral/30 transition-all border-2 border-line text-navy shadow-sm"
              >
                <MapPin className="w-4 h-4 text-coral" />
                <span className="flex-1 truncate">
                  {selectedCity ? selectedCity.toUpperCase() : translations[language].nav.cityCountry}
                </span>
              </div>

              <button className="h-12 px-8 rounded-xl bg-coral text-white text-xs font-extrabold uppercase tracking-widest hover:bg-coral-dark transition-all active:scale-95 shadow-md">
                {translations[language].nav.search}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
