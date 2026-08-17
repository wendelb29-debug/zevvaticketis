import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produtor/tickets")({
  component: ProducerTicketsPage,
});

function ProducerTicketsPage() {
  const { activeTenant } = useTenants();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["producer-tickets", activeTenant?.id],
    queryFn: async () => {
      if (!activeTenant) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events!inner(title),
          profiles:owner_id(nome_completo, email, telefone),
          ticket_types(nome)
        `)
        .eq("tenant_id", activeTenant.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  const total = tickets?.length || 0;
  const utilized = tickets?.filter(t => t.status === 'utilizado' || t.status === 'presente' || t.status === 'checked_in').length || 0;
  const valid = tickets?.filter(t => t.status === 'valido' || t.status === 'ativo' || t.status === 'pago').length || 0;


  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-manrope font-extrabold text-foreground">Gestão de Ingressos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm font-bold">TOTAL EMITIDO</p><p className="text-3xl font-black">{total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm font-bold">UTILIZADOS (CHECK-IN)</p><p className="text-3xl font-black text-blue-600">{utilized}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm font-bold">VÁLIDOS</p><p className="text-3xl font-black text-green-600">{valid}</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase">Participante</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Evento</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Tipo</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tickets as any[])?.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <p className="font-bold">{(ticket.profiles as any)?.nome_completo || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{(ticket.profiles as any)?.email || "N/A"}</p>
                </TableCell>
                <TableCell className="font-bold text-foreground">{(ticket.events as any)?.title}</TableCell>
                <TableCell className="font-medium">{(ticket.ticket_types as any)?.nome || '---'}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-black uppercase",
                      (ticket.status === 'utilizado' || ticket.status === 'presente') 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {ticket.status === 'utilizado' || ticket.status === 'presente' ? 'Utilizado' : 'Válido'}
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
