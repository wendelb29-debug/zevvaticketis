import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Ticket, Users, Wallet, 
  BarChart3, CheckCircle2, ShieldCheck, 
  AlertTriangle, ArrowUpRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MasterMetricCard } from "@/components/admin/master/MasterMetricCard";

interface TenantOverviewProps {
  stats: any;
  tenant: any;
}

export function TenantOverview({ stats, tenant }: TenantOverviewProps) {
  if (!stats) return null;

  const healthScore = tenant.status === 'aprovado' ? 'Saudável' : 'Atenção';
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MasterMetricCard 
          title="GMV Total" 
          value={stats.financeiro.gmv.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={Wallet}
        />
        <MasterMetricCard 
          title="Receita Zevva" 
          value={stats.financeiro.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={TrendingUp}
        />
        <MasterMetricCard 
          title="Ingressos" 
          value={stats.ingressos.emitidos.toLocaleString("pt-BR")}
          description={`${stats.ingressos.utilizados.toLocaleString("pt-BR")} check-ins`}
          icon={Ticket}
        />
        <MasterMetricCard 
          title="Eventos" 
          value={stats.eventos.total.toLocaleString("pt-BR")}
          icon={BarChart3}
        />
        <MasterMetricCard 
          title="Equipe" 
          value={stats.equipe.total.toLocaleString("pt-BR")}
          icon={Users}
        />
        <MasterMetricCard 
          title="Saúde" 
          value={healthScore}
          variant={tenant.status === 'aprovado' ? "default" : "primary"}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 rounded-xl border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-border bg-muted/20">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Status Operacional
              <Activity className="w-3.5 h-3.5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-4">
              <HealthItem label="Domínio" status="Verificado" />
              <HealthItem label="Integrações" status="100% Online" />
              <HealthItem label="Pagamento" status="Em Dia" />
              <HealthItem label="Webhooks" status="Saudável" />
            </div>
            
            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Plano Atual</span>
                <Badge variant="outline" className="rounded-lg font-bold text-[10px] uppercase border-navy/20">{tenant.plan || 'Free'}</Badge>
              </div>
              <div className="mt-3 bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  <span>Uso de Recursos</span>
                  <span>45%</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-xl border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-border bg-muted/20">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Volume de Vendas (Últimos 30 dias)
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/10">
              <div className="flex flex-col items-center gap-2 text-center max-w-[200px]">
                <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Módulo de Gráficos em Manutenção</p>
                <p className="text-[10px] text-muted-foreground/40 font-medium">Os dados reais estão sendo processados para exibição em série temporal.</p>
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
    <div className="flex justify-between items-center text-xs">
      <span className="font-bold text-muted-foreground/70">{label}</span>
      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </div>
    </div>
  );
}

