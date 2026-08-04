import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-heading text-primary">Área do Participante</h1>
      <Outlet />
    </div>
  ),
});
