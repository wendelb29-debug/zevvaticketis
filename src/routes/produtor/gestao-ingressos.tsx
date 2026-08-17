import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenants } from "@/hooks/use-tenants";
import { TicketManagementDashboard } from "@/components/tickets/TicketManagementDashboard";

export const Route = createFileRoute("/produtor/gestao-ingressos")({
  component: ProducerTicketManagementPage,
});

function ProducerTicketManagementPage() {
  const { activeTenant } = useTenants();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <TicketManagementDashboard scope="producer" tenantId={activeTenant?.id} />
    </div>
  );
}
