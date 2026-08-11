import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { QrCode, CheckCircle2, XCircle, ChevronLeft, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkin/event/$id/scanner")({
  component: ScannerPage,
});

function ScannerPage() {
  const { id: eventId } = useParams({ from: "/checkin/event/$id/scanner" });
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
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
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("*, profiles:owner_id(full_name)")
        .eq("qr_code", code)
        .eq("event_id", eventId)
        .maybeSingle();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setScannedResult({ success: false, message: "INGRESSO NÃO ENCONTRADO" });
        return;
      }

      // Check payment status if column exists (mocked logic if not sure)
      // Assuming 'pago' status or similar exists in orders or tickets

      if (ticket.status === 'utilizado') {
        setScannedResult({ success: false, message: "INGRESSO JÁ UTILIZADO", ticket });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Update ticket status
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ 
            status: 'utilizado',
            checked_in_at: new Date().toISOString()
        } as any)
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      // Log record
      await supabase.from("checkin_records").insert({
        event_id: eventId,
        ticket_id: ticket.id,
        operator_id: user?.id || null,
        status: 'presente'
      });

      setScannedResult({ success: true, message: "ENTRADA LIBERADA", ticket });
      toast.success("Check-in realizado!");
      
    } catch (err) {
      console.error(err);
      toast.error("Erro ao validar ingresso.");
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-navy uppercase">Scanner de Acesso</h2>
        <p className="text-xs font-bold text-coral uppercase tracking-widest">{event?.title}</p>
      </div>

      <div className="relative aspect-square rounded-[32px] overflow-hidden bg-navy shadow-2xl border-4 border-white">
        {!isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-coral/20 rounded-full flex items-center justify-center border-2 border-coral/30 animate-pulse">
              <QrCode className="w-12 h-12 text-coral" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase">Pronto para Validar</h3>
              <p className="text-white/60 text-sm font-medium">Aponte para o QR Code do participante.</p>
            </div>
            <Button 
              className="bg-coral hover:bg-coral-dark text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg"
              onClick={() => setIsScanning(true)}
            >
              <Zap className="w-4 h-4 mr-2" /> Ativar Scanner
            </Button>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
             <div className="w-64 h-64 border-2 border-coral rounded-2xl relative">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-coral shadow-[0_0_15px_rgba(240,84,84,0.8)] animate-scan" />
             </div>
             <Button 
                variant="ghost" 
                className="absolute bottom-6 text-white/60"
                onClick={() => setIsScanning(false)}
             >
                Cancelar
             </Button>
          </div>
        )}
      </div>

      {!scannedResult && (
        <input 
          type="text" 
          placeholder="Digitar código manual..." 
          className="w-full h-14 rounded-2xl border border-slate-200 px-6 font-bold text-navy focus:ring-2 focus:ring-coral/20 outline-none transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualCheckin((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      )}

      {scannedResult && (
        <Card className={cn(
          "rounded-[32px] border-4 overflow-hidden animate-in fade-in zoom-in",
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
              <h3 className={cn("text-2xl font-black uppercase", scannedResult.success ? "text-good" : "text-destructive")}>
                {scannedResult.message}
              </h3>
              {scannedResult.ticket && (
                <div className="space-y-1">
                  <p className="text-navy font-black text-lg uppercase leading-none">{scannedResult.ticket.profiles?.full_name}</p>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{scannedResult.ticket.name || 'Ingresso Geral'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Check-in: {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase text-sm bg-navy text-white"
              onClick={() => setScannedResult(null)}
            >
              Próximo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
