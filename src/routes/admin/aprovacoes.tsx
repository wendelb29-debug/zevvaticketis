import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/aprovacoes")({
  component: AprovacoesPage,
});

function AprovacoesPage() {
  const queryClient = useQueryClient();
  
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["pending-orgs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select(`
          id, nome, documento, status, created_at,
          countries ( nome )
        `)
        .eq("status", "pendente")
        .order("created_at", { ascending: false });
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("organizations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orgs"] });
      toast.success("Status atualizado com sucesso");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 text-foreground">
      <h1 className="text-2xl font-manrope font-extrabold text-foreground">Aprovações de Produtores</h1>
      
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-accent text-muted-fg text-xs font-extrabold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Organização</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">País</th>
              <th className="px-6 py-4">Data Cadastro</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {organizations?.map((org: any) => (
              <tr key={org.id} className="hover:bg-accent transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground">{org.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{org.documento || "---"}</td>
                <td className="px-6 py-4 text-sm font-medium">{org.countries?.nome || "---"}</td>
                <td className="px-6 py-4 text-sm text-muted-fg">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/5"
                      onClick={() => updateStatus.mutate({ id: org.id, status: 'bloqueado' })}
                    >
                      <X className="w-4 h-4 mr-1" /> Rejeitar
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus.mutate({ id: org.id, status: 'aprovado' })}
                    >
                      <Check className="w-4 h-4 mr-1" /> Aprovar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {organizations?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted italic">
                  Nenhuma organização pendente de aprovação.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
