import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Globe, CreditCard, Users, Ticket, 
  BarChart3, CheckCircle2, Megaphone, Settings, 
  Lock, History, ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

const TAB_GROUPS = [
  {
    label: "Gestão",
    tabs: [
      { id: "geral", label: "Visão Geral", icon: Activity },
      { id: "identidade", label: "Identidade", icon: Globe },
      { id: "plano", label: "Plano e Limites", icon: CreditCard },
      { id: "equipe", label: "Equipe", icon: Users },
    ]
  },
  {
    label: "Operação",
    tabs: [
      { id: "eventos", label: "Eventos", icon: Ticket },
      { id: "ingressos", label: "Ingressos", icon: Ticket },
      { id: "financeiro", label: "Financeiro", icon: BarChart3 },
      { id: "checkin", label: "Check-in", icon: CheckCircle2 },
    ]
  },
  {
    label: "Plataforma",
    tabs: [
      { id: "marketing", label: "Marketing", icon: Megaphone },
      { id: "integracoes", label: "Integrações", icon: Settings },
      { id: "seguranca", label: "Segurança", icon: Lock },
      { id: "auditoria", label: "Auditoria", icon: History },
    ]
  }
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
    <div className="relative group mt-4">
      <div 
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-1"
      >
        <TabsList className="bg-muted/20 p-1 rounded-xl border border-border/40 inline-flex w-max min-w-full gap-1">
          {TAB_GROUPS.map((group, groupIdx) => (
            <div key={group.label} className="flex items-center gap-1">
              {groupIdx > 0 && <div className="w-[1px] h-4 bg-border/60 mx-1" />}
              {group.tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className={cn(
                    "rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider transition-all gap-2 h-8",
                    "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border",
                    "text-muted-foreground/60 hover:text-foreground border border-transparent"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </div>
          ))}
        </TabsList>
      </div>

      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-1 lg:hidden">
          <ChevronRight className="w-3 h-3 text-muted-foreground animate-pulse" />
        </div>
      )}
    </div>
  );
}

