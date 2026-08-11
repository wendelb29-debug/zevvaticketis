import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Edit2, Copy, Power, PowerOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function EmailTemplatesList() {
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    try {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
      toast.success("Template excluído!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir template.");
    }
  };

  const categories: any = {
    purchase_confirmation: "Confirmação de Compra",
    ticket_available: "Ingresso Disponível",
    reminder: "Lembrete",
    cancellation: "Cancelamento",
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Templates de Comunicação</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo dos e-mails automáticos.</p>
        </div>
        <Button className="bg-coral hover:bg-coral/90">
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Carregando templates...</p>
        ) : templates?.length === 0 ? (
          <p>Nenhum template cadastrado.</p>
        ) : (
          templates?.map((template) => (
            <Card key={template.id} className="group overflow-hidden border-2 border-transparent hover:border-coral/20 transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                    {categories[template.category] || template.category}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(template.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold mt-2">{template.name}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-1 italic">{template.subject}</p>
              </CardHeader>
              <CardContent className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${template.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                      {template.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                    Visualizar <Mail className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
