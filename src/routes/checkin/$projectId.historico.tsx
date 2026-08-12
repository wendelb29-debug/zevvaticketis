import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkin/$projectId/historico")({
  component: () => <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo de Histórico em Desenvolvimento</div>,
});
