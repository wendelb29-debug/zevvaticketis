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
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { useState, useEffect } from "react";
import { getGlobalStats, listTenantsPaginated } from "@/lib/master.functions";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { MasterFilters } from "@/components/admin/master/MasterFilters";
import { useDebounce } from "@/hooks/use-debounce";

export const Route = createFileRoute("/admin/master")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
    search: (search.search as string) || "",
    status: (search.status as string) || undefined,
    plan: (search.plan as string) || undefined,
    hasSales: search.hasSales === 'true',
    hasEvents: search.hasEvents === 'true',
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
    });
    setLocalSearch("");
  };

  const isLoading = statsLoading || tenantsLoading;

  return (
    <div className="space-y-8 pb-10 font-inter max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-manrope font-black text-foreground tracking-tight">Master Console</h1>
          <p className="text-muted-foreground font-medium">Gestão global da plataforma: Projetos e GMV.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
          <Button 
            variant="outline" 
            className={cn(
              "flex-1 sm:flex-none rounded-xl font-bold border-border shadow-sm transition-all",
              activeFiltersCount > 0 && "bg-navy/5 border-navy/20 text-navy"
            )}
            onClick={() => setFilterOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" /> 
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-navy text-white h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button 
            className="flex-1 sm:flex-none bg-navy hover:bg-navy/90 text-primary-foreground rounded-xl font-black px-8 shadow-lg shadow-navy/20 uppercase tracking-widest text-[10px] h-10 transition-all active:scale-95"
            onClick={() => navigate({ to: "/admin/configuracoes" as any, search: { tab: "global" } })}
          >
            Configurações Globais
          </Button>
        </div>
      </div>

      <MasterFilters 
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={searchParams}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-navy text-primary-foreground rounded-[24px] overflow-hidden relative group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Building2 size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary-foreground/60">Projetos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black">{stats?.tenants.total || 0}</div>
            <p className="text-xs font-medium text-primary-foreground/60 mt-2">
              {stats?.tenants.newThisMonth || 0} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card border border-border rounded-[24px] overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Total Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black text-foreground">{stats?.users.total || 0}</div>
            <p className="text-xs font-medium text-emerald-500 mt-2">
              {stats?.users.newThisMonth || 0} novos no período
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card border border-border rounded-[24px] overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Eventos Criados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black text-foreground">{stats?.events.total || 0}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2">
              {stats?.events.published || 0} publicados no total
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-[24px] overflow-hidden relative group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <DollarSign size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary-foreground/60">Receita Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black">
              {(stats?.financial.revenue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs font-medium text-primary-foreground/60 mt-2">Taxas líquidas Zevva</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm rounded-[32px] overflow-hidden bg-card">
        <CardHeader className="p-8 border-b border-border space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-manrope font-black text-foreground">Gerenciamento de Projetos</CardTitle>
              <CardDescription className="font-medium">Monitore GMV, usuários e performance de todos os ambientes.</CardDescription>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar ambiente ou slug..." 
                className="pl-10 rounded-xl border-border bg-secondary/50"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-border">
                  <th className="px-8 py-4">Projeto</th>
                  <th className="px-8 py-4">Plano</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Equipe</th>
                  <th className="px-8 py-4">Eventos</th>
                  <th className="px-8 py-4">Data Cadastro</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tenantsResult?.data.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-primary-foreground font-black text-lg border-2 border-white shadow-sm overflow-hidden shrink-0">
                          {tenant.logo ? <img src={tenant.logo} className="w-full h-full object-cover" /> : tenant.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-manrope font-black text-foreground group-hover:text-primary transition-colors">{tenant.nome}</p>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="bg-muted text-muted-foreground font-bold border-border rounded-lg">
                        {tenant.plan || "Free"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          tenant.status === 'aprovado' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : 
                          tenant.status === 'pendente' ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className="text-xs font-black uppercase tracking-tight text-foreground">
                          {tenant.status === 'aprovado' ? 'Ativo' : 
                           tenant.status === 'pendente' ? 'Pendente' : 'Bloqueado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                        <Users className="w-4 h-4 text-slate-300" />
                        {tenant.member_count?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                        <Ticket className="w-4 h-4 text-slate-300" />
                        {tenant.event_count?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                      {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl hover:bg-navy hover:text-primary-foreground font-bold group shadow-none"
                        onClick={() => navigate({ to: `/admin/tenants/${tenant.id}` as any })}
                      >
                        Gerenciar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && tenantsResult?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <Building2 size={32} />
                        </div>
                        <p className="text-slate-400 font-medium italic">Nenhum ambiente encontrado com estes filtros.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-muted-foreground animate-pulse font-bold">
                      Sincronizando dados globais...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {tenantsResult && tenantsResult.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={searchParams.page <= 1}
            onClick={() => navigate({ search: (prev: any) => ({ ...prev, page: prev.page - 1 }) })}
            className="rounded-xl font-bold"
          >
            Anterior
          </Button>
          <span className="text-sm font-black text-muted-foreground px-4">
            Página {searchParams.page} de {tenantsResult.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={searchParams.page >= tenantsResult.totalPages}
            onClick={() => navigate({ search: (prev: any) => ({ ...prev, page: prev.page + 1 }) })}
            className="rounded-xl font-bold"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
