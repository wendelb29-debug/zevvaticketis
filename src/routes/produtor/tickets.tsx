import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";

export const Route = createFileRoute("/produtor/tickets")({
  component: ProducerTicketsPage,
});

function ProducerTicketsPage() {
  const { activeTenant } = useTenants();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["producer-tickets", activeTenant?.id],
    queryFn: async () => {
      if (!activeTenant) return [];
      const { data } = await supabase
        .from("tickets")
        .select(`
          *,
          events!inner(title),
          profiles:owner_id(nome_completo, email, telefone)
        `)
        .eq("tenant_id", activeTenant.id);
      
      return data;
    }
  });

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-coral" /></div>;

  const total = tickets?.length || 0;
  const utilized = tickets?.filter(t => t.status === 'utilizado' || t.status === 'checked_in').length || 0;
  const valid = tickets?.filter(t => t.status === 'valido' || t.status === 'ativo' || t.status === 'pago').length || 0;


  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-manrope font-extrabold text-navy">Gestão de Ingressos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="pt-6"><p className="text-muted text-sm font-bold">TOTAL EMITIDO</p><p className="text-3xl font-black">{total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted text-sm font-bold">UTILIZADOS (CHECK-IN)</p><p className="text-3xl font-black text-blue-600">{utilized}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted text-sm font-bold">VÁLIDOS</p><p className="text-3xl font-black text-green-600">{valid}</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participante</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Compra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tickets as any[])?.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <p className="font-bold">{(ticket.profiles as any)?.nome_completo || "N/A"}</p>
                  <p className="text-xs text-muted">{(ticket.profiles as any)?.email || "N/A"}</p>
                </TableCell>
                <TableCell className="font-medium">{(ticket.events as any)?.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${ticket.status === 'utilizado' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {ticket.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(ticket.created_at || "").toLocaleDateString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
