import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Calendar, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EventImage } from "@/components/ui/EventImage";

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

import { useUI } from "@/hooks/use-ui";
import { translations } from "@/lib/translations";

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const { language } = useUI();
  const t = translations[language].home;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return language === "pt" ? "A definir" : "To be defined";
    return new Date(dateStr).toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return language === "pt" ? "Consulte os ingressos" : "Check tickets";
    if (price === 0) return language === "pt" ? "Gratuito" : "Free";
    return language === "pt" 
      ? `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : `$ ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-brand-dark rounded-2xl">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Hero Image */}
          <div className="absolute inset-0">
            <EventImage
              src={currentEvent?.cover_image}
              alt={currentEvent?.title || "Evento em destaque"}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
            {/* Vertical Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
            {/* Horizontal Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-6 md:px-16">
            <div className="max-w-2xl w-full space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg shadow-primary/20">
                  {t.featuredLabel}
                </div>

                <h2 className="text-4xl md:text-6xl font-manrope font-extrabold text-primary-foreground leading-tight tracking-tight">
                  {currentEvent?.title}
                </h2>

                <div className="flex flex-wrap gap-6 text-white/85">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    {currentEvent?.city || "Destino internacional"}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(currentEvent?.start_date || null)}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pt-4">
                  <button
                    onClick={() =>
                      navigate({
                        to: "/eventos/$id",
                        params: { id: currentEvent?.id || "" },
                        search: { busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any,
                      })
                    }
                    className="h-14 px-10 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary-hover transition-all rounded-md shadow-2xl flex items-center gap-2"
                  >
                    {t.ensureSpot}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/65 uppercase tracking-widest flex items-center gap-1.5">
                      <Ticket className="w-3 h-3 text-primary" />
                      {currentEvent?.min_price === 0 ? t.free : t.from}
                    </span>
                    <span className="text-2xl font-black text-white">
                      {formatPrice(currentEvent?.min_price ?? null)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-12 right-6 md:right-16 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              handleManualInteraction();
              prevSlide();
            }}
            className="w-12 h-12 rounded-full border border-white/20 bg-card/5 backdrop-blur-md flex items-center justify-center text-primary-foreground hover:bg-card/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              handleManualInteraction();
              nextSlide();
            }}
            className="w-12 h-12 rounded-full border border-white/20 bg-card/5 backdrop-blur-md flex items-center justify-center text-primary-foreground hover:bg-card/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                handleManualInteraction();
                setCurrentIndex(i);
              }}
              className={cn(
                "h-1.5 transition-all duration-300 rounded-full",
                i === currentIndex ? "w-8 bg-primary" : "w-2 bg-card/20 hover:bg-card/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
