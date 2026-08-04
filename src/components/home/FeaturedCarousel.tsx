import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedEvent {
  id: string;
  title: string;
  city: string | null;
  min_price: number | null;
  cover_image: string | null;
  start_date: string | null;
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

  if (!events.length) return null;

  const currentEvent = events[currentIndex];

  return (
    <div className="w-full space-y-8 overflow-hidden py-4">
      <div className="relative max-w-7xl mx-auto px-6 h-[400px] flex items-center justify-center">
        {/* Slides Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {events.map((event, index) => {
            let position = index - currentIndex;
            if (position < -1) position += events.length;
            if (position > events.length - 2) position -= events.length;

            const isCenter = position === 0;
            const isLeft = position === -1;
            const isRight = position === 1;
            const isVisible = isCenter || isLeft || isRight;

            if (!isVisible) return null;

            return (
              <Link
                key={event.id}
                to="/eventos"
                search={{ id: event.id } as any}
                className={cn(
                  "absolute transition-all duration-500 ease-in-out cursor-pointer overflow-hidden rounded-[20px]",
                  isCenter ? "w-[70%] h-full z-20 shadow-2xl scale-100 opacity-100" : 
                  "w-[60%] h-[90%] z-10 opacity-40 scale-95 grayscale-[50%]",
                  isLeft && "-translate-x-[40%]",
                  isRight && "translate-x-[40%]"
                )}
              >
                <img 
                  src={event.cover_image || "/placeholder.jpg"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Price Badge for all cards */}
                <div className="absolute top-6 right-6">
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/20">
                    <span className="text-xs font-extrabold text-navy uppercase tracking-widest">A partir de</span>
                    <p className="text-lg font-extrabold text-gold leading-none">{event.min_price ? `US$ ${event.min_price}` : "Sob consulta"}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={(e) => { e.preventDefault(); handleManualInteraction(); prevSlide(); }}
          className="absolute left-[18%] z-30 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-navy hover:scale-110 active:scale-95 transition-all duration-150 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); handleManualInteraction(); nextSlide(); }}
          className="absolute right-[18%] z-30 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-navy hover:scale-110 active:scale-95 transition-all duration-150 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Info & Pagination */}
      <div className="max-w-7xl mx-auto px-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="space-y-1">
          <Link 
            to="/eventos" 
            search={{ id: currentEvent?.id } as any}
            className="text-2xl font-manrope font-extrabold text-navy uppercase tracking-wider hover:text-gold transition-colors"
          >
            {currentEvent?.title}
          </Link>
          <div className="flex items-center justify-center gap-6 text-sm font-bold text-muted">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold" />
              {currentEvent?.city}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold" />
              {currentEvent?.start_date ? new Date(currentEvent.start_date).toLocaleDateString() : ""}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => { handleManualInteraction(); setCurrentIndex(index); }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                currentIndex === index ? "bg-gold w-6" : "bg-line hover:bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
