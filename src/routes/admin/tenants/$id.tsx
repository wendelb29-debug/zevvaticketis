import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useTenantAdminDetails } from "@/hooks/admin/use-tenant-admin-details";
import { useTenantAdminStats } from "@/hooks/admin/use-tenant-admin-stats";
import { TenantHeader } from "@/components/admin/tenant/TenantHeader";
import { TenantTabs } from "@/components/admin/tenant/TenantTabs";
import { TenantOverview } from "@/components/admin/tenant/TenantOverview";
import { TenantActivityFeed } from "@/components/admin/tenant/TenantActivityFeed";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, LayoutDashboard as DashboardIcon, Globe, CreditCard, Users, Ticket, BarChart3, CheckCircle2, Megaphone as MarketingIcon, Settings, Lock } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.string().optional().default("geral"),
});

export const Route = createFileRoute("/admin/tenants/$id")({
  validateSearch: (search) => searchSchema.parse(search),
  component: TenantManagementPage,
});

function TenantManagementPage() {
  const { id } = useParams({ from: "/admin/tenants/$id" });
  const { tab } = useSearch({ from: "/admin/tenants/$id" });
  const { data: tenant, isLoading: isTenantLoading, error: tenantError } = useTenantAdminDetails();
  const { stats, activities } = useTenantAdminStats(id);

  if (isTenantLoading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <div className="w-20 h-20 bg-muted rounded-3xl mx-auto mb-6" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Carregando Projeto...</p>
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Settings size={40} />
        </div>
        <h2 className="text-2xl font-manrope font-black text-foreground mb-2">Projeto Não Encontrado (404)</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          O ID fornecido não corresponde a nenhum projeto registrado ou você não possui permissão para acessá-lo.
        </p>
      </div>
    );
  }

  const TABS_CONFIG = [
    { id: "geral", label: "Visão Geral", icon: DashboardIcon },
    { id: "identidade", label: "Identidade e Domínio", icon: Globe },
    { id: "plano", label: "Plano e Limites", icon: CreditCard },
    { id: "equipe", label: "Equipe e Usuários", icon: Users },
    { id: "eventos", label: "Eventos", icon: Ticket },
    { id: "ingressos", label: "Ingressos", icon: Ticket },
    { id: "financeiro", label: "Pedidos e Financeiro", icon: BarChart3 },
    { id: "checkin", label: "Check-in", icon: CheckCircle2 },
    { id: "marketing", label: "Marketing", icon: MarketingIcon },
    { id: "integracoes", label: "Integrações", icon: Settings },
    { id: "seguranca", label: "Segurança", icon: Lock },
    { id: "auditoria", label: "Auditoria", icon: History },
  ];

  return (
    <div className="space-y-8 pb-10 font-inter max-w-[1600px] mx-auto px-4">
      <TenantHeader tenant={tenant} />

      <Tabs value={tab} className="w-full" onValueChange={(v) => {
        window.history.pushState(null, "", `${window.location.pathname}?tab=${v}`);
      }}>
        <TenantTabs />

        <div className="mt-8">
          <TabsContent value="geral" className="space-y-6">
            <TenantOverview stats={stats.data} tenant={tenant} />
            <TenantActivityFeed activities={activities.data || []} />
          </TabsContent>
          
          {TABS_CONFIG.slice(1).map(tabConfig => (
            <TabsContent key={tabConfig.id} value={tabConfig.id}>
              <Card className="rounded-[40px] border-border/50 shadow-xl shadow-slate-200/40 overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="p-16 border-b border-border/40 text-center">
                  <div className="w-24 h-24 bg-muted/30 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-muted-foreground/30 shadow-inner">
                    <tabConfig.icon size={48} />
                  </div>
                  <CardTitle className="text-3xl font-manrope font-black text-navy">{tabConfig.label}</CardTitle>
                  <CardDescription className="max-w-md mx-auto mt-4 text-base font-medium">
                    O módulo de <strong>{tabConfig.label}</strong> está sendo conectado aos dados reais do tenant /{tenant.slug}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-24 text-center">
                  <Button variant="outline" className="rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] px-8 h-12 shadow-sm hover:shadow-md transition-all">
                    Carregar Histórico Detalhado
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

