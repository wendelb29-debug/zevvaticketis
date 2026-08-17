import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { getGlobalStats, listTenantsPaginated } from "@/lib/master.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/admin/master")({
  component: MasterAdminPage,
});

function MasterAdminPage() {
  const navigate = useNavigate();
  const getStats = useServerFn(getGlobalStats);
  const getTenants = useServerFn(listTenantsPaginated);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["master-stats"],
    queryFn: () => getStats({ data: { period: '30d' } }),
  });

  const { data: tenantsResult, isLoading } = useQuery({
    queryKey: ["master-tenants", page, searchTerm],
    queryFn: () => getTenants({ data: { page, search: searchTerm } }),
  });

  return (
    <div className="space-y-8 pb-10 font-inter max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-manrope font-black">Master Console</h1>
        <Button variant="outline" className="rounded-xl">Configurações Globais</Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-xs font-black uppercase text-muted-foreground">Projetos Ativos</p>
            <p className="text-4xl font-manrope font-black">{stats.tenants.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs font-black uppercase text-muted-foreground">Total Usuários</p>
            <p className="text-4xl font-manrope font-black">{stats.users.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs font-black uppercase text-muted-foreground">Eventos</p>
            <p className="text-4xl font-manrope font-black">{stats.events.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs font-black uppercase text-muted-foreground">Receita Zevva</p>
            <p className="text-4xl font-manrope font-black">
              {stats.financial.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row justify-between items-center p-6">
          <CardTitle>Projetos</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <div className="space-y-4">
              {tenantsResult?.data.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-muted/50">
                  <div>
                    <p className="font-bold">{t.nome}</p>
                    <p className="text-sm text-muted-foreground">/{t.slug}</p>
                  </div>
                  <Button onClick={() => navigate({ to: `/admin/tenants/${t.id}` as any })}>Gerenciar</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
