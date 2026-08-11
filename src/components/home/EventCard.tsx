import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Heart, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getThemeByCategory } from "@/lib/categoryThemes";

interface EventCardProps {
  event: any;
  onToggleFavorite?: (id: string) => void;
}

export function EventCard({ event, onToggleFavorite }: EventCardProps) {
  const theme = getThemeByCategory(event.category || "Conferências");
  const Icon = theme.icon;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "A definir";
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="group bg-white rounded-[24px] border border-line overflow-hidden hover:shadow-2xl hover:shadow-navy/5 transition-all duration-500 hover:-translate-y-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={event.cover_image || `https://source.unsplash.com/featured/?${event.category || 'church'}`} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(event.id);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-navy hover:text-error hover:scale-110 transition-all shadow-sm z-10"
        >
          <Heart className="w-5 h-5" />
        </button>

        <div 
          className="absolute bottom-4 left-4 p-2 rounded-xl backdrop-blur-md border border-white/20 text-white flex items-center gap-2"
          style={{ backgroundColor: theme.accentColor + '90' }}
        >
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">{event.category || "Evento"}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-coral font-bold text-[10px] uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.start_date)}
          </div>
          <h3 className="text-lg font-manrope font-extrabold text-navy line-clamp-2 leading-tight group-hover:text-coral transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted font-medium text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-300" />
            <span className="truncate">{event.location || "A definir"}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-line">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-0.5">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted">A partir de</p>
              <p className="text-lg font-manrope font-black text-navy">
                US$ {event.min_price || 0}
              </p>
            </div>
            <Link 
              to="/eventos" 
              search={{ id: event.id, categoria: event.category || "CARAVANAS INTERNACIONAIS" }}
              className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2 pt-3 border-t border-line/50">
            <div className="w-5 h-5 bg-navy rounded-full flex items-center justify-center text-[8px] text-white font-black overflow-hidden border border-white shadow-sm">
              {event.tenants?.logo ? (
                <img src={event.tenants.logo} className="w-full h-full object-cover" />
              ) : (
                event.tenants?.nome?.substring(0, 2).toUpperCase() || "ZT"
              )}
            </div>
            <span className="text-[9px] font-bold text-muted-fg uppercase tracking-tight">
              Org: <span className="text-navy">{event.tenants?.nome || "Zevva Tickets"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
