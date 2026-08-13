import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Ban, CheckCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/marketing/anuncios")({
  component: AnunciosPage,
});

function AnunciosPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["all-events-admin"],
    queryFn: async () => {
      // @ts-ignore - bypassing strict table check
      const { data, error } = await supabase
        .from("events")
        .select(`
          id, 
          title, 
          status, 
          category,
          tenants(nome)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Evento ${newStatus === 'rascunho' ? 'despublicado' : 'publicado'} com sucesso`);
      refetch();
    }
  };

  const filteredEvents = events?.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tenants?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-manrope font-extrabold text-foreground">Anúncios (Todos os Eventos)</h1>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Buscar por nome ou produtor..."
            className="w-full pl-9 pr-4 py-2 bg-card rounded-xl border border-border text-sm focus:ring-2 focus:ring-coral/20 font-inter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card text-foreground/40 text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4">Produtor / Org</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-inter">
              {filteredEvents?.map((event: any) => (
                <tr key={event.id} className="hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-foreground text-sm">
                    {event.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70 font-medium">
                    {event.tenants?.nome || "Sem organização"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {event.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      className={cn(
                        "text-[10px] uppercase font-bold",
                        event.status === "publicado" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                      )}
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/eventos/${event.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-card rounded-lg transition-colors text-foreground/40 hover:text-foreground"
                        title="Ver no site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {event.status === "publicado" ? (
                        <button
                          onClick={() => handleUpdateStatus(event.id, "rascunho")}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400 hover:text-red-600"
                          title="Despublicar"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(event.id, "publicado")}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-400 hover:text-green-600"
                          title="Publicar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
