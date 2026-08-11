import { createFileRoute } from "@tanstack/react-router";
import { ProducerDashboardPanel } from "@/components/dashboard/ProducerDashboardPanel";
import { useTenants } from "@/hooks/use-tenants";
import { useEffect } from "react";

export const Route = createFileRoute("/produtor/$id/dashboard")({
  component: ProducerWorkspaceDashboard,
});

function ProducerWorkspaceDashboard() {
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <ProducerDashboardPanel />;
}
