import { createFileRoute, useParams, useSearch, Link, useNavigate } from "@tanstack/react-router";
import { useTenantAdminDetails } from "@/hooks/admin/use-tenant-admin-details";
import { useTenantAdminStats } from "@/hooks/admin/use-tenant-admin-stats";
import { TenantHeader } from "@/components/admin/tenant/TenantHeader";
import { TenantTabs } from "@/components/admin/tenant/TenantTabs";
import { TenantOverview } from "@/components/admin/tenant/TenantOverview";
import { TenantActivityFeed } from "@/components/admin/tenant/TenantActivityFeed";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, LayoutDashboard as DashboardIcon, Globe, CreditCard, Users, Ticket, BarChart3, CheckCircle2, Megaphone as MarketingIcon, Settings, Lock, Copy, Eye } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { MasterStatusBadge } from "@/components/admin/master/MasterStatusBadge";
import { toast } from "sonner";
import { SuspendTenantDialog } from "@/components/admin/tenant/SuspendTenantDialog";
import { ProducerDashboardPanel } from "@/components/dashboard/ProducerDashboardPanel";

// Importações dos módulos do produtor para reutilização
import { TeamManagement } from "@/components/admin/tenant/tabs/TeamManagement";
import { EventsList } from "@/components/admin/tenant/tabs/EventsList";
import { FinanceiroView } from "@/components/admin/tenant/tabs/FinanceiroView";
import { IngressosList } from "@/components/admin/tenant/tabs/IngressosList";
import { MarketingPanel } from "@/components/admin/tenant/tabs/MarketingPanel";
import { OrgSettings } from "@/components/admin/tenant/tabs/OrgSettings";
import { TicketManagementDashboard } from "@/components/tickets/TicketManagementDashboard";
import { CheckinStats } from "@/components/admin/checkin/CheckinStats";

const searchSchema = z.object({
  tab: z.string().catch("geral"),
});

export const Route = createFileRoute("/admin/tenants/$id")({
  validateSearch: (search) => searchSchema.parse(search),
  head: (ctx) => {
    return {
      meta: [
        { title: `Zevva Master | ${(ctx.loaderData as any)?.tenant?.nome || "Projeto"}` },
        { name: "description", content: "Gestão administrativa global do projeto." },
      ],
    };
  },
  loader: async ({ params }) => {
    return { id: params.id };
  },
  component: TenantManagementPage,
});

function TenantManagementPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/admin/tenants/$id" });
  const { tab } = useSearch({ from: "/admin/tenants/$id" }) as any;
  const { data: result, isLoading: isTenantLoading, error: tenantError } = useTenantAdminDetails(id);

  const { stats, activities } = useTenantAdminStats(id);

  const TABS_CONFIG = [
    { id: "geral", label: "Visão Geral", icon: DashboardIcon },
    { id: "dashboard", label: "Painel Produtor", icon: Eye },
    { id: "identidade", label: "Identidade", icon: Globe },
    { id: "plano", label: "Plano e Limites", icon: CreditCard },
    { id: "equipe", label: "Equipe", icon: Users },
    { id: "eventos", label: "Eventos", icon: Ticket },
    { id: "financeiro", label: "Financeiro", icon: BarChart3 },
    { id: "ingressos", label: "Ingressos", icon: Ticket },
    { id: "gestao-ingressos", label: "Gestão Emissões", icon: Ticket },
    { id: "checkin", label: "Check-in", icon: CheckCircle2 },
    { id: "marketing", label: "Marketing", icon: MarketingIcon },
    { id: "configuracoes", label: "Configurações", icon: Settings },
    { id: "auditoria", label: "Auditoria", icon: History },
  ];

  if (isTenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tenantError || !result?.success) {
    return (
      <div className="p-8 text-center bg-card rounded-[32px] border border-border">
        <h2 className="text-xl font-bold text-destructive">Erro ao carregar projeto</h2>
        <p className="text-muted-foreground mt-2">{result?.code || "ID Inválido ou não encontrado"}</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate({ to: "/admin/master", search: { page: 1, search: "" } } as any)}>
          Voltar para Master Console
        </Button>
      </div>
    );
  }

  const { tenant } = result;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      <TenantHeader tenant={tenant} />

      <Tabs 
        value={tab} 
        onValueChange={(val) => navigate({ search: (prev: any) => ({ ...prev, tab: val }) } as any)}
        className="space-y-8"
      >
        <div className="bg-white/50 backdrop-blur-sm p-2 rounded-[32px] border border-border/50 shadow-sm sticky top-4 z-30">
          <TenantTabs />
        </div>

        <div className="min-h-[600px]">
          <TabsContent value="geral" className="space-y-8 outline-none">
            <TenantOverview tenant={tenant} stats={stats as any} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <TenantActivityFeed activities={activities || []} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <ProducerDashboardPanel />
             </div>
          </TabsContent>

          <TabsContent value="identidade">
            <Card className="rounded-[40px] border-border/50 shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden p-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InfoItem label="Nome do Projeto" value={tenant.name} />
                  <InfoItem label="Slug" value={`/${tenant.slug}`} />
                  <InfoItem label="Status" value={tenant.status} isStatus />
                  <InfoItem label="ID" value={tenant.id} copyable />
                  <InfoItem label="Data de Cadastro" value={new Date(tenant.created_at).toLocaleDateString("pt-BR")} />
                  <InfoItem label="Domínio" value={tenant.domain || "Não configurado"} />
                  <InfoItem label="País" value="Brasil" />
                  <InfoItem label="Moeda" value="BRL" />
                  <InfoItem label="Idioma" value="Português (BR)" />
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="equipe">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <TeamManagement tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="eventos">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <EventsList tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="financeiro">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <FinanceiroView tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="ingressos">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <IngressosList tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="gestao-ingressos">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <TicketManagementDashboard scope="producer" tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="checkin">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <CheckinStats />
             </div>
          </TabsContent>

          <TabsContent value="marketing">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <MarketingPanel tenantId={tenant.id} />
             </div>
          </TabsContent>

          <TabsContent value="configuracoes">
             <div className="bg-card p-8 rounded-[40px] border border-border/50 shadow-sm min-h-[600px]">
                <OrgSettings tenantId={tenant.id} />
             </div>
          </TabsContent>

          {TABS_CONFIG.filter(t => !["geral", "dashboard", "identidade", "equipe", "eventos", "financeiro", "ingressos", "gestao-ingressos", "checkin", "marketing", "configuracoes"].includes(t.id)).map(tabConfig => (
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

function InfoItem({ label, value, copyable, isStatus }: { label: string; value: string; copyable?: boolean; isStatus?: boolean }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copiado!");
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
      <div className="flex items-center gap-2">
        {isStatus ? (
          <MasterStatusBadge status={value} />
        ) : (
          <p className="text-sm font-bold text-navy">{value}</p>
        )}
        {copyable && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copy}>
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
