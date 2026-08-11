import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdmitOneTicket } from "@/components/ui/admit-one-ticket";
import { Loader2, ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/tickets/$id")({
  component: TicketDetail,
});

function TicketDetail() {
  const { id } = useParams({ from: "/tickets/$id" });
  
  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events!inner (
            title,
            location,
            city,
            start_date
          ),
          profiles:owner_id (
            nome_completo
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const downloadPDF = () => {
    if (!ticket) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("ZEVVA TICKETS", 14, 20);
    doc.setFontSize(16);
    doc.text((ticket.events as any)?.title || "Evento", 14, 35);
    doc.setFontSize(12);
    doc.text(`Participante: ${(ticket.profiles as any)?.nome_completo || "Convidado"}`, 14, 45);
    doc.text(`Data: ${(ticket.events as any)?.start_date ? new Date((ticket.events as any).start_date).toLocaleDateString("pt-BR") : "N/A"}`, 14, 55);
    doc.text(`Local: ${(ticket.events as any)?.location || "N/A"}`, 14, 65);
    doc.text(`Código: ${ticket.qr_code || ticket.id.slice(0, 8)}`, 14, 75);
    doc.text(`Status: ${ticket.status === "utilizado" ? "UTILIZADO" : "VÁLIDO"}`, 14, 85);
    doc.save(`ingresso-${ticket.id}.pdf`);
  };

  const shareWhatsApp = () => {
    const shareText = `Olá! Este é meu ingresso para ${(ticket?.events as any)?.title}. Acesse: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-coral" />
    </div>
  );

  if (!ticket) return <div className="text-center py-20">Ticket não encontrado.</div>;

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="space-y-6">
        <AdmitOneTicket 
          title={(ticket.events as any)?.title || "Evento"}
          date={(ticket.events as any)?.start_date ? new Date((ticket.events as any).start_date).toLocaleDateString('pt-BR') : "Data a definir"}
          location={(ticket.events as any)?.location || "Local"}
          price={ticket.price ? `R$ ${ticket.price}` : "Confirmado"}
          ticketCode={ticket.qr_code || ticket.id.slice(0, 8)}
          status={ticket.status === 'utilizado' ? 'UTILIZADO' : 'INGRESSO VÁLIDO'}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={downloadPDF} variant="outline" className="w-full gap-2">
          <Download className="w-4 h-4" /> Baixar PDF
        </Button>
        <Button onClick={shareWhatsApp} className="w-full gap-2 bg-green-600 hover:bg-green-700">
          <Share2 className="w-4 h-4" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
