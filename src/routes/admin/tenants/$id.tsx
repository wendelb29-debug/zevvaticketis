import { createFileRoute, useParams, useSearch, Link } from "@tanstack/react-router";
import { useTenantAdminDetails } from "@/hooks/admin/use-tenant-admin-details";
import { useTenantAdminStats } from "@/hooks/admin/use-tenant-admin-stats";
import { TenantHeader } from "@/components/admin/tenant/TenantHeader";
import { TenantTabs } from "@/components/admin/tenant/TenantTabs";
import { TenantOverview } from "@/components/admin/tenant/TenantOverview";
import { TenantActivityFeed } from "@/components/admin/tenant/TenantActivityFeed";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, LayoutDashboard as DashboardIcon, Globe, CreditCard, Users, Ticket, BarChart3, CheckCircle2, Megaphone as MarketingIcon, Settings, Lock, Copy } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { MasterStatusBadge } from "@/components/admin/master/MasterStatusBadge";
import { toast } from "sonner";

import { SuspendTenantDialog } from "@/components/admin/tenant/SuspendTenantDialog";

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
    // We add a minimal loader just to pass data to head() if possible, 
    // but the actual data is handled by React Query in the component.
    return { id: params.id };
  },
  component: TenantManagementPage,
});

function TenantManagementPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/admin/tenants/$id" });
  const { tab } = useSearch({ from: "/admin/tenants/$id" });
  const { data: result, isLoading: isTenantLoading, error: tenantError } = useTenantAdminDetails(id);

  const { stats, activities } = useTenantAdminStats(id);

  const isValidUuid = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  if (!isValidUuid(id)) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Settings size={40} />
        </div>
        <h2 className="text-2xl font-manrope font-black text-foreground mb-2">Endereço Inválido</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          O identificador do projeto fornecido não é um UUID válido.
        </p>
        <Button variant="outline" asChild>
          <Link to="/admin/master" search={{ page: 1, search: "", status: undefined, plan: undefined, hasSales: false, hasEvents: false }}>Voltar ao Master Console</Link>
        </Button>
      </div>
    );
  }

  if (isTenantLoading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <div className="w-20 h-20 bg-muted rounded-3xl mx-auto mb-6" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Carregando Projeto...</p>
      </div>
    );
  }

  if (tenantError || !result?.found) {
    const errorCode = result?.code || "UNKNOWN_ERROR";
    const errorMessage = errorCode === "FORBIDDEN" 
      ? "Você não possui permissão para acessar este projeto." 
      : "O projeto solicitado não foi encontrado ou foi removido.";

    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Settings size={40} />
        </div>
        <h2 className="text-2xl font-manrope font-black text-foreground mb-2">
          {errorCode === "FORBIDDEN" ? "Acesso Negado" : "Projeto Não Encontrado"}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {errorMessage}
        </p>
        <Button variant="outline" asChild>
          <Link to="/admin/master" search={{ page: 1, search: "", status: undefined, plan: undefined, hasSales: false, hasEvents: false }}>Voltar ao Master Console</Link>
        </Button>
      </div>
    );
  }

  const tenant = result.tenant;

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

      <Tabs 
        value={tab} 
        className="w-full" 
        onValueChange={(v) => {
          navigate({
            search: (prev: any) => ({ ...prev, tab: v }),
          });
        }}
      >
        <TenantTabs />

        <div className="mt-8">
          <TabsContent value="geral" className="space-y-6">
            <TenantOverview stats={tenant.usage} tenant={tenant} />
            <TenantActivityFeed activities={activities.data || []} />
          </TabsContent>
          
          <TabsContent value="identidade">
            {/* Real implementation of identity tab */}
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

          {TABS_CONFIG.slice(2).map(tabConfig => (
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


