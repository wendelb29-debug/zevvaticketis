import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkin/$projectId/presenca")({
  component: () => <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo de Presença em Desenvolvimento</div>,
});
