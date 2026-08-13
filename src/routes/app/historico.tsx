import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  History as HistoryIcon, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Ticket,
  Loader2,
  Search,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/historico")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: OrderHistory,
});

function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await (supabase
      .from("tickets" as any)
      .select(`
        *,
        events:evento_id (
          nome_evento,
          start_date,
          city,
          imagem_capa
        ),
        ticket_types:ticket_type_id (
          nome,
          valor
        )
      `)
      .eq("usuario_id", user.id) 
      .order('created_at', { ascending: false }) as any);
    
    if (data) setOrders(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 font-inter max-w-4xl mx-auto pb-20 pt-6">
      <GlobalBreadcrumb className="py-4" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Meus Ingressos</h1>
          <p className="text-muted-foreground font-medium">Veja seus ingressos ativos e históricos de pedidos.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar evento..." className="pl-11 h-12 rounded-xl border-border" />
        </div>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="bg-card rounded-[32px] border border-border border-dashed p-20 flex flex-col items-center text-center gap-4">
            <div className="p-6 bg-card rounded-full text-muted-foreground">
              <HistoryIcon className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground text-xl">Nenhum pedido encontrado</p>
              <p className="text-muted-foreground font-medium">Seus ingressos passados aparecerão aqui.</p>
            </div>
            <Button asChild className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground font-extrabold px-8 rounded-xl h-12">
              <Link to="/">Explorar Eventos</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-lg transition-all group">
              <div className="flex flex-col sm:flex-row items-stretch">
                <div className="w-full sm:w-48 h-48 rounded-2xl bg-card overflow-hidden flex-shrink-0 m-4">
                  {order.events?.imagem_capa ? (
                     <img src={order.events.imagem_capa} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <Ticket className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="flex-grow p-6 space-y-4 flex flex-col justify-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-manrope font-extrabold text-xl text-foreground">{order.events?.nome_evento}</h3>
                      <Badge className={cn(
                        "font-black text-[10px] uppercase",
                        order.status === 'ativo' ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      )}>
                        {order.status === 'ativo' ? 'Válido' : 'Utilizado'}
                      </Badge>
                    </div>
                    <p className="text-primary font-bold">{order.ticket_types?.nome}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(order.events?.start_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {order.events?.city}</span>
                  </div>
                </div>

                <div className="w-full sm:w-48 bg-accent/30 p-6 flex flex-col items-center justify-center border-l border-border gap-3">
                  <div className="bg-card p-2 rounded-xl shadow-sm border border-border">
                    {/* Placeholder para QR Code real */}
                    <div className="w-24 h-24 bg-navy flex items-center justify-center text-primary-foreground text-[8px] text-center p-2 font-mono">
                      {order.qr_code}
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{order.codigo_unico}</p>
                  <Button variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase tracking-widest">
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
