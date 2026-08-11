import { createFileRoute } from "@tanstack/react-router";
import { CheckinStats } from "@/components/admin/checkin/CheckinStats";

export const Route = createFileRoute("/admin/checkin/")({
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-manrope font-black text-navy tracking-tight">Gestão de Check-in</h1>
        <p className="text-muted font-medium">Análise de presença, performance de campanhas e inteligência de acesso.</p>
      </div>
      <CheckinStats />
    </div>
  );
}
