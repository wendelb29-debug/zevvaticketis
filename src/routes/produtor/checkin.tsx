import { createFileRoute } from "@tanstack/react-router";
import { CheckinStats } from "@/components/admin/checkin/CheckinStats";

export const Route = createFileRoute("/produtor/checkin")({
  component: CheckinStats,
});
