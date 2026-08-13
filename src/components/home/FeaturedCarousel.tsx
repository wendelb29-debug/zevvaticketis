import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeaturedEvent {
  id: string;
  title: string;
  city: string | null;
  min_price: number | null;
  cover_image: string | null;
  start_date: string | null;
  description?: string;
}

interface FeaturedCarouselProps {
  events: FeaturedEvent[];
}

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  const handleManualInteraction = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-background">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Hero Image with Ken Burns effect */}
          <motion.div 
            initial={{ scale: 1.1, filter: "grayscale(100%)" }}
            animate={{ scale: 1, filter: "grayscale(0%)" }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={currentEvent?.cover_image || "/placeholder.jpg"}
              alt={currentEvent?.title || "Destaque"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </motion.div>

          {/* Editorial Content */}
          <div className="absolute inset-0 flex items-center px-6 md:px-20">
            <div className="max-w-4xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Em Destaque</span>
                    <div className="h-px w-12 bg-accent/30" />
                  </div>
                  
                  <h1 className="text-6xl md:text-[10rem] font-serif text-foreground leading-[0.8] tracking-tight">
                    {(currentEvent?.title || "Evento").split(' ').map((word, i) => (
                      <span key={i} className={i % 2 !== 0 ? "italic block md:ml-40" : "block"}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-10">
                  <p className="text-foreground-muted text-lg md:text-xl font-medium max-w-md leading-relaxed">
                    Experiência exclusiva em {currentEvent?.city || 'Destino internacional'}. 
                    {currentEvent?.start_date && ` Partida em ${new Date(currentEvent.start_date).toLocaleDateString()}.`}
                  </p>
                  
                  <Link 
                    to="/eventos" 
                    search={{ id: currentEvent?.id } as any}
                    className="group h-16 px-12 bg-primary text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-primary-hover transition-all rounded-sm shadow-2xl shadow-primary/20"
                  >
                    Garantir Experiência
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Carousel Controls */}
      <div className="absolute bottom-20 left-6 md:left-20 flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { handleManualInteraction(); prevSlide(); }}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-background transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button 
            onClick={() => { handleManualInteraction(); nextSlide(); }}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-background transition-all"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {events.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-px transition-all duration-500",
                i === currentIndex ? "w-12 bg-accent" : "w-4 bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
