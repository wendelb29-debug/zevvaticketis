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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

    const { data } = await supabase
      .from("tickets")
      .select(`
        *,
        events:event_id (
          title,
          date,
          city,
          thumbnail_url
        )
      `)
      .eq("owner_id", user.id) // Using owner_id instead of user_id
      .not('status', 'eq', 'ativo') 
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );

  return (
    <div className="space-y-10 font-sans max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-extrabold text-navy">Histórico de Pedidos</h1>
          <p className="text-muted font-medium">Veja seus ingressos usados e pedidos passados.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Buscar evento..." className="pl-11 h-12 rounded-xl border-line" />
        </div>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-line border-dashed p-20 flex flex-col items-center text-center gap-4">
            <div className="p-6 bg-surface rounded-full text-muted">
              <HistoryIcon className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-navy text-xl">Nenhum pedido encontrado</p>
              <p className="text-muted font-medium">Seus ingressos passados aparecerão aqui.</p>
            </div>
            <Button asChild className="mt-4 bg-gold hover:bg-gold-deep text-white font-extrabold px-8 rounded-xl h-12">
              <Link to="/">Explorar Eventos</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-line p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
              <div className="w-full sm:w-32 h-24 rounded-2xl bg-surface overflow-hidden flex-shrink-0">
                {order.events?.thumbnail_url ? (
                   <img src={order.events.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/20">
                    <Ticket className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="font-heading font-extrabold text-lg text-navy">{order.events?.title}</h3>
                  <Badge variant="outline" className="w-fit mx-auto sm:mx-0 font-extrabold text-[10px] uppercase border-line text-muted">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-bold text-muted">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.events?.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.events?.city}</span>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2">
                <p className="text-xl font-heading font-extrabold text-navy">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.price || 0)}
                </p>
                <Button variant="ghost" size="sm" className="font-bold text-gold hover:text-gold-deep h-10 px-4 rounded-lg">
                  Ver detalhes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
