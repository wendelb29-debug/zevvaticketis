import { DashboardWithSidebar } from "@/components/ui/dashboard-with-collapsible-sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lovable/demo-dashboard")({
  head: () => ({
    title: "Demo Dashboard | Zevva Tickets",
    meta: [
      { name: "description", content: "Premium dashboard with collapsible sidebar demo." },
    ],
  }),
  component: DemoDashboard,
});

function DemoDashboard() {
  return <DashboardWithSidebar />;
}
