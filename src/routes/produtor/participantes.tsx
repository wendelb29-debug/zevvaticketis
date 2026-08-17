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
      
      // Map legacy/string statuses to canonical check-in statuses for the UI
      return data.map(t => ({
        ...t,
        displayStatus: t.status === 'utilizado' || t.status === 'presente' ? 'Utilizado' : 'Válido',
        isUtilized: t.status === 'utilizado' || t.status === 'presente'
      }));
    }
  });


  return (
    <div className="container mx-auto py-8 space-y-8 font-inter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Participantes do Projeto</h1>
          <p className="text-muted-foreground font-medium">Lista de pessoas vinculadas aos eventos deste ambiente.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-border">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Buscar participante por nome, e-mail ou código..." className="pl-11 h-12 rounded-xl border-border" />
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
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
                  <div className="font-bold text-foreground">{ticket.profiles?.nome_completo || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground font-medium flex gap-2">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ticket.profiles?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-foreground">{ticket.events?.title}</div>
                  <div className="text-xs text-primary font-bold">{ticket.ticket_types?.nome}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                    ticket.isUtilized 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-green-100 text-green-700"
                  )}>
                    {ticket.displayStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-muted-foreground font-medium">
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

