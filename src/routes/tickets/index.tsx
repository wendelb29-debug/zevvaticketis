import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Download, 
  Send,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tickets/")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: MyTickets,
});

function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            title,
            location,
            city,
            start_date
          )
        `)
        .eq("owner_id", user.id);

      if (data) setTickets(data);
      setLoading(false);
    }
    fetchTickets();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
      case 'confirmado':
        return <Badge className="bg-good/10 text-good border-good/20 font-bold uppercase tracking-wider text-[10px]">Válido</Badge>;
      case 'presente':
        return <Badge className="bg-navy/10 text-navy border-navy/20 font-bold uppercase tracking-wider text-[10px]">Presente</Badge>;
      case 'falta':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase tracking-wider text-[10px]">Falta</Badge>;
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">{status || 'Confirmado'}</Badge>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
      <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Carregando seus ingressos...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 font-inter">
      <GlobalBreadcrumb className="py-4" />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-navy">Meus Ingressos</h1>
        <p className="text-muted font-medium">Gerencie suas reservas e acesse seus QR codes.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white border border-line rounded-[32px] p-20 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-muted mx-auto">
            <Ticket className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-navy">Nenhum ingresso encontrado</h3>
            <p className="text-muted font-medium max-w-sm mx-auto">Você ainda não possui ingressos para eventos. Explore o marketplace para encontrar sua próxima experiência!</p>
          </div>
          <Button 
            asChild
            className="bg-coral hover:bg-coral-dark text-white font-extrabold px-8 rounded-xl"
          >
            <Link to="/">Explorar Eventos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-line rounded-[24px] overflow-hidden flex flex-col shadow-sm hover-lift transition-all group">
              {/* Event Cover Image Placeholder */}
              <div className="h-40 bg-navy relative">
                 <div className="absolute top-4 left-4 z-10">
                    {getStatusBadge(ticket.status)}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Ticket className="w-16 h-16 text-white" />
                 </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-widest">{ticket.name}</span>
                  <h3 className="text-xl font-extrabold text-navy leading-tight group-hover:text-coral transition-colors">{ticket.events?.title}</h3>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted font-medium">
                      <MapPin className="w-4 h-4 text-coral" />
                      {ticket.events?.location || `${ticket.events?.city}`}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted font-medium">
                      <Calendar className="w-4 h-4 text-coral" />
                      {ticket.events?.start_date ? new Date(ticket.events.start_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-line/50">
                  <Button asChild className="w-full bg-navy text-white rounded-xl font-bold h-11">
                    <a href={`/tickets/${ticket.id}`} className="flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 mr-2" /> Ver Ingresso
                    </a>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-10 border-2 text-navy hover:bg-surface border-line px-2">
                        <Download className="w-4 h-4 mr-1 md:mr-2" /> <span className="text-[10px] md:text-sm">PDF</span>
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-10 border-2 text-navy hover:bg-surface border-line px-2">
                        <Send className="w-4 h-4 mr-1 md:mr-2" /> <span className="text-[10px] md:text-sm">Enviar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
