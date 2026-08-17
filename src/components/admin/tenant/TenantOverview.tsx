import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Ticket, Users, Wallet, 
  BarChart3, CheckCircle2, ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantOverviewProps {
  stats: any;
  tenant: any;
}

export function TenantOverview({ stats, tenant }: TenantOverviewProps) {
  if (!stats) return null;

  const healthScore = tenant.status === 'aprovado' ? 'Saudável' : 'Atenção';
  
  const indicators = [
    { label: "GMV Total", value: stats.financeiro.gmv, icon: Wallet, format: 'currency' },
    { label: "Receita Zevva", value: stats.financeiro.revenue, icon: TrendingUp, format: 'currency' },
    { label: "Ingressos Emitidos", value: stats.ingressos.emitidos, icon: Ticket },
    { label: "Check-ins", value: stats.ingressos.utilizados, icon: CheckCircle2 },
    { label: "Eventos", value: stats.eventos.total, icon: BarChart3 },
    { label: "Membros Equipe", value: stats.equipe.total, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {indicators.map((item, i) => (
          <Card key={i} className="rounded-[20px] border-border/50 shadow-sm overflow-hidden group hover:border-navy/20 transition-all active:scale-[0.98]">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/70">
                {item.label}
              </span>
              <item.icon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-navy transition-colors" />
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-xl font-manrope font-black text-foreground">
                {item.format === 'currency' 
                  ? item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : item.value.toLocaleString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-[28px] border-border/50 shadow-sm">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Saúde do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center justify-center py-6 border-b border-border/40">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-lg",
                tenant.status === 'aprovado' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
              )}>
                {tenant.status === 'aprovado' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <div className="text-lg font-black font-manrope">{healthScore}</div>
              <p className="text-xs text-muted-foreground font-medium text-center max-w-[200px] mt-1">
                Ambiente operacional sem incidentes críticos registrados.
              </p>
            </div>

            <div className="space-y-4">
              <HealthItem label="Domínio" status="Verificado" />
              <HealthItem label="Integrações" status="100% Online" />
              <HealthItem label="Pagamento" status="Em Dia" />
              <HealthItem label="Webhooks" status="Saudável" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[28px] border-border/50 shadow-sm">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Desempenho Comercial (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center border border-dashed border-border/60 rounded-[24px] bg-muted/20">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Gráfico em Processamento</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-bold text-muted-foreground/80">{label}</span>
      <Badge variant="ghost" className="bg-emerald-500/5 text-emerald-600 font-bold border-none text-[10px] uppercase">
        {status}
      </Badge>
    </div>
  );
}
