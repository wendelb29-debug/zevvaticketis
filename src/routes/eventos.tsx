import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/eventos")({
  component: () => (
    <div className="p-8">
      <h1 className="text-3xl font-heading text-primary">Eventos</h1>
      <p className="mt-4 text-foreground">Catálogo de eventos internacionais em breve.</p>
    </div>
  ),
});
