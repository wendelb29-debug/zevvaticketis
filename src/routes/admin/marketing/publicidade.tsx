import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, Star, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing/publicidade")({
  component: MarketingPage,
});

function MarketingPage() {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      // @ts-ignore - bypassing strict table check for now
      const { data } = await supabase
        .from("events")
        .select(`id, title, destaque, organizations(nome)`)
        .eq("status", "publicado");
      return data;
    }
  });

  const toggleDestaque = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("events")
      .update({ destaque: !current })
      .eq("id", id);
    
    if (error) {
      toast.error("Erro ao atualizar destaque");
    } else {
      toast.success("Destaque atualizado");
      refetch();
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Gestão de Marketing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-muted font-bold text-xs uppercase">Eventos em Destaque</p>
          <p className="text-3xl font-black text-navy mt-1">{events?.filter(e => e.destaque).length || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-muted text-xs font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Evento</th>
              <th className="px-6 py-4">Organização</th>
              <th className="px-6 py-4">Destaque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {events?.map((event: any) => (
              <tr key={event.id}>
                <td className="px-6 py-4 font-bold text-navy">{event.title}</td>
                <td className="px-6 py-4 text-sm">{event.organizations?.nome}</td>
                <td className="px-6 py-4">
                  <Switch 
                    checked={event.destaque} 
                    onCheckedChange={() => toggleDestaque(event.id, event.destaque)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}