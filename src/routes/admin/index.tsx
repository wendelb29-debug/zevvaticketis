import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardBI } from "@/components/dashboard/AdminDashboardBI";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardBI,
});
