import { createFileRoute } from "@tanstack/react-router";
import { TicketManagementDashboard } from "@/components/tickets/TicketManagementDashboard";

export const Route = createFileRoute("/admin/ingressos")({
  component: AdminTicketManagementPage,
});

function AdminTicketManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <TicketManagementDashboard scope="platform-admin" />
    </div>
  );
}
