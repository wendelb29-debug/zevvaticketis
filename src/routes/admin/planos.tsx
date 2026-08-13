import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/admin/planos")({
  component: PlanosPage,
});

function PlanosPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    taxa_percentual: 0,
    limite_eventos: 0,
    limite_ingressos: 0,
    preco_mensal: 0
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await supabase.from("plans").select("*").order("preco_mensal", { ascending: true });
      return data;
    }
  });

  const upsertPlan = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("plans").upsert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano salvo com sucesso");
      setIsEditing(null);
      setFormData({ nome: "", taxa_percentual: 0, limite_eventos: 0, limite_ingressos: 0, preco_mensal: 0 });
    },
    onError: (err: any) => toast.error("Erro: " + err.message)
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano removido");
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-manrope font-extrabold text-foreground">Gestão de Planos</h1>
        <Button onClick={() => setIsEditing('new')} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      {(isEditing === 'new' || !!isEditing?.id) && (
        <div className="bg-card p-6 rounded-xl border space-y-4">
          <h3 className="font-bold text-foreground">{isEditing === 'new' ? "Criar Novo Plano" : "Editar Plano"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Nome</label>
              <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Taxa (%)</label>
              <Input type="number" value={formData.taxa_percentual} onChange={e => setFormData({...formData, taxa_percentual: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Limite Eventos</label>
              <Input type="number" value={formData.limite_eventos} onChange={e => setFormData({...formData, limite_eventos: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Limite Ingressos</label>
              <Input type="number" value={formData.limite_ingressos} onChange={e => setFormData({...formData, limite_ingressos: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Preço Mensal</label>
              <Input type="number" value={formData.preco_mensal} onChange={e => setFormData({...formData, preco_mensal: Number(e.target.value)})} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(null)}>Cancelar</Button>
            <Button onClick={() => upsertPlan.mutate(isEditing === 'new' ? formData : { ...formData, id: isEditing.id })}>
              {isEditing === 'new' ? "Criar Plano" : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan: any) => (
          <div key={plan.id} className="bg-card p-6 rounded-xl border flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setIsEditing(plan); setFormData(plan); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => deletePlan.mutate(plan.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-manrope font-extrabold text-foreground">{plan.nome}</h3>
                <p className="text-2xl font-black text-primary mt-1">
                  R$ {plan.preco_mensal?.toFixed(2)}<span className="text-xs font-medium text-muted-foreground">/mês</span>
                </p>
              </div>
              <ul className="space-y-2">
                <li className="text-sm font-medium flex justify-between">
                  <span className="text-muted-foreground">Taxa por venda:</span>
                  <span className="text-foreground">{plan.taxa_percentual}%</span>
                </li>
                <li className="text-sm font-medium flex justify-between">
                  <span className="text-muted-foreground">Limite Eventos:</span>
                  <span className="text-foreground">{plan.limite_eventos || "Ilimitado"}</span>
                </li>
                <li className="text-sm font-medium flex justify-between">
                  <span className="text-muted-foreground">Limite Ingressos:</span>
                  <span className="text-foreground">{plan.limite_ingressos || "Ilimitado"}</span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
