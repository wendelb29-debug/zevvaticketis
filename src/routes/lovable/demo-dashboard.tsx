import { DashboardWithSidebar } from "@/components/ui/dashboard-with-collapsible-sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lovable/demo-dashboard")({
  component: DemoDashboard,
});

function DemoDashboard() {
  return <DashboardWithSidebar />;
}
