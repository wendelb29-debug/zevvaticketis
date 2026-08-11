import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdmitOneTicket } from "@/components/ui/admit-one-ticket";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tickets/$id")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: TicketDetail,
});

function TicketDetail() {
  const { id } = Route.useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            title,
            location,
            city,
            start_date
          ),
          profiles:owner_id (
            full_name
          )
        `)
        .eq("id", id)
        .single();

      if (data) setTicket(data);
      setLoading(false);
    }
    fetchTicket();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
    </div>
  );

  if (!ticket) return <div>Ticket não encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
      
      <AdmitOneTicket 
        title={ticket.events?.title || "Evento"}
        date={ticket.events?.start_date ? new Date(ticket.events.start_date).toLocaleDateString('pt-BR') : "Data a definir"}
        location={ticket.events?.location || "Local"}
        price={ticket.price ? `R$ ${ticket.price}` : "Confirmado"}
        ticketCode={ticket.qr_code || ticket.id.slice(0, 8)}
        status={ticket.status || "VÁLIDO"}
        className="w-full max-w-lg mx-auto"
      />
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-line">
         <h2 className="text-lg font-bold text-navy mb-4">Detalhes do Ingresso</h2>
         <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                 <p className="text-muted text-[10px] uppercase font-bold">Participante</p>
                 <p className="font-semibold text-navy">{ticket.profiles?.full_name || "Convidado"}</p>
             </div>
             <div>
                 <p className="text-muted text-[10px] uppercase font-bold">Tipo</p>
                 <p className="font-semibold text-navy uppercase">{ticket.name || "Padrão"}</p>
             </div>
             <div>
                 <p className="text-muted text-[10px] uppercase font-bold">Status</p>
                 <p className="font-semibold text-good uppercase">{ticket.status || "Confirmado"}</p>
             </div>
             <div>
                 <p className="text-muted text-[10px] uppercase font-bold">Código</p>
                 <p className="font-semibold text-navy font-mono">{ticket.qr_code || ticket.id.slice(0, 8)}</p>
             </div>
         </div>
      </div>
    </div>
  );
}
