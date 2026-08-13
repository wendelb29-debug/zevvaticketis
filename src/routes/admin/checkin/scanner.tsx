import { createFileRoute } from "@tanstack/react-router";
import { ScannerComponent } from "@/components/admin/checkin/ScannerComponent";

export const Route = createFileRoute("/admin/checkin/scanner")({
  component: ScannerPage,
});

function ScannerPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-4xl font-manrope font-black text-foreground tracking-tight">Validação de Acesso</h1>
        <p className="text-muted-foreground font-medium">Utilize a câmera para escanear os QR Codes dos participantes.</p>
      </div>
      <ScannerComponent />
    </div>
  );
}
