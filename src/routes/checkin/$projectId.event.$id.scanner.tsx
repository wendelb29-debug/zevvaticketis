import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { QrCode, CheckCircle2, XCircle, ChevronLeft, Zap, Info, Wifi, WifiOff, Database, History as HistoryIcon, AlertTriangle, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOfflineScanner } from "@/hooks/use-offline-scanner";
import { DateTime } from "luxon";

export const Route = createFileRoute("/checkin/$projectId/event/$id/scanner")({
  component: ScannerPage,
});

function ScannerPage() {
  const { projectId, id: eventId } = useParams({ from: "/checkin/$projectId/event/$id/scanner" });
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const { isOnline, offlineQueue, addToQueue } = useOfflineScanner();

  useEffect(() => {
    async function loadEvent() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      
      setEvent(data);

      // Load Recent History
      const { data: history } = await supabase
        .from("checkin_records")
        .select(`
          id,
          status,
          checkin_time,
          checkin_date,
          profiles:operator_id(full_name),
          tickets(name, qr_code)
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      setScanHistory(history || []);
      setLoading(false);
    }
    loadEvent();
  }, [eventId]);

  const handleManualCheckin = async (code: string) => {
    const { data: { user: operator } } = await supabase.auth.getUser();
    const now = DateTime.now();

    // OFFLINE PERSISTENCE
    if (!isOnline) {
      addToQueue({
        code,
        eventId,
        operatorId: operator?.id || '',
        timestamp: now.toISO()!,
        tenantId: event?.tenant_id || projectId
      });
      
      setScannedResult({ 
        success: true, 
        message: "ENFILEIRADO (OFFLINE)", 
        offline: true,
        ticket: { qr_code: code } 
      });
      return;
    }

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
        await logRecord('falha', null, operator?.id, code);
        return;
      }

      if (ticket.status === 'utilizado') {
        setScannedResult({ success: false, message: "INGRESSO JÁ UTILIZADO", ticket });
        await logRecord('falha', ticket.id, operator?.id, code);
        return;
      }

      // Update ticket status
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ 
            status: 'utilizado',
            checked_in_at: now.toISO()
        } as any)
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      // Log record
      await logRecord('sucesso', ticket.id, operator?.id, code);

      setScannedResult({ success: true, message: "ENTRADA LIBERADA", ticket });
      toast.success("Check-in realizado!");
      
    } catch (err) {
      console.error(err);
      // Fallback to offline queue if server error
      addToQueue({
        code,
        eventId,
        operatorId: operator?.id || '',
        timestamp: now.toISO()!,
        tenantId: event?.tenant_id || projectId
      });
      setScannedResult({ 
        success: true, 
        message: "ENFILEIRADO (ERRO SYNC)", 
        offline: true,
        ticket: { qr_code: code } 
      });
    }
  };

  const logRecord = async (recStatus: string, ticketId: string | null, operatorId: string | undefined, code: string) => {
    const now = DateTime.now();
    const { data: newRecord } = await (supabase.from("checkin_records") as any).insert({
      event_id: eventId,
      ticket_id: ticketId,
      operator_id: operatorId ?? null,
      status: recStatus === 'sucesso' ? 'presente' : 'falha', // Matching existing enum/string logic in this file
      checkin_date: now.toISODate(),
      checkin_time: now.toFormat('HH:mm:ss'),
      tenant_id: event.tenant_id
    }).select(`
      id, status, checkin_time, checkin_date,
      profiles:operator_id(full_name),
      tickets(name, qr_code)
    `).single();

    if (newRecord) {
      setScanHistory(prev => [newRecord, ...prev].slice(0, 5));
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate({ to: `/checkin/${projectId}/event/${eventId}` })}
          className="text-navy font-bold hover:bg-navy/5 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanner Profissional</p>
          <p className="text-sm font-black text-coral uppercase truncate max-w-[200px]">{event?.title}</p>
        </div>
      </div>

      {/* Connection and Queue Status */}
      <div className="flex gap-2">
        <div className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-2xl border shadow-sm",
          isOnline ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
        )}>
          {isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            isOnline ? "text-emerald-600" : "text-amber-600"
          )}>
            {isOnline ? "Conectado" : "Modo Offline"}
          </span>
        </div>
        
        {offlineQueue.length > 0 && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm animate-pulse">
            <Database className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
              {offlineQueue.length} na fila
            </span>
          </div>
        )}
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
