import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Heart, ArrowRight } from "lucide-react";
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
    <div className="group bg-surface-base border border-border overflow-hidden rounded-lg transition-all duration-500 hover:border-border-strong">
      <div className="relative aspect-[16/10] overflow-hidden bg-background">
        <img 
          src={event.cover_image || `https://source.unsplash.com/featured/?${event.category || 'church'}`} 
          alt={event.title}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(event.id);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-danger transition-all z-10"
        >
          <Heart className="w-4 h-4" />
        </button>

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white">
          <Icon className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{event.category || "Evento"}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground-muted font-bold text-[10px] uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            {formatDate(event.start_date)}
          </div>
          <h3 className="text-lg font-serif text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-foreground-muted font-medium text-xs">
            <MapPin className="w-3.5 h-3.5 opacity-40" />
            <span className="truncate">{event.location || "A definir"}</span>
          </div>
        </div>

        <div className="pt-5 flex items-center justify-between border-t border-border">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground-muted">Disponível por</span>
            <span className="text-lg font-manrope font-bold text-foreground">
              US$ {event.min_price || 0}
            </span>
          </div>
          
          <Link 
            to="/eventos" 
            search={{ id: event.id, categoria: event.category || "CARAVANAS INTERNACIONAIS" }}
            className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest group/link"
          >
            Detalhes <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
