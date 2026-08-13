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
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="group bg-surface border border-border overflow-hidden rounded-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-background">
        <img
          src={
            event.cover_image ||
            `https://source.unsplash.com/featured/?${event.category || "event"}`
          }
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(event.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all z-10"
        >
          <Heart className="w-4 h-4" />
        </button>

        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md border border-border rounded-md text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
          {event.category || "Evento"}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            {formatDate(event.start_date)}
          </div>
          <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-foreground-muted text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{event.location || "A definir"}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-foreground-muted">A partir de</span>
            <span className="text-lg font-extrabold text-foreground">
              R$ {event.min_price || 0}
            </span>
          </div>

          <Link 
            to="/eventos/$id" 
            params={{ id: event.id }}
            search={{ busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any}
            className="h-10 px-5 bg-background border border-border flex items-center justify-center rounded-md text-xs font-bold text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
