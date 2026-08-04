import { useState, useEffect } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { MapPin, Search, Ticket } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  selectedCity?: string | null;
}

export function Navbar({ onOpenAuth, onOpenLocation, selectedCity }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
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
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
        {/* Row 1: Logo & Nav Links */}
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-full" : "h-16"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-deep rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-manrope font-extrabold text-2xl">Z</span>
            </div>
            {!isScrolled && (
              <span className="text-xl font-manrope font-extrabold text-gold tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300">
                ZEVVA <span className="text-navy">TICKETS</span>
              </span>
            )}
          </Link>

          {/* Compact Search in Row 1 when scrolled */}
          {isScrolled && (
            <div className="flex-1 max-w-xl mx-8 animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
               <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="O que você procura?" 
                  className="w-full bg-surface h-10 px-10 rounded-full text-xs border border-line focus:ring-1 focus:ring-gold outline-none text-navy font-bold"
                />
                <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted" />
              </div>
              <div 
                onClick={onOpenLocation}
                className="flex items-center gap-2 bg-surface h-10 px-4 rounded-full text-xs font-extrabold cursor-pointer hover:bg-line transition-all border border-line text-navy"
              >
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span className="truncate max-w-[100px]">
                  {selectedCity ? selectedCity.toUpperCase() : "Localização"}
                </span>
              </div>
            </div>
          )}

          {/* Right Links */}
          <div className="flex items-center gap-4">
            <Link 
              to={user ? "/criar-evento" : "/cadastro"} 
              className="hidden md:flex items-center gap-2 text-xs font-extrabold text-navy hover:text-gold transition-colors uppercase tracking-widest"
            >
              Criar evento
            </Link>
            <Link 
              to="/app" 
              className="flex items-center gap-2 text-xs font-extrabold text-navy hover:text-gold transition-colors uppercase tracking-widest"
            >
              <Ticket className="w-4 h-4 text-gold" />
              Meus ingressos
            </Link>
            
            <AccountMenu 
              user={user}
              onLogout={() => supabase.auth.signOut()}
              onNavigate={(path) => navigate({ to: path as any })}
              onOpenAuth={() => navigate({ to: "/login" })}
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
                  placeholder="O que você procura? (ex: Caravanas, Shows, Cursos)" 
                  className="w-full bg-white h-12 px-12 rounded-xl text-sm border-2 border-line focus:ring-2 focus:ring-gold focus:border-gold outline-none text-navy placeholder:text-muted font-bold shadow-sm"
                />
                <Search className="absolute left-4 top-4 w-4 h-4 text-muted" />
              </div>
              
              <div 
                onClick={onOpenLocation}
                className="flex-[1] flex items-center gap-3 bg-white h-12 px-5 rounded-xl text-sm font-extrabold cursor-pointer hover:border-gold/30 transition-all border-2 border-line text-navy shadow-sm"
              >
                <MapPin className="w-4 h-4 text-gold" />
                <span className="flex-1 truncate">
                  {selectedCity ? selectedCity.toUpperCase() : "Cidade ou país"}
                </span>
              </div>

              <button className="h-12 px-8 rounded-xl bg-navy text-white text-xs font-extrabold uppercase tracking-widest hover:bg-navy/90 transition-all active:scale-95 shadow-md">
                Buscar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
