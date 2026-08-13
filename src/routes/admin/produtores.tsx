import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, ShieldAlert, ShieldCheck, Filter } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/produtores")({
  component: ProdutoresPage,
});

function ProdutoresPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["all-orgs", filter],
    queryFn: async () => {
      let query = supabase
        .from("tenants")
        .select(`
          id, nome, documento, status, created_at,
          countries ( nome )
        `)
        .order("nome", { ascending: true });
      
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      
      const { data } = await query;
      return data;
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: string }) => {
      const nextStatus = currentStatus === 'aprovado' ? 'bloqueado' : 'aprovado';
      const { error } = await supabase
        .from("tenants")
        .update({ status: nextStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-orgs"] });
      toast.success("Status atualizado com sucesso");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-manrope font-extrabold text-foreground">Gestão de Produtores</h1>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="aprovado">Aprovados</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="bloqueado">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-card text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Organização</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">País</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tenants?.map((org: any) => (
              <tr key={org.id} className="hover:bg-card/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-foreground">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{org.nome}</span>
                      <span className="text-xs text-muted-foreground font-medium">{org.documento || "Sem documento"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full border ${
                    org.status === 'aprovado' ? 'bg-green-50 text-green-700 border-green-100' : 
                    org.status === 'bloqueado' ? 'bg-red-50 text-red-700 border-red-100' : 
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{org.countries?.nome || "---"}</td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    size="sm" 
                    variant={org.status === 'bloqueado' ? "outline" : "ghost"}
                    className={org.status === 'bloqueado' ? "text-green-600 border-green-200" : "text-destructive hover:bg-destructive/5"}
                    onClick={() => toggleStatus.mutate({ id: org.id, currentStatus: org.status })}
                    disabled={org.status === 'pendente'}
                  >
                    {org.status === 'bloqueado' ? (
                      <><ShieldCheck className="w-4 h-4 mr-1" /> Desbloquear</>
                    ) : (
                      <><ShieldAlert className="w-4 h-4 mr-1" /> Bloquear</>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
