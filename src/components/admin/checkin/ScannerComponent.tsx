import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  User, 
  Ticket as TicketIcon, 
  Calendar, 
  History, 
  RefreshCw,
  Search,
  Maximize2,
  Loader2,
  ChevronDown,
  Power,
  QrCode
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTenants } from "@/hooks/use-tenants";
import { useQuery } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ScannerComponent() {
  const { activeTenant } = useTenants();
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastCheckins, setLastCheckins] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["tenant-events-for-checkin", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .eq("tenant_id", activeTenant?.id as string)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const firstEventId = events?.[0]?.id;
    if (events && events.length > 0 && !selectedEventId && firstEventId) {
      setSelectedEventId(firstEventId);
    }
  }, [events, selectedEventId]);

  const selectedEvent = events?.find(e => e.id === selectedEventId);

  const handleScan = async (tokenHash: string) => {
    if (!tokenHash || !activeTenant?.id || !selectedEventId) {
      if (!selectedEventId) toast.error("Selecione um evento primeiro.");
      return;
    }
    
    setIsScanning(false);
    setIsValidating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const data = await processTicketCheckin({
        data: {
          rawToken: tokenHash,
          eventId: selectedEventId as string,
          tenantId: activeTenant.id,
        },
      });

      const resultData = data as any;

      if (!resultData || !resultData.success) {
        setScannedResult({
          success: false,
          error: resultData?.message || "Erro desconhecido",
          reason: resultData?.code === 'ALREADY_USED' 
            ? `Validado em ${new Date(resultData?.checked_in_at).toLocaleString('pt-BR')}`
            : resultData?.message
        });
        toast.error(resultData?.message || "Erro na validação");
        return;
      }

      const result = {
        success: true,
        participantName: resultData.attendee_name || "Participante",
        eventTitle: selectedEvent?.title || "Evento", 
        ticketType: resultData.ticket_type || "Ingresso",
        ticketNumber: tokenHash.slice(0, 8).toUpperCase(),
        checkinTime: new Date().toLocaleTimeString()
      };

      setScannedResult(result);
      setLastCheckins(prev => [result, ...prev].slice(0, 5));
      toast.success("Entrada liberada!");

    } catch (error: any) {
      console.error("Check-in error:", error);
      setScannedResult({
        success: false,
        error: "Erro na validação",
        reason: error.message || "Ocorreu um erro ao tentar validar o ingresso."
      });
      toast.error("Erro na validação");
    } finally {
      setIsValidating(false);
    }
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      toast.info("Câmera inicializada. Aponte para o QR Code.");
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-inter">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Control */}
        <Card className="border-border shadow-xl overflow-hidden rounded-[32px]">
          <CardHeader className="bg-navy text-primary-foreground pb-8">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl font-manrope font-black flex items-center gap-3">
                <Camera className="w-6 h-6 text-primary" /> Scanner de Ingresso
              </CardTitle>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-9 px-4 rounded-xl font-bold transition-all">
                    {selectedEvent ? selectedEvent.title.substring(0, 20) + (selectedEvent.title.length > 20 ? '...' : '') : "Selecionar Evento"}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px] rounded-xl">
                  {loadingEvents ? (
                    <DropdownMenuItem disabled>Carregando eventos...</DropdownMenuItem>
                  ) : (events?.length ?? 0) === 0 ? (
                    <DropdownMenuItem disabled>Nenhum evento encontrado</DropdownMenuItem>
                  ) : (
                    events?.map((e) => (
                      <DropdownMenuItem 
                        key={e.id} 
                        className={cn("font-bold text-xs uppercase py-3", selectedEventId === e.id && "bg-accent text-primary")}
                        onClick={() => setSelectedEventId(e.id)}
                      >
                        {e.title}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-foreground-foreground/60 text-xs font-bold uppercase tracking-wider mt-2">Câmera em tempo real • Validando em: <span className="text-primary">{selectedEvent?.title || '---'}</span></p>
          </CardHeader>
          <CardContent className="p-0 relative bg-black aspect-square flex flex-col items-center justify-center">
            {isScanning ? (
              <div className="w-full h-full relative group">
                <div className="absolute inset-0 border-[40px] border-black/40 z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary rounded-3xl z-20 animate-pulse">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                </div>
                
                {/* Mocked Camera Stream with real functionality for testing */}
                <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-primary-foreground/20 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan z-0" />
                   
                   {isValidating ? (
                     <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 z-10">
                       <Loader2 className="w-16 h-16 animate-spin text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Validando...</span>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-6 z-10 px-12 text-center">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center animate-pulse">
                          <QrCode className="w-8 h-8 text-primary/40" />
                        </div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest max-w-[200px]">Simulando Scanner de Alta Performance...</p>
                     </div>
                   )}
                </div>

                <Button 
                  onClick={toggleScanner}
                  disabled={isValidating}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl px-8 h-12 font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all border border-red-400/20 backdrop-blur-md"
                >
                  <Power className="w-4 h-4 mr-2" /> Encerrar Câmera
                </Button>
              </div>
            ) : (
              <div className="text-center p-10 space-y-6">
                <div className="w-24 h-24 rounded-full bg-navy/20 flex items-center justify-center mx-auto border-4 border-white/10">
                  <Camera className="w-10 h-10 text-primary-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-primary-foreground font-bold text-lg">Pronto para escanear</h3>
                  <p className="text-primary-foreground/40 text-sm max-w-[200px] mx-auto">Posicione o QR Code do participante dentro da área demarcada.</p>
                </div>
                <Button 
                  onClick={toggleScanner}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-10 h-16 font-black text-lg shadow-xl shadow-primary/20 group"
                >
                  <Maximize2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Iniciar Scanner
                </Button>
              </div>
            )}
          </CardContent>
          <div className="p-6 bg-card border-t border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="text" 
                  placeholder="Código do ingresso manual..."
                  className="w-full pl-10 pr-4 h-12 bg-card rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 rounded-xl border-border text-foreground font-bold hover:bg-card"
                onClick={() => handleScan(manualCode)}
              >
                Validar
              </Button>
            </div>
          </div>
        </Card>

        {/* Validation Result */}
        <div className="space-y-6">
          <Card className={cn(
            "border-2 transition-all duration-500 rounded-[32px] overflow-hidden shadow-xl min-h-[400px] flex flex-col",
            !scannedResult ? "border-border bg-card" : 
            scannedResult.success ? "border-emerald-500 bg-emerald-50/30" : "border-red-500 bg-red-50/30"
          )}>
            {!scannedResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center text-foreground/20">
                  <TicketIcon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-foreground font-extrabold text-xl">Aguardando Leitura</h3>
                  <p className="text-muted-foreground text-sm">Os detalhes do ingresso aparecerão aqui após o scan.</p>
                </div>
              </div>
            ) : scannedResult.success ? (
              <>
                <div className="bg-emerald-500 p-8 text-center text-primary-foreground">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-manrope font-black uppercase tracking-tight">✅ Entrada Liberada</h2>
                </div>
                <div className="p-8 space-y-6 flex-1">
                  <div className="grid grid-cols-1 gap-6">
                    <ResultItem label="Participante" value={scannedResult.participantName} icon={User} />
                    <ResultItem label="Evento" value={scannedResult.eventTitle} icon={Calendar} />
                    <div className="grid grid-cols-2 gap-4">
                      <ResultItem label="Tipo" value={scannedResult.ticketType} icon={TicketIcon} />
                      <ResultItem label="Código" value={scannedResult.ticketNumber} icon={History} />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-emerald-500/10 flex items-center justify-between text-[10px] font-black uppercase text-emerald-600/60 tracking-widest">
                    <span>Validado às {scannedResult.checkinTime}</span>
                    <span>Operador: Admin Master</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-500 p-8 text-center text-primary-foreground">
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-manrope font-black uppercase tracking-tight">❌ Ingresso Inválido</h2>
                </div>
                <div className="p-10 text-center space-y-4">
                  <p className="text-red-600 font-bold text-lg">{scannedResult.error}</p>
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-sm text-red-400 font-medium">
                    Motivo: {scannedResult.reason}
                  </div>
                  <Button 
                    onClick={() => setScannedResult(null)}
                    variant="outline" 
                    className="mt-6 border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-8"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* History */}
          {lastCheckins.length > 0 && (
            <Card className="border-border shadow-sm overflow-hidden rounded-[24px]">
              <CardHeader className="bg-card py-3 px-6 border-b border-border">
                <CardTitle className="text-xs font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4" /> Últimos Check-ins
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-line">
                {lastCheckins.map((item, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-card/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.participantName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{item.ticketType} • {item.checkinTime}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-12 h-12 rounded-2xl bg-card shadow-sm border border-emerald-500/10 flex items-center justify-center text-emerald-600">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-manrope font-black text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}
