import { createFileRoute, useSearch, useNavigate, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Zap,
  Users,
  ShieldCheck,
  ZapOff,
  RefreshCw,
  Camera,
  AlertTriangle,
  History as HistoryIcon,
  User as UserIcon,
  Calendar,
  Wifi,
  WifiOff,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Html5Qrcode } from "html5-qrcode";
import { DateTime } from "luxon";
import { useOfflineScanner } from "@/hooks/use-offline-scanner";

export const Route = createFileRoute("/checkin/$projectId/scanner")({
  component: ScannerPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      eventId: search['eventId'] as string | undefined
    }
  }
});

type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'error' | 'success';

function ScannerPage() {
  const { projectId } = useParams({ from: "/checkin/$projectId/scanner" });
  const { eventId } = useSearch({ from: "/checkin/$projectId/scanner" });
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [canActivate, setCanActivate] = useState(false);
  const { isOnline, offlineQueue, addToQueue } = useOfflineScanner();
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    // If no eventId is provided, we can't scan, but we shouldn't "error" out the whole page
    // if the user just clicked the "Scanner" tab. We might want to show a message 
    // or the event selector.
    if (!eventId) {
      // toast.info("Selecione um evento na aba Operação para iniciar o scanner.");
      return;
    }

    async function initialize() {
      // 1. Check permissions (Validation extra: Only admins/managers)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Platform admin always can
        const { data: isPlatformAdmin } = await supabase.rpc('check_is_platform_admin', { _user_id: user.id });
        
        // Tenant role check
        let tenantId = projectId;
        const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", projectId).maybeSingle();
        if (tenant) tenantId = tenant.id;

        const { data: member } = await supabase
          .from("tenant_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        // Check against defined roles (case insensitive to be safe)
        const role = member?.role?.toUpperCase();
        const isManager = role === 'OWNER' || role === 'ADMIN';
        setCanActivate(!!isPlatformAdmin || isManager);
      }

      // 2. Load Event & Stats
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId!)
        .single();
      
      setEvent(data);
      
      const { count: total } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", eventId!);
      const { count: checkedIn } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", eventId!).eq("status", "utilizado");
      setStats({ total: total || 0, checkedIn: checkedIn || 0 });

      // 3. Load Recent History for this project/event
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
        .eq("event_id", eventId!)
        .order("created_at", { ascending: false })
        .limit(5);
      
      setScanHistory(history || []);
      setLoading(false);
    }
    initialize();
  }, [eventId, projectId, navigate]);

  const startScanner = async () => {
    if (!canActivate) {
      toast.error("Acesso negado: Somente gestores podem ativar o scanner.");
      return;
    }

    setStatus('starting');
    setErrorMessage(null);

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          html5QrCode.pause(true);
          processCheckin(decodedText);
        },
        (errorMessage) => {
          // Silent - just scanning
        }
      );
      setStatus('scanning');
    } catch (err: any) {
      console.error("Camera error:", err);
      setStatus('error');
      setErrorMessage(
        err?.message?.includes("Permission denied") 
          ? "Permissão de câmera negada. Por favor, autorize o acesso nas configurações do navegador." 
          : "Não foi possível acessar a câmera. Verifique se ela está disponível e tente novamente."
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Stop error", err);
      }
    }
    setStatus('idle');
  };

  const processCheckin = async (code: string) => {
    if (!eventId) return;

    const { data: { user: operator } } = await supabase.auth.getUser();
    const now = DateTime.now();

    // OFFLINE MODE
    if (!isOnline) {
      addToQueue({
        code,
        eventId,
        operatorId: operator?.id || '',
        timestamp: now.toISO(),
        tenantId: event?.tenant_id || projectId
      });
      
      setScannedResult({ 
        success: true, 
        message: "ENFILEIRADO (OFFLINE)", 
        offline: true,
        ticket: { qr_code: code } 
      });
      setStatus('success');
      return;
    }

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("*, events(title), profiles:owner_id(full_name)")
        .eq("qr_code", code)
        .eq("event_id", eventId)
        .maybeSingle();

      if (ticketError) throw ticketError;
      
      if (!ticket) {
        setScannedResult({ success: false, message: "INGRESSO INVÁLIDO" });
        await logRecord('falha', null, operator?.id, code);
        return;
      }

      if (ticket.status === 'utilizado') {
        setScannedResult({ success: false, message: "JÁ UTILIZADO", ticket });
        await logRecord('falha', ticket.id, operator?.id, code);
        return;
      }

      // Success logic
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ 
            status: 'utilizado',
            checked_in_at: now.toISO()
        } as any)
        .eq("id", ticket.id);

      if (updateError) throw updateError;

      await logRecord('sucesso', ticket.id, operator?.id, code);
      
      setStats(prev => ({ ...prev, checkedIn: prev.checkedIn + 1 }));
      setScannedResult({ success: true, message: "LIBERADO", ticket });
      setStatus('success');
      toast.success("Check-in realizado!");
      
    } catch (err) {
      console.error(err);
      // Fallback to offline queue if server error (network issue)
      addToQueue({
        code,
        eventId,
        operatorId: operator?.id || '',
        timestamp: now.toISO(),
        tenantId: event?.tenant_id || projectId
      });
      setScannedResult({ 
        success: true, 
        message: "ENFILEIRADO (ERRO SYNC)", 
        offline: true,
        ticket: { qr_code: code } 
      });
      setStatus('success');
    }
  };

  const logRecord = async (recStatus: string, ticketId: string | null, operatorId: string | undefined, code: string) => {
    const now = DateTime.now();
    const { data: newRecord } = await (supabase.from("checkin_records") as any).insert({
      event_id: eventId,
      ticket_id: ticketId,
      operator_id: operatorId ?? null,
      status: recStatus,
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

  const resumeScanning = () => {
    setScannedResult(null);
    setStatus('scanning');
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.resume();
    }
  };

  if (loading) return null;

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <QrCode className="w-10 h-10 text-slate-300" />
        </div>
        <div className="max-w-xs space-y-2">
          <h3 className="text-xl font-manrope font-black text-navy uppercase">Nenhum Evento Selecionado</h3>
          <p className="text-slate-500 text-sm font-medium">Selecione um evento na aba <b>Operação</b> para habilitar a câmera e iniciar as validações.</p>
        </div>
        <Button 
          onClick={() => navigate({ to: "/checkin/$projectId", params: { projectId } as any })}
          className="bg-navy hover:bg-navy/90 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl"
        >
          Ir para Operação
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { stopScanner(); navigate({ to: "/checkin/$projectId", params: { projectId } as any }); }}
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

      <div className="max-w-md mx-auto space-y-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            status === 'idle' && "bg-slate-300",
            status === 'starting' && "bg-amber-400",
            status === 'scanning' && "bg-emerald-500",
            status === 'error' && "bg-red-500",
            status === 'success' && "bg-blue-500"
          )} />
          <span className="text-[10px] font-black text-navy uppercase tracking-widest">
            {status === 'idle' && "Pronto"}
            {status === 'starting' && "Iniciando Câmera..."}
            {status === 'scanning' && "Escaneando..."}
            {status === 'error' && "Erro"}
            {status === 'success' && "Concluído"}
          </span>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-square rounded-[32px] overflow-hidden bg-navy shadow-2xl border-4 border-white ring-1 ring-slate-200">
           {status === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-coral/20 rounded-full flex items-center justify-center border-2 border-coral/30">
                      <QrCode className="w-12 h-12 text-coral" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-manrope font-black uppercase">Ativar Validação</h3>
                    <p className="text-white/60 text-sm font-medium">Aponte para o QR Code para realizar o check-in automático.</p>
                  </div>
                  <Button 
                    className="bg-coral hover:bg-coral-dark text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-coral/30"
                    onClick={startScanner}
                  >
                    <Zap className="w-4 h-4 mr-2" /> Ativar Scanner
                  </Button>
                  {!canActivate && (
                    <p className="text-[9px] text-red-400 font-bold uppercase">Apenas gestores</p>
                  )}
              </div>
           )}

           <div id={scannerContainerId} className={cn("w-full h-full", (status !== 'scanning' && status !== 'success') && "hidden")} />

           {status === 'starting' && (
             <div className="absolute inset-0 bg-navy flex flex-col items-center justify-center text-white space-y-4">
                <RefreshCw className="w-10 h-10 text-coral animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">Configurando Câmera...</p>
             </div>
           )}

           {status === 'error' && (
             <div className="absolute inset-0 bg-red-950 flex flex-col items-center justify-center text-white p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase">Falha no Scanner</h3>
                  <p className="text-red-200/60 text-xs font-medium leading-relaxed">{errorMessage}</p>
                </div>
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs h-10 px-6 rounded-xl"
                  onClick={startScanner}
                >
                  <RefreshCw className="w-3 h-3 mr-2" /> Tentar Novamente
                </Button>
             </div>
           )}

           {/* Scanning UI Overlays */}
           {(status === 'scanning' || status === 'success') && (
              <>
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                    <div className="w-full aspect-square border-2 border-coral rounded-2xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-coral shadow-[0_0_15px_rgba(240,84,84,0.8)] animate-scan" />
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white bg-black/20 backdrop-blur-sm rounded-xl px-6"
                    onClick={stopScanner}
                >
                    Interromper
                </Button>
              </>
           )}

           {/* Result Overlay */}
           {scannedResult && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
                 <Card className={cn(
                     "w-full rounded-[32px] border-4 overflow-hidden shadow-2xl",
                     scannedResult.success 
                        ? (scannedResult.offline ? "border-amber-500 bg-amber-500/5" : "border-emerald-500 bg-emerald-500/5") 
                        : "border-red-500 bg-red-500/5"
                 )}>
                     <CardContent className="p-8 text-center space-y-6">
                         <div className={cn(
                             "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
                             scannedResult.success 
                                ? (scannedResult.offline ? "bg-amber-500 text-white" : "bg-emerald-500 text-white") 
                                : "bg-red-500 text-white"
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
                                    <p className="text-navy font-black text-lg uppercase leading-none">{scannedResult.ticket.profiles?.full_name || 'Participante'}</p>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">#{scannedResult.ticket.qr_code?.substring(0,12)}</p>
                                </div>
                            )}
                        </div>

                        <Button 
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm bg-navy text-white hover:bg-navy/90"
                            onClick={resumeScanning}
                        >
                            Próxima Leitura
                        </Button>
                    </CardContent>
                </Card>
              </div>
           )}
        </div>

        {/* Stats Grid */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realizados</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-navy leading-none">{stats.checkedIn}</p>
                    <span className="text-[10px] font-bold text-slate-400">/{stats.total}</span>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-emerald-600 leading-none">
                      {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">Presença</span>
                </div>
            </div>
        </div>

        {/* Recent History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon className="w-3 h-3 text-coral" /> Últimas Leituras
            </h4>
          </div>
          <div className="space-y-2">
            {scanHistory.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Aguardando scans...
              </p>
            ) : scanHistory.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right duration-300">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  log.status === 'sucesso' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                )}>
                  {log.status === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-navy uppercase truncate">
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
    </div>
  );
}
