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
    <div className="group bg-surface-base border border-border overflow-hidden rounded-sm transition-all duration-700 hover:border-accent hover:shadow-2xl hover:shadow-accent/5">
      <div className="relative aspect-[16/10] overflow-hidden bg-background">
        <img 
          src={event.cover_image || `https://source.unsplash.com/featured/?${event.category || 'church'}`} 
          alt={event.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
        />
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(event.id);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-danger transition-all z-10"
        >
          <Heart className="w-4 h-4" />
        </button>

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/90 backdrop-blur-xl border border-white/10 rounded-sm text-white">
          <Icon className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{event.category || "Evento"}</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-accent font-bold text-[10px] uppercase tracking-[0.3em]">
            {formatDate(event.start_date)}
          </div>
          <h3 className="text-2xl font-serif text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-foreground-muted font-medium text-xs">
            <MapPin className="w-3.5 h-3.5 opacity-40" />
            <span className="truncate">{event.location || "A definir"}</span>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-border">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground-muted mb-1">A partir de</span>
            <span className="text-xl font-serif italic text-primary">
              US$ {event.min_price || 0}
            </span>
          </div>
          
          <Link 
            to="/eventos" 
            search={{ id: event.id, categoria: event.category || "CARAVANAS INTERNACIONAIS" }}
            className="w-10 h-10 border border-border flex items-center justify-center rounded-full group/link hover:bg-primary hover:border-primary transition-all duration-500"
          >
            <ArrowRight className="w-4 h-4 text-foreground-muted group-hover/link:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
