import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Camera,
  User,
  Ticket,
  AlertTriangle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin/scanner")({
  component: ScannerPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      eventId: search.eventId as string | undefined
    }
  }
});

function ScannerPage() {
  const { eventId } = useSearch({ from: "/checkin/scanner" });
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!eventId) {
      navigate({ to: "/checkin" });
      return;
    }

    async function loadEvent() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      
      setEvent(data);
      setLoading(false);
    }
    loadEvent();
  }, [eventId]);

  const handleManualCheckin = async (code: string) => {
    if (!eventId) return;

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("*, events(title), profiles:owner_id(full_name)")
        .eq("qr_code", code)
        .eq("event_id", eventId)
        .maybeSingle();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setScannedResult({ success: false, message: "INGRESSO NÃO ENCONTRADO" });
        return;
      }

      if (ticket.status === 'utilizado') {
        setScannedResult({ success: false, message: "INGRESSO JÁ UTILIZADO", ticket });
        return;
      }

      // Update status
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ 
            status: 'utilizado',
            checked_at: new Date().toISOString()
        } as any)
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      setScannedResult({ success: true, message: "ENTRADA LIBERADA", ticket });
      toast.success("Check-in realizado com sucesso!");
      
    } catch (err) {
      console.error(err);
      toast.error("Erro ao validar ingresso.");
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate({ to: "/checkin" })}
          className="text-navy font-bold hover:bg-navy/5 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recepção Ativa</p>
          <p className="text-sm font-black text-navy uppercase truncate max-w-[200px]">{event?.title}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Scanner Area */}
        <div className="relative aspect-square rounded-[32px] overflow-hidden bg-navy shadow-2xl border-4 border-white ring-1 ring-slate-200">
           {!isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-coral/20 rounded-full flex items-center justify-center border-2 border-coral/30 animate-pulse">
                      <QrCode className="w-12 h-12 text-coral" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-manrope font-black uppercase">Pronto para Validar</h3>
                    <p className="text-white/60 text-sm font-medium">Aponte a câmera para o QR Code do participante para realizar o check-in automático.</p>
                  </div>
                  <Button 
                    className="bg-coral hover:bg-coral-dark text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-coral/30"
                    onClick={() => setIsScanning(true)}
                  >
                    <Zap className="w-4 h-4 mr-2" /> Ativar Scanner
                  </Button>
              </div>
           ) : (
              <div className="absolute inset-0 bg-black">
                 <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
                    <div className="w-full aspect-square border-2 border-coral rounded-2xl relative">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-coral shadow-[0_0_15px_rgba(240,84,84,0.8)] animate-scan" />
                    </div>
                 </div>
                 <Button 
                    variant="ghost" 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white"
                    onClick={() => setIsScanning(false)}
                 >
                    Cancelar
                 </Button>
              </div>
           )}
        </div>

        {/* Manual Input Trigger (Mock) */}
        {!scannedResult && (
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Código manual..." 
                    className="flex-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-navy focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleManualCheckin((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                        }
                    }}
                />
            </div>
        )}

        {/* Result Overlay */}
        {scannedResult && (
            <Card className={cn(
                "rounded-[32px] border-4 overflow-hidden animate-in fade-in zoom-in duration-300",
                scannedResult.success ? "border-good bg-good/5" : "border-destructive bg-destructive/5"
            )}>
                <CardContent className="p-8 text-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
                        scannedResult.success ? "bg-good text-white" : "bg-destructive text-white"
                    )}>
                        {scannedResult.success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>

                    <div className="space-y-2">
                        <h3 className={cn(
                            "text-2xl font-manrope font-black uppercase tracking-tight",
                            scannedResult.success ? "text-good" : "text-destructive"
                        )}>
                            {scannedResult.message}
                        </h3>
                        {scannedResult.ticket && (
                            <div className="space-y-1">
                                <p className="text-navy font-black text-lg uppercase leading-none">{scannedResult.ticket.profiles?.full_name}</p>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{scannedResult.ticket.name || 'Ingresso Geral'}</p>
                            </div>
                        )}
                    </div>

                    <Button 
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm bg-navy text-white hover:bg-navy/90"
                        onClick={() => setScannedResult(null)}
                    >
                        Próximo Check-in
                    </Button>
                </CardContent>
            </Card>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realizados</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-navy leading-none">--</p>
                    <span className="text-[10px] font-bold text-slate-400">Pessoas</span>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-good leading-none">--%</p>
                    <span className="text-[10px] font-bold text-slate-400">Presença</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
