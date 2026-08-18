import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Ticket, 
  ArrowRight, 
  Search, 
  Filter, 
  DollarSign, 
  LayoutDashboard,
  Settings,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { getGlobalStats, listTenantsPaginated } from "@/lib/master.functions";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { MasterFilters } from "@/components/admin/master/MasterFilters";
import { useDebounce } from "@/hooks/use-debounce";
import { MasterPageHeader } from "@/components/admin/master/MasterPageHeader";
import { MasterMetricCard } from "@/components/admin/master/MasterMetricCard";
import { MasterStatusBadge } from "@/components/admin/master/MasterStatusBadge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/master")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search['page']) || 1,
    search: (search['search'] as string) || "",
    status: (search['status'] as string) || undefined,
    plan: (search['plan'] as string) || undefined,
    hasSales: search['hasSales'] === 'true',
    hasEvents: search['hasEvents'] === 'true',
  }),
  component: MasterAdminPage,
});

function MasterAdminPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/admin/master" }) as any;
  const getStats = useServerFn(getGlobalStats);
  const getTenants = useServerFn(listTenantsPaginated);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");
  const debouncedSearch = useDebounce(localSearch, 400);

  // Sync debounced search to URL
  useEffect(() => {
    navigate({
      search: (prev: any) => ({ ...prev, search: debouncedSearch, page: 1 }),
      replace: true,
    } as any);
  }, [debouncedSearch, navigate]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["master-stats"],
    queryFn: () => getStats({ data: { period: '30d' } }),
  });

  const { data: tenantsResult, isLoading: tenantsLoading } = useQuery({
    queryKey: ["master-tenants", searchParams],
    queryFn: () => getTenants({ data: { 
      page: searchParams.page, 
      search: searchParams.search,
      status: searchParams.status,
      plan: searchParams.plan,
      hasSales: searchParams.hasSales,
      hasEvents: searchParams.hasEvents,
    } } as any),
  });

  const activeFiltersCount = [
    searchParams.status,
    searchParams.plan,
    searchParams.hasSales,
    searchParams.hasEvents,
  ].filter(Boolean).length;

  const handleApplyFilters = (newFilters: any) => {
    navigate({
      search: (prev: any) => ({ ...prev, ...newFilters, page: 1 }),
    } as any);
  };

  const handleClearFilters = () => {
    navigate({
      search: () => ({ page: 1 }),
    } as any);
    setLocalSearch("");
  };

  const isLoading = statsLoading || tenantsLoading;

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto px-4 lg:px-8">
      <MasterPageHeader 
        title="Master Console" 
        description="Gestão global da plataforma, projetos e performance operacional."
        lastUpdated={stats?.lastUpdate || new Date().toLocaleTimeString()}
      >
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "rounded-lg font-bold border-border shadow-sm h-10 transition-all",
            activeFiltersCount > 0 && "bg-primary/5 border-primary/20 text-primary"
          )}
          onClick={() => setFilterOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" /> 
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-white h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button 
          size="sm"
          className="bg-navy hover:bg-navy/90 text-primary-foreground rounded-lg font-bold px-4 h-10 transition-all active:scale-95"
          onClick={() => navigate({ to: "/admin/configuracoes" as any, search: { tab: "global" } as any })}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurações Globais
        </Button>
      </MasterPageHeader>

      <MasterFilters 
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={searchParams}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MasterMetricCard 
          title="Projetos Ativos"
          value={stats?.tenants.total || 0}
          description={`${stats?.tenants.newThisMonth || 0} novos este mês`}
          icon={Building2}
          loading={statsLoading}
        />
        <MasterMetricCard 
          title="Total Usuários"
          value={stats?.users.total || 0}
          description={`${stats?.users.newThisMonth || 0} novos no período`}
          trend="up"
          trendValue="12%"
          icon={Users}
          loading={statsLoading}
        />
        <MasterMetricCard 
          title="Eventos Criados"
          value={stats?.events.total || 0}
          description={`${stats?.events.published || 0} publicados no total`}
          icon={Ticket}
          loading={statsLoading}
        />
        <MasterMetricCard 
          title="Receita Plataforma"
          value={(stats?.financial.revenue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          description="Taxas líquidas Zevva"
          variant="primary"
          icon={DollarSign}
          loading={statsLoading}
        />
      </div>

      <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card mt-8">
        <CardHeader className="px-6 py-5 border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-manrope font-bold text-foreground">Ambientes Registrados</CardTitle>
              <CardDescription className="text-sm font-medium">Monitore GMV, usuários e performance de todos os ambientes.</CardDescription>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, slug ou ID..." 
                className="pl-10 rounded-lg border-border bg-background h-10 text-sm"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-6 py-4">Projeto</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Equipe</th>
                  <th className="px-6 py-4">Eventos</th>
                  <th className="px-6 py-4">Data Cadastro</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tenantsResult?.data.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden shrink-0 border border-white/10 shadow-sm">
                          {tenant.logo ? <img src={tenant.logo} className="w-full h-full object-cover" /> : tenant.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{tenant.nome}</p>
                          <p className="text-[11px] text-muted-foreground font-medium tracking-tight truncate max-w-[150px]">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <MasterStatusBadge status={tenant.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">{tenant.plan || "Free"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {tenant.member_count?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                        <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                        {tenant.event_count?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg font-bold text-xs"
                          onClick={() => navigate({ 
                            to: "/admin/tenants/$id",
                            params: { id: tenant.id },
                            search: { tab: "geral" }
                          })}
                        >
                          Gerenciar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem onClick={() => window.open(`https://${tenant.slug}.zevva.com`, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visitar Site
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-500 font-medium">
                              Suspender Projeto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
                {!tenantsLoading && tenantsResult?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Nenhum ambiente encontrado</p>
                          <p className="text-xs text-muted-foreground">Tente ajustar seus termos de busca ou filtros.</p>
                        </div>
                        <Button variant="link" size="sm" onClick={handleClearFilters}>Limpar Filtros</Button>
                      </div>
                    </td>
                  </tr>
                )}
                {tenantsLoading && (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-10 bg-muted/30 animate-pulse rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {tenantsResult && tenantsResult.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                Mostrando página <span className="font-bold text-foreground">{searchParams.page}</span> de <span className="font-bold text-foreground">{tenantsResult.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page <= 1}
                  onClick={() => navigate({ search: (prev: any) => ({ ...prev, page: prev.page - 1 }) } as any)}
                  className="rounded-lg font-bold h-8 text-xs"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page >= tenantsResult.totalPages}
                  onClick={() => navigate({ search: (prev: any) => ({ ...prev, page: prev.page + 1 }) } as any)}
                  className="rounded-lg font-bold h-8 text-xs"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  );
}
