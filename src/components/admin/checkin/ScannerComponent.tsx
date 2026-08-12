import { useState, useRef } from "react";
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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTenants } from "@/hooks/use-tenants";

export function ScannerComponent() {
  const { activeTenant } = useTenants();
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastCheckins, setLastCheckins] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleScan = async (code: string) => {
    if (!code) return;
    setIsScanning(false);
    setIsValidating(true);
    
    try {
      const { data: ticket, error: ticketError } = await (supabase
        .from("tickets")
        .select(`
          *,
          events(title),
          ticket_types(nome),
          profiles:owner_id(nome_completo)
        `)
        .or(`id.eq.${code},share_token.eq.${code}`)
        .eq("tenant_id", activeTenant?.id || "")
        .maybeSingle() as any);

      if (ticketError) throw ticketError;

      if (!ticket) {
        setScannedResult({
          success: false,
          error: "Ingresso não encontrado",
          reason: "O código informado não pertence a nenhum ingresso válido deste projeto."
        });
        toast.error("Ingresso não encontrado");
        return;
      }

      if (ticket.checked_in_at) {
        setScannedResult({
          success: false,
          error: "Ingresso já utilizado",
          reason: `Este ingresso foi validado em ${new Date(ticket.checked_in_at).toLocaleString('pt-BR')}.`
        });
        toast.error("Ingresso já utilizado");
        return;
      }

      const { error: checkinError } = await supabase
        .from("tickets")
        .update({
          checked_in_at: new Date().toISOString(),
          status: 'utilizado'
        })
        .eq("id", ticket.id);

      if (checkinError) throw checkinError;

      await supabase.from("checkin_records").insert({
        ticket_id: ticket.id,
        event_id: ticket.event_id,
        tenant_id: activeTenant?.id || null,
        status: 'success'
      });

      const result = {
        success: true,
        participantName: (ticket as any).profiles?.nome_completo || "Participante",
        eventTitle: (ticket as any).events?.title || "Evento",
        ticketType: (ticket as any).ticket_types?.nome || "Ingresso",
        ticketNumber: ticket.id.slice(0, 8).toUpperCase(),
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
        <Card className="border-line shadow-xl overflow-hidden rounded-[32px]">
          <CardHeader className="bg-navy text-white pb-8">
            <CardTitle className="text-xl font-manrope font-black flex items-center gap-3">
              <Camera className="w-6 h-6 text-coral" /> Scanner de Ingresso
            </CardTitle>
            <p className="text-navy-foreground/60 text-xs font-bold uppercase tracking-wider">Câmera em tempo real</p>
          </CardHeader>
          <CardContent className="p-0 relative bg-black aspect-square flex flex-col items-center justify-center">
            {isScanning ? (
              <div className="w-full h-full relative group">
                <div className="absolute inset-0 border-[40px] border-black/40 z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-coral rounded-3xl z-20 animate-pulse">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                </div>
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/20">
                   <RefreshCw className="w-12 h-12 animate-spin" />
                </div>
                <Button 
                  onClick={toggleScanner}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-red-500 hover:bg-red-600 rounded-xl px-8 h-12 font-bold shadow-lg"
                >
                  Parar Scanner
                </Button>
              </div>
            ) : (
              <div className="text-center p-10 space-y-6">
                <div className="w-24 h-24 rounded-full bg-navy/20 flex items-center justify-center mx-auto border-4 border-white/10">
                  <Camera className="w-10 h-10 text-white/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg">Pronto para escanear</h3>
                  <p className="text-white/40 text-sm max-w-[200px] mx-auto">Posicione o QR Code do participante dentro da área demarcada.</p>
                </div>
                <Button 
                  onClick={toggleScanner}
                  className="bg-coral hover:bg-coral/90 text-white rounded-2xl px-10 h-16 font-black text-lg shadow-xl shadow-coral/20 group"
                >
                  <Maximize2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Iniciar Scanner
                </Button>
              </div>
            )}
          </CardContent>
          <div className="p-6 bg-surface border-t border-line">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
                <input 
                  type="text" 
                  placeholder="Código do ingresso manual..."
                  className="w-full pl-10 pr-4 h-12 bg-white rounded-xl border border-line focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 rounded-xl border-line text-navy font-bold hover:bg-white"
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
            !scannedResult ? "border-line bg-white" : 
            scannedResult.success ? "border-emerald-500 bg-emerald-50/30" : "border-red-500 bg-red-50/30"
          )}>
            {!scannedResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-navy/20">
                  <TicketIcon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-navy font-extrabold text-xl">Aguardando Leitura</h3>
                  <p className="text-muted text-sm">Os detalhes do ingresso aparecerão aqui após o scan.</p>
                </div>
              </div>
            ) : scannedResult.success ? (
              <>
                <div className="bg-emerald-500 p-8 text-center text-white">
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
                <div className="bg-red-500 p-8 text-center text-white">
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
            <Card className="border-line shadow-sm overflow-hidden rounded-[24px]">
              <CardHeader className="bg-surface py-3 px-6 border-b border-line">
                <CardTitle className="text-xs font-black text-navy/40 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4" /> Últimos Check-ins
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-line">
                {lastCheckins.map((item, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-surface/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-navy">{item.participantName}</p>
                      <p className="text-[10px] text-muted-fg font-bold uppercase">{item.ticketType} • {item.checkinTime}</p>
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
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-500/10 flex items-center justify-center text-emerald-600">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-manrope font-black text-navy leading-tight">{value}</p>
      </div>
    </div>
  );
}
