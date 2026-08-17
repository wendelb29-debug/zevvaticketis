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

  const handleManualCheckin = async (tokenHash: string) => {
    if (!eventId) return;

    const { data: { user: operator } } = await supabase.auth.getUser();
    if (!operator) return;

    // OFFLINE MODE - Disabled for Phase 1 security hardening
    if (!isOnline) {
      toast.error("O check-in exige conexão com o servidor.");
      return;
    }

    try {
      // Secure server-side atomic validation and check-in
      const data = await processTicketCheckin({
        data: {
          rawToken: tokenHash,
          eventId: eventId,
          tenantId: (event?.tenant_id || projectId) as string,
        },
      });

      const resultData = data as any;

      
      if (!resultData || !resultData.success) {
        setScannedResult({ 
          success: false, 
          message: resultData?.message || "ERRO NA VALIDAÇÃO",
          reason: resultData?.code === 'ALREADY_USED' 
            ? `Validado em ${new Date(resultData.checked_in_at).toLocaleString('pt-BR')}`
            : resultData?.message
        });
        toast.error(resultData?.message || "Ingresso inválido.");
        return;
      }

      // Success logic
      setScannedResult({ 
        success: true, 
        message: "LIBERADO", 
        ticket: { 
          profiles: { full_name: resultData.attendee_name }, 
          qr_code: tokenHash 
        } 
      });
      toast.success("Check-in realizado!");
      
      // Update history locally for immediate feedback
      const now = DateTime.now();
      const newRecord = {
        id: crypto.randomUUID(),
        status: 'sucesso',
        checkin_time: now.toFormat('HH:mm:ss'),
        checkin_date: now.toISODate(),
        profiles: { full_name: 'Você' },
        tickets: { name: resultData.attendee_name, qr_code: tokenHash }
      };
      setScanHistory(prev => [newRecord, ...prev].slice(0, 5));
      
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar check-in: " + (err.message || "Erro desconhecido"));
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
          className="text-foreground font-bold hover:bg-navy/5 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanner Profissional</p>
          <p className="text-sm font-black text-primary uppercase truncate max-w-[200px]">{event?.title}</p>
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
        {(!isScanning && !scannedResult) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-coral/30 animate-pulse">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase">Pronto para Validar</h3>
              <p className="text-primary-foreground/60 text-sm font-medium">Aponte para o QR Code do participante.</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary-dark text-primary-foreground font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg"
              onClick={() => setIsScanning(true)}
            >
              <Zap className="w-4 h-4 mr-2" /> Ativar Scanner
            </Button>
          </div>
        ) : isScanning ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
             <div className="w-64 h-64 border-2 border-coral rounded-2xl relative">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(240,84,84,0.8)] animate-scan" />
             </div>
             <Button 
                variant="ghost" 
                className="absolute bottom-6 text-primary-foreground/60"
                onClick={() => setIsScanning(false)}
             >
                Cancelar
             </Button>
          </div>
        ) : null}
      </div>

      {!scannedResult && (
        <input 
          type="text" 
          placeholder="Digitar código manual..." 
          className="w-full h-14 rounded-2xl border border-border px-6 font-bold text-foreground focus:ring-2 focus:ring-coral/20 outline-none transition-all"
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
          scannedResult.success 
            ? (scannedResult.offline ? "border-amber-500 bg-amber-500/5" : "border-emerald-500 bg-emerald-500/5") 
            : "border-red-500 bg-red-500/5"
        )}>
          <CardContent className="p-8 text-center space-y-6">
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
              scannedResult.success 
                ? (scannedResult.offline ? "bg-amber-500 text-primary-foreground" : "bg-emerald-500 text-primary-foreground") 
                : "bg-red-500 text-primary-foreground"
            )}>
              {scannedResult.success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
              <h3 className={cn(
                "text-2xl font-manrope font-black uppercase tracking-tight",
                scannedResult.success 
                  ? (scannedResult.offline ? "text-amber-600" : "text-emerald-500") 
                  : "text-red-500"
              )}>
                {scannedResult.message}
              </h3>
              {scannedResult.offline && (
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter bg-amber-100/50 py-1 px-3 rounded-full inline-block">Sincronização pendente</p>
              )}
              {scannedResult.ticket && (
                <div className="space-y-1">
                  <p className="text-foreground font-black text-lg uppercase leading-none">{scannedResult.ticket.profiles?.full_name || 'Participante'}</p>
                  <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">#{scannedResult.ticket.qr_code?.substring(0,12)}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Check-in: {DateTime.now().toLocaleString(DateTime.TIME_SIMPLE)}</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm bg-navy text-primary-foreground hover:bg-navy/90"
              onClick={() => setScannedResult(null)}
            >
              Próxima Leitura
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      <div className="space-y-3 pb-10">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <HistoryIcon className="w-3 h-3 text-primary" /> Últimas Leituras
          </h4>
        </div>
        <div className="space-y-2">
          {scanHistory.length === 0 ? (
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-4 bg-muted rounded-2xl border border-dashed border-border">
              Aguardando scans...
            </p>
          ) : scanHistory.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border shadow-sm animate-in slide-in-from-right duration-300">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                log.status === 'presente' || log.status === 'sucesso' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
              )}>
                {log.status === 'presente' || log.status === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-foreground uppercase truncate">
                    {log.tickets?.name || log.tickets?.qr_code?.substring(0,8) || "Inválido"}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{log.checkin_time}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <UserIcon className="w-2.5 h-2.5 text-slate-300" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                    Op: {log.profiles?.full_name?.split(' ')[0] || 'Sistema'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
