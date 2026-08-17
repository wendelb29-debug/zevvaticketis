import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/hooks/use-ui';
import { logAdEvent } from '@/lib/ads.functions';
import { useServerFn } from '@tanstack/react-start';

interface FloatingSponsoredAdProps {
  ad: {
    id: string;
    organization_id: string;
    name: string;
    creative: {
      id: string;
      title: string;
      description: string | null;
      cta_label: string | null;
      destination_url: string;
      image_desktop_url: string;
      image_mobile_url: string | null;
      alt_text: string | null;
    };
  };
}

export function FloatingSponsoredAd({ ad }: FloatingSponsoredAdProps) {
  const { theme } = useUI();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const dragControls = useDragControls();
  const impressionLogged = useRef(false);
  const visibleStartTime = useRef<number | null>(null);
  const adRef = useRef<HTMLDivElement>(null);

  const logEvent = useServerFn(logAdEvent);

  useEffect(() => {
    // Session-based persistence: check if dismissed this session
    const dismissedAds = JSON.parse(sessionStorage.getItem('zevva_dismissed_ads') || '[]');
    if (dismissedAds.includes(ad.id)) {
      setIsDismissed(true);
      return;
    }

    // Delay entry for better UX
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [ad.id]);

  useEffect(() => {
    if (!isVisible || isDismissed || impressionLogged.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!visibleStartTime.current) {
              visibleStartTime.current = Date.now();
            } else if (Date.now() - visibleStartTime.current >= 1000) {
              // 50% visible for 1 second = valid impression
              handleLogEvent('impression');
              impressionLogged.current = true;
              observer.disconnect();
            }
          } else {
            visibleStartTime.current = null;
          }
        });
      },
      { threshold: [0, 0.5, 1.0] }
    );

    if (adRef.current) observer.observe(adRef.current);
    
    // Interval check as fallback for fast scroll
    const interval = setInterval(() => {
      if (visibleStartTime.current && Date.now() - visibleStartTime.current >= 1000 && !impressionLogged.current) {
        handleLogEvent('impression');
        impressionLogged.current = true;
        clearInterval(interval);
        observer.disconnect();
      }
    }, 200);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isVisible, isDismissed, ad.id]);

  const handleLogEvent = (type: 'impression' | 'click' | 'minimize' | 'close' | 'swipe_dismiss') => {
    logEvent({
      data: {
        organizationId: ad.organization_id,
        campaignId: ad.id,
        creativeId: ad.creative.id,
        eventType: type,
        pagePath: window.location.pathname,
        sessionId: sessionStorage.getItem('zevva_session_id') || undefined
      }
    }).catch(console.error);

  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => setIsDismissed(true), 500);
    
    const dismissedAds = JSON.parse(sessionStorage.getItem('zevva_dismissed_ads') || '[]');
    sessionStorage.setItem('zevva_dismissed_ads', JSON.stringify([...dismissedAds, ad.id]));
    
    handleLogEvent('close');
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
    handleLogEvent('minimize');
  };

  const handleClick = () => {
    handleLogEvent('click');
    window.open(ad.creative.destination_url, '_blank', 'noopener,noreferrer');
  };

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setIsVisible(false);
      setTimeout(() => setIsDismissed(true), 500);
      handleLogEvent('swipe_dismiss');
    }
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={adRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            y: isMinimized ? 'calc(100% - 40px)' : 0
          }}
          exit={{ x: 400, opacity: 0 }}
          drag="x"
          dragControls={dragControls}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className={cn(
            "fixed bottom-6 right-6 z-[100] w-[320px] md:w-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300",
            isMinimized ? "h-10 cursor-pointer" : "h-auto"
          )}
          onClick={isMinimized ? handleMinimize : undefined}
        >
          {/* Header/Controls */}
          <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                Patrocinado
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleMinimize}
                className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-0">
              {/* Creative Content */}
              <div 
                className="relative cursor-pointer group"
                onClick={handleClick}
              >
                <img 
                  src={ad.creative.image_desktop_url} 
                  alt={ad.creative.alt_text || ad.creative.title}
                  className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    Visitar <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-manrope font-extrabold text-sm text-foreground line-clamp-1">
                    {ad.creative.title}
                  </h4>
                  {ad.creative.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {ad.creative.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                    <Info className="w-3 h-3" /> Zevva Ads Network
                  </div>
                  <button 
                    onClick={handleClick}
                    className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {ad.creative.cta_label || 'Saiba mais'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
