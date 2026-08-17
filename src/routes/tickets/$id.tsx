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

  const downloadPDF = async () => {
    if (!ticket) return;
    
    // Import dynamically to avoid SSR issues if any
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(217, 75, 82); // Zevva Coral
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ZEVVA TICKETS", 105, 20, { align: 'center' });
    
    // Content
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.text((ticket.events as any)?.title?.toUpperCase() || "EVENTO", 14, 45);
    
    doc.setFontSize(12);
    doc.text(`Participante: ${ticket.attendee_name || (ticket.profiles as any)?.nome_completo || "Convidado"}`, 14, 55);
    doc.text(`Data: ${(ticket.events as any)?.start_date ? new Date((ticket.events as any).start_date).toLocaleDateString("pt-BR") : "N/A"}`, 14, 62);
    doc.text(`Local: ${(ticket.events as any)?.location || "N/A"}`, 14, 69);
    doc.text(`Tipo: ${ticket.name || "Ingresso"}`, 14, 76);
    
    // Status Badge
    const isUsed = ticket.status === "utilizado";
    doc.setFillColor(isUsed ? 251 : 209, isUsed ? 191 : 250, isUsed ? 36 : 229);
    doc.roundedRect(14, 82, 30, 8, 2, 2, 'F');
    doc.setTextColor(isUsed ? 146 : 6, isUsed ? 64 : 95, isUsed ? 14 : 70);
    doc.setFontSize(8);
    doc.text(isUsed ? "UTILIZADO" : "VÁLIDO", 29, 87, { align: 'center' });

    // QR Code Placeholder for PDF
    // In a real implementation we would render the QR to a canvas and addImage
    doc.setDrawColor(200, 200, 200);
    doc.rect(75, 100, 60, 60);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Apresente o QR Code original no aplicativo", 105, 165, { align: 'center' });
    
    doc.save(`ingresso-zevva-${ticket.id.slice(0, 8)}.pdf`);
  };

  const shareWhatsApp = () => {
    const shareText = `Olá! Este é meu ingresso para ${(ticket?.events as any)?.title}. Acesse: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
