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
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  beforeLoad: async () => {
    throw redirect({ to: "/tickets" });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
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
        return <Badge className="bg-good/10 text-good border-good/20 font-bold uppercase tracking-wider text-[10px]">Válido</Badge>;
      case 'presente':
        return <Badge className="bg-navy/10 text-navy border-navy/20 font-bold uppercase tracking-wider text-[10px]">Presente</Badge>;
      case 'falta':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase tracking-wider text-[10px]">Falta</Badge>;
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
      <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Carregando seus ingressos...</p>
    </div>
  );

  return (
    <div className="space-y-8 font-inter pt-6">
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
            onClick={() => window.location.href = "/"}
            className="bg-coral hover:bg-coral-dark text-white font-extrabold px-8 rounded-xl"
          >
            Explorar Eventos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-line rounded-[32px] overflow-hidden flex flex-col sm:flex-row shadow-sm hover-lift transition-all">
              {/* QR Code Section */}
              <div className="bg-navy p-8 flex flex-col items-center justify-center gap-4 sm:w-64 border-r border-white/5">
                <div className="bg-white p-4 rounded-2xl shadow-xl w-full aspect-square flex items-center justify-center">
                   {/* Placeholder for QR Code - In a real app we'd use a QRCode component with ticket.qr_code */}
                   <div className="w-full h-full bg-surface-2 rounded-lg flex items-center justify-center border-2 border-dashed border-line">
                      <Ticket className="w-12 h-12 text-navy/20" />
                   </div>
                </div>
                <div className="text-center">
                   <p className="text-[9px] font-extrabold text-white/40 uppercase tracking-[0.2em] mb-1">QR Code Único</p>
                   <p className="text-[10px] font-mono text-white/60 truncate w-40">{ticket.qr_code || ticket.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    {getStatusBadge(ticket.status)}
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-widest">{ticket.name}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-navy leading-tight">{ticket.events?.title}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted font-medium">
                      <MapPin className="w-4 h-4 text-coral" />
                      {ticket.events?.location || `${ticket.events?.city}`}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted font-medium">
                      <Calendar className="w-4 h-4 text-coral" />
                      {ticket.events?.start_date ? new Date(ticket.events.start_date).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data a definir'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-line/50">
                  <Button variant="outline" className="flex-1 rounded-xl font-bold h-11 border-2 text-navy hover:bg-surface border-line">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl font-bold h-11 border-2 text-navy hover:bg-surface border-line">
                    <Send className="w-4 h-4 mr-2" /> Transferir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
