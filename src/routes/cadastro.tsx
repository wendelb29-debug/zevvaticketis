import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cadastro")({
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-lg border">
        <h1 className="text-2xl font-heading text-primary text-center">Cadastro</h1>
        <p className="mt-2 text-center text-muted-foreground">Crie sua conta na Zevva.</p>
      </div>
    </div>
  ),
});
