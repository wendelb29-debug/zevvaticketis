import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/envios-massivos")({
  component: EnviosMassivosPage,
});

function EnviosMassivosPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-manrope font-bold mb-6">Envios Massivos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total enviadas", value: "0" },
          { label: "Entregues", value: "0" },
          { label: "Falharam", value: "0" },
        ].map((card, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <p className="text-sm text-muted-fg">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Campanhas</h2>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
          + Nova Campanha
        </button>
      </div>
      
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-fg">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-fg">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-fg">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-fg">Data</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-fg">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-fg">Nenhuma campanha encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
