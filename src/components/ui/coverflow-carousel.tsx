import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedEvent {
  id: string;
  nome: string;
  cidade: string | null;
  categoria: string | null;
  imagem_url: string | null;
  data_inicio: string | null;
  min_price?: number;
  produtor_nome?: string;
  slug?: string | null;
}

interface CoverflowCarouselProps {
  events: FeaturedEvent[];
}


export function CoverflowCarousel({ events }: CoverflowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setCurrentIndex((prev) => (prev + 1) % events.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);

  if (!events || events.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center bg-accent/5 rounded-[40px] border border-dashed border-border">
        <SparklesIcon className="w-12 h-12 text-muted-fg/20 mb-4" />
        <h3 className="text-xl font-manrope font-black text-navy">Novos eventos chegando em breve</h3>
        <p className="text-muted-fg font-bold mt-2 mb-8">Fique atento às nossas próximas experiências exclusivas.</p>
        <Link to="/eventos">
          <button className="px-8 py-4 bg-navy text-white font-black rounded-2xl hover:bg-navy/90 transition-all">
            Conheça a Zevva
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden py-12 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="relative h-[450px] md:h-[550px] flex items-center justify-center">
          {events.map((event, index) => {
            const distance = index - currentIndex;
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + events.length) % events.length;
            const isNext = index === (currentIndex + 1) % events.length;
            
            // Only show 3 at a time on desktop, 1 on mobile
            const isVisible = isActive || isPrev || isNext;

            if (!isVisible) return null;

            return (
              <div
                key={event.id}
                className={cn(
                  "absolute transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group",
                  isActive 
                    ? "z-30 w-[300px] md:w-[400px] h-[400px] md:h-[500px] opacity-100 scale-100 rotate-0 shadow-2xl" 
                    : "z-10 w-[260px] md:w-[350px] h-[350px] md:h-[450px] opacity-40 scale-90 grayscale-[0.8] blur-[1px]",
                  isPrev && "-translate-x-[60%] md:-translate-x-[70%] -rotate-y-12",
                  isNext && "translate-x-[60%] md:translate-x-[70%] rotate-y-12"
                )}
                onClick={() => {
                  if (!isActive) setCurrentIndex(index);
                }}
              >
                <Link 
                  to="/eventos" 
                  search={event.slug ? { slug: event.slug } : { id: event.id }}
                >


                  <div className="w-full h-full rounded-[32px] overflow-hidden relative border-4 border-white shadow-xl">
                    <img
                      src={event.imagem_url || "/placeholder.jpg"}
                      alt={event.nome}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-80" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-3 py-1 bg-coral text-[10px] font-black uppercase rounded-full tracking-widest">
                            {event.categoria}
                         </span>
                         <span className="text-[10px] font-bold text-white/70 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.cidade}
                         </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-manrope font-black mb-2 line-clamp-2 leading-tight uppercase">
                        {event.nome}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-coral" />
                          {event.data_inicio ? new Date(event.data_inicio).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Em breve'}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Hover Info */}
                    <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <button className="px-6 py-3 bg-white text-navy font-black rounded-xl shadow-lg transform -translate-y-4 group-hover:translate-y-0 transition-transform">
                          VER DETALHES
                       </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center gap-6">
           <div className="flex items-center gap-4">
              <button 
                onClick={prev}
                className="w-12 h-12 rounded-full border border-border bg-white flex items-center justify-center text-navy hover:bg-accent transition-colors shadow-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {/* Counter */}
              <div className="px-4 py-2 bg-accent/30 rounded-full">
                 <span className="text-sm font-black text-navy">{currentIndex + 1}</span>
                 <span className="text-xs font-bold text-muted-fg mx-1">/</span>
                 <span className="text-xs font-bold text-muted-fg">{events.length}</span>
              </div>

              <button 
                onClick={next}
                className="w-12 h-12 rounded-full border border-border bg-white flex items-center justify-center text-navy hover:bg-accent transition-colors shadow-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
           </div>
           
           {/* Dots */}
           <div className="flex gap-2">
             {events.map((_, i) => (
               <button
                 key={i}
                 onClick={() => setCurrentIndex(i)}
                 className={cn(
                   "h-1.5 transition-all duration-300 rounded-full",
                   currentIndex === i ? "w-8 bg-coral" : "w-1.5 bg-line"
                 )}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
