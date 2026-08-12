import { createFileRoute } from "@tanstack/react-router";
import { CheckinDashboard } from "@/components/admin/CheckinDashboard";

export const Route = createFileRoute("/produtor/checkin")({
  component: CheckinDashboard,
});
