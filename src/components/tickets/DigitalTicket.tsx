import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { 
  Calendar, 
  MapPin, 
  User, 
  Ticket as TicketIcon, 
  Download, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DigitalTicketProps {
  ticket: {
    id: string;
    token_hash: string;
    status: string;
    attendee_name: string;
    event: {
      title: string;
      start_date: string;
      location: string;
    };
    type: {
      nome: string;
    };
  };
}

export function DigitalTicket({ ticket }: DigitalTicketProps) {
  const generatePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Background color and header
      doc.setFillColor(217, 75, 82); // Zevva Coral/Red
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("ZEVVA TICKETS", 105, 25, { align: "center" });

      // Ticket Info Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.text(ticket.event.title.toUpperCase(), 20, 60);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Participante: ${ticket.attendee_name}`, 20, 75);
      doc.text(`Data: ${new Date(ticket.event.start_date).toLocaleString('pt-BR')}`, 20, 82);
      doc.text(`Local: ${ticket.event.location}`, 20, 89);
      doc.text(`Tipo: ${ticket.type.nome}`, 20, 96);

      // Separator line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 105, 190, 105);

      // QR Code
      const canvas = document.getElementById(`qr-${ticket.id}`) as HTMLCanvasElement;
      if (canvas) {
        const qrDataUrl = canvas.toDataURL("image/png");
        doc.addImage(qrDataUrl, 'PNG', 75, 120, 60, 60);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(ticket.token_hash.toUpperCase(), 105, 190, { align: "center" });
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Apresente este QR Code na entrada do evento.", 105, 200, { align: "center" });

      doc.save(`ingresso-zevva-${ticket.id.substring(0, 8)}.pdf`);
      toast.success("Ingresso baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF do ingresso.");
    }
  };

  const isUsed = ticket.status === 'utilizado';

  return (
    <Card className={cn(
      "rounded-[32px] overflow-hidden border-border group hover:shadow-2xl transition-all duration-500 bg-card relative",
      isUsed && "opacity-80"
    )}>
      {/* Visual background pattern for premium look */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-0" />
      
      <div className="flex flex-col md:flex-row items-stretch relative z-10">
        {/* Event Details */}
        <div className="flex-grow p-8 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-manrope font-black text-2xl md:text-3xl text-foreground leading-tight">
              {ticket.event?.title}
            </h3>
            <Badge className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
              isUsed 
                ? "bg-amber-100 text-amber-800 border-amber-200" 
                : "bg-emerald-100 text-emerald-800 border-emerald-200"
            )}>
              {isUsed ? 'Utilizado' : 'Válido'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-brand">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold">
                  <p className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">Data e Hora</p>
                  <p className="text-foreground">{new Date(ticket.event?.start_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-brand">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold">
                  <p className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">Localização</p>
                  <p className="text-foreground line-clamp-1">{ticket.event?.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-brand">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold">
                  <p className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">Participante</p>
                  <p className="text-foreground">{ticket.attendee_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-brand">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold">
                  <p className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">Categoria</p>
                  <p className="text-foreground">{ticket.type?.nome}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className={cn(
          "md:w-64 p-8 flex flex-col items-center justify-center gap-6 border-t md:border-t-0 md:border-l border-border/50",
          isUsed ? "bg-slate-50/50" : "bg-accent/30"
        )}>
          <div className="relative group">
            <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-white">
              <QRCodeCanvas 
                id={`qr-${ticket.id}`}
                value={ticket.token_hash}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            {isUsed && (
              <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center backdrop-blur-[1px]">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
            )}
          </div>
          
          <div className="w-full space-y-3">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">CÓDIGO ÚNICO</p>
              <p className="text-xs font-mono font-bold text-foreground/60">{ticket.token_hash.substring(0, 16)}</p>
            </div>
            <Button 
              onClick={generatePDF}
              variant="outline" 
              className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest h-11 border-brand/20 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
            >
              <Download className="w-3 h-3 mr-2" /> Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
