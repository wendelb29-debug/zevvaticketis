import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Globe, CreditCard, Users, Ticket, 
  BarChart3, CheckCircle2, Megaphone, Settings, 
  Lock, History, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

const TABS = [
  { id: "geral", label: "Visão Geral", icon: Activity },
  { id: "identidade", label: "Identidade e Domínio", icon: Globe },
  { id: "plano", label: "Plano e Limites", icon: CreditCard },
  { id: "equipe", label: "Equipe e Usuários", icon: Users },
  { id: "eventos", label: "Eventos", icon: Ticket },
  { id: "ingressos", label: "Ingressos", icon: Ticket },
  { id: "financeiro", label: "Pedidos e Financeiro", icon: BarChart3 },
  { id: "checkin", label: "Check-in", icon: CheckCircle2 },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "integracoes", label: "Integrações", icon: Settings },
  { id: "seguranca", label: "Segurança", icon: Lock },
  { id: "auditoria", label: "Auditoria", icon: History },
];

export function TenantTabs() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowRightGradient(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => {
        el.removeEventListener('scroll', checkScroll);
      };
    }
    return undefined;
  }, []);

  return (
    <div className="relative group mt-6">
      <div 
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-2"
      >
        <TabsList className="bg-muted/30 p-1 rounded-2xl border border-border/50 inline-flex w-max min-w-full gap-1">
          {TABS.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={cn(
                "rounded-xl px-5 py-2.5 font-black text-[10px] uppercase tracking-[0.15em] transition-all gap-2",
                "data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-md",
                "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground animate-pulse" />
        </div>
      )}
    </div>
  );
}
