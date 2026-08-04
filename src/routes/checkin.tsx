import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkin")({
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-heading text-primary">Check-in</h1>
        <p className="mt-4 text-foreground">App de leitura de QR Code em breve.</p>
      </div>
    </div>
  ),
});
