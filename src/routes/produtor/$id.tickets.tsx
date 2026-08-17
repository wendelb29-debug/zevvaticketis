import { createFileRoute } from "@tanstack/react-router";
import { useTenants } from "@/hooks/use-tenants";
import { useEffect } from "react";
import { IssuedTicketsList } from "@/components/admin/eventos/IssuedTicketsList";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";

export const Route = createFileRoute("/produtor/$id/tickets")({
  component: ProducerWorkspaceTickets,
});

function ProducerWorkspaceTickets() {
  const { id } = Route.useParams();
  const { activeTenant, switchTenant, tenants, loading } = useTenants();

  useEffect(() => {
    if (!loading && (!activeTenant || activeTenant.id !== id)) {
      const targetTenant = tenants.find(t => t.id === id);
      if (targetTenant) {
        switchTenant(id);
      }
    }
  }, [id, activeTenant, tenants, loading, switchTenant]);

  if (loading || (activeTenant && activeTenant.id !== id)) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <GlobalBreadcrumb />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full border-brand/20 text-brand font-black text-[10px] uppercase tracking-widest px-4 py-1">Operações</Badge>
          <h1 className="text-4xl md:text-5xl font-manrope font-black text-foreground tracking-tighter uppercase">🎟️ Ingressos Emitidos</h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            Gestão completa de todos os ingressos gerados para o seu projeto. Controle de validade, check-ins e auditoria.
          </p>
        </div>
      </div>

      <Card className="rounded-[40px] border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-accent/5 px-8 py-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-manrope font-black">Base de Dados Global</CardTitle>
              <CardDescription className="font-medium text-sm">Filtre por evento ou busque diretamente pelo nome do participante.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 py-8">
           {/* Passamos o activeTenant.id ou filtramos dentro do componente se necessário, 
               mas aqui o componente espera eventId. Vamos adaptar ou buscar todos do tenant. */}
           <IssuedTicketsList eventId="" /> 
        </CardContent>
      </Card>
    </div>
  );
}
