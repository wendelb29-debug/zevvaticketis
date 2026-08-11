import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Edit2, Trash2 } from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";


export const Route = createFileRoute("/produtor/ingressos")({
  component: IngressosPage,
});

function IngressosPage() {
  const { activeTenant } = useTenants();
  const { data: ticketTypes, isLoading } = useQuery({
    queryKey: ["producer-ticket-types", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      const { data } = await (supabase
        .from("ticket_types" as any)
        .select("*, events(title)")
        .eq("tenant_id", activeTenant?.id)
        .order("created_at", { ascending: false }) as any);
      return data;
    }
  });


  return (
    <div className="container mx-auto py-8 space-y-8 font-inter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Ingressos do Projeto</h1>
          <p className="text-muted font-medium">Controle lotes, preços e disponibilidade do ambiente selecionado.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {ticketTypes?.map((ticket: any) => (
          <Card key={ticket.id} className="bg-white border-line overflow-hidden hover:border-primary transition-all">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="flex-grow">
                <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1">
                  {ticket.events?.title}
                </p>
                <h3 className="text-lg font-bold text-navy">{ticket.nome}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-sm font-bold text-primary">
                    R$ {Number(ticket.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-muted font-medium">
                    {ticket.quantidade_vendida || 0} / {ticket.quantidade} vendidos
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-muted hover:text-navy"><Edit2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
