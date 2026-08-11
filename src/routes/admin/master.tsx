import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Ticket, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  LayoutDashboard,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/master")({
  component: MasterAdminPage,
});

function MasterAdminPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["master-stats"],
    queryFn: async () => {
      const [
        { count: tenantsCount },
        { count: usersCount },
        { count: eventsCount },
        { data: orders }
      ] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("valor_bruto, taxa_plataforma").eq("status", "pago")
      ]);

      const totalGMV = orders?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
      const platformRevenue = orders?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;

      return {
        tenants: tenantsCount || 0,
        users: usersCount || 0,
        events: eventsCount || 0,
        revenue: totalGMV,
        platformRevenue: platformRevenue
      };

    }
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["master-tenants", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("tenants")
        .select(`
          *,
          member_count:tenant_members(count),
          event_count:events(count)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.ilike("nome", `%${searchTerm}%`);
      }

      const { data } = await query.limit(20);
      return data;
    }
  });

  const isLoading = statsLoading || tenantsLoading;

  return (
    <div className="space-y-8 pb-10 font-inter max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-manrope font-black text-navy tracking-tight">Master Console</h1>
          <p className="text-slate-500 font-medium">Visão global da plataforma Zevva Tickets.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </Button>
          <Button className="bg-navy hover:bg-coral text-white rounded-xl font-bold px-6">
            Configurações Globais
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-navy text-white rounded-[24px] overflow-hidden relative group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Building2 size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/60">Produtores Cadastrados</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-manrope font-black">{stats?.tenants || 0}</div>
            <p className="text-xs font-medium text-white/60 mt-2">+12 novos este mês</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white border border-slate-100 rounded-[24px] overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Total Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black text-navy">{stats?.users || 0}</div>
            <p className="text-xs font-medium text-emerald-500 mt-2">↑ 8% vs mês passado</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white border border-slate-100 rounded-[24px] overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Eventos Criados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black text-navy">{stats?.events || 0}</div>
            <p className="text-xs font-medium text-slate-500 mt-2">Em todos os ambientes</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-coral text-white rounded-[24px] overflow-hidden relative group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Ticket size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/60">Receita Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-manrope font-black">
              {stats?.platformRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs font-medium text-white/60 mt-2">Comissões sobre GMV</p>
          </CardContent>
        </Card>

      </div>

      <Card className="border-slate-200 shadow-sm rounded-[32px] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 bg-white space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-manrope font-black text-navy">Gerenciamento de Produtores</CardTitle>
              <CardDescription className="font-medium">Monitore GMV, usuários e planos SaaS.</CardDescription>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar ambiente..." 
                className="pl-10 rounded-xl border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-4">Ambiente</th>
                  <th className="px-8 py-4">Plano</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Equipe</th>
                  <th className="px-8 py-4">Eventos</th>
                  <th className="px-8 py-4">Data Cadastro</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants?.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-sm overflow-hidden">
                          {tenant.logo ? <img src={tenant.logo} className="w-full h-full object-cover" /> : tenant.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-manrope font-black text-navy group-hover:text-coral transition-colors">{tenant.nome}</p>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 font-bold border-slate-200">
                        {tenant.plan || "Free"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          tenant.status === 'aprovado' ? "bg-emerald-500" : 
                          tenant.status === 'pendente' ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className="text-xs font-black uppercase tracking-tight text-navy">
                          {tenant.status === 'aprovado' ? 'Ativo' : 
                           tenant.status === 'pendente' ? 'Pendente' : 'Bloqueado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-navy font-bold">
                        <Users className="w-4 h-4 text-slate-300" />
                        {tenant.member_count?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-navy font-bold">
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
                        className="rounded-xl hover:bg-navy hover:text-white font-bold group"
                        onClick={() => navigate({ to: `/admin/tenants/${tenant.id}` as any })}
                      >
                        Gerenciar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {tenants?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <Building2 size={32} />
                        </div>
                        <p className="text-slate-400 font-medium italic">Nenhum ambiente encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
