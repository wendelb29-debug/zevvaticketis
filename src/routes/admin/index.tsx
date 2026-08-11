import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPanel } from "@/components/dashboard/AdminDashboardPanel";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPanel,
});
