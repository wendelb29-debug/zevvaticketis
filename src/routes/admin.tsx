import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-heading text-primary">Painel Administrativo</h1>
      <Outlet />
    </div>
  ),
});
