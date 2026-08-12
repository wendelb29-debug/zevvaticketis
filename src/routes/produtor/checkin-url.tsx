import { createFileRoute } from "@tanstack/react-router";
import { CheckinUrlManager } from "@/components/admin/checkin/CheckinUrlManager";

export const Route = createFileRoute("/produtor/checkin-url" as any)({
  component: CheckinUrlManager,
});
