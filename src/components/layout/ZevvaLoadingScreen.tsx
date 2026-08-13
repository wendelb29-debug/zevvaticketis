import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const ZevvaLoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Escuta eventos de navegação se necessário ou apenas gerencia o estado inicial
    // Em um cenário de roteamento TanStack, podemos ouvir eventos de 'onLoad'
    // Como é global, podemos manter visível por um tempo mínimo ou até o DOM carregar
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-6">
        {/* Pulsing Logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-subtle" />
            <img 
              src="/favicon.png" 
              alt="Zevva Logo" 
              className="w-16 h-16 animate-pulse-subtle relative z-10"
            />
        </div>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-accent rounded-full overflow-hidden">
          <div className="h-full bg-primary w-full animate-progress" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground-fg uppercase tracking-widest animate-pulse">Carregando...</p>
      </div>
    </div>
  );
};
