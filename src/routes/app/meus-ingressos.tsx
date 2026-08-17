import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Ticket,
  Loader2,
  Calendar,
  MapPin,
  QrCode,
  Download,
  AlertCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DigitalTicket } from "@/components/tickets/DigitalTicket";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";

export const Route = createFileRoute("/app/meus-ingressos")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: MeusIngressos,
});

function MeusIngressos() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events(id, title, start_date, location),
        type:ticket_types(id, nome)
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
        <div className="absolute inset-0 blur-xl opacity-20 bg-brand animate-pulse" />
      </div>
      <p className="mt-4 text-muted-foreground font-bold animate-pulse uppercase text-[10px] tracking-[0.3em]">Carregando seus ingressos...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 font-inter pb-32">
      <GlobalBreadcrumb />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full border-brand/20 text-brand font-black text-[10px] uppercase tracking-widest px-4 py-1">Área do Participante</Badge>
          <h1 className="text-4xl md:text-5xl font-manrope font-black text-foreground tracking-tighter">Meus Ingressos</h1>
          <p className="text-muted-foreground font-medium text-lg max-w-lg">
            Sua central de experiências Zevva. Gerencie suas entradas e apresente o QR Code na entrada dos eventos.
          </p>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl font-bold h-12 border-border shadow-sm group" asChild>
             <Link to="/app/historico">
               <History className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-brand transition-colors" /> Pedidos
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {tickets.length === 0 ? (
          <Card className="rounded-[40px] border-dashed border-2 border-border/60 bg-accent/20">
            <CardContent className="flex flex-col items-center py-24 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center shadow-inner">
                <Ticket className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Você ainda não tem ingressos</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">Explore os melhores eventos, workshops e caravanas da plataforma Zevva.</p>
              </div>
              <Button asChild className="rounded-2xl font-black uppercase text-xs tracking-widest h-14 px-10 shadow-xl shadow-brand/20">
                <Link to="/">Explorar Eventos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <DigitalTicket key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>

      {tickets.length > 0 && (
        <div className="bg-brand/5 border border-brand/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white shrink-0 shadow-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-foreground uppercase text-xs tracking-widest">Dica Zevva</p>
              <p className="text-sm text-muted-foreground font-medium">Você pode baixar o PDF para acesso offline ou adicionar à sua carteira digital.</p>
            </div>
          </div>
          <Button variant="link" className="text-brand font-bold">Dúvidas sobre o ingresso?</Button>
        </div>
      )}
    </div>
  );
}
