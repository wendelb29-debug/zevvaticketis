import { createFileRoute } from "@tanstack/react-router";
import { ProducerDashboardPanel } from "@/components/dashboard/ProducerDashboardPanel";

export const Route = createFileRoute("/produtor/")({
  component: ProducerDashboardPanel,
});
