import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, Mail, Phone, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTenants } from "@/hooks/use-tenants";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/produtor/participantes")({
  component: ParticipantesPage,
});

function ParticipantesPage() {
  const { activeTenant } = useTenants();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["producer-participants", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles:owner_id(nome_completo, email, telefone),
          events(title),
          ticket_types(nome)
        `)
        .eq("tenant_id", activeTenant?.id || "")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;

    }
  });


  return (
    <div className="container mx-auto py-8 space-y-8 font-inter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Participantes do Projeto</h1>
          <p className="text-muted font-medium">Lista de pessoas vinculadas aos eventos deste ambiente.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-line">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
        <Input placeholder="Buscar participante por nome, e-mail ou código..." className="pl-11 h-12 rounded-xl border-line" />
      </div>

      <div className="bg-white rounded-3xl border border-line overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/50 text-[10px] font-black uppercase tracking-widest text-muted border-b border-line">
            <tr>
              <th className="px-6 py-4">Participante</th>
              <th className="px-6 py-4">Evento / Ingresso</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Data Compra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tickets?.map((ticket: any) => (
              <tr key={ticket.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-navy">{ticket.profiles?.nome_completo || 'N/A'}</div>
                  <div className="text-xs text-muted font-medium flex gap-2">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ticket.profiles?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-navy">{ticket.events?.title}</div>
                  <div className="text-xs text-primary font-bold">{ticket.ticket_types?.nome}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                    ticket.status === 'ativo' ? "bg-green-100 text-green-700" : "bg-muted text-muted-fg"
                  )}>
                    {ticket.status === 'ativo' ? 'Válido' : 'Utilizado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-muted font-medium">
                  {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

