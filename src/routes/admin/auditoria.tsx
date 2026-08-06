import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/auditoria")({
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      // Use any to bypass schema types until types are regenerated
      const { data } = await (supabase
        .from("audit_logs" as any)
        .select("*, profiles(nome)")
        .order("created_at", { ascending: false }) as any);
      return data;
    }
  });

  if (isLoading) return <div className="p-10 text-center text-muted-fg">Carregando logs...</div>;

  return (
    <div className="space-y-6 text-foreground">
      <h1 className="text-2xl font-manrope font-extrabold">Auditoria do Sistema</h1>
      <p className="text-muted-fg text-sm">eu localizar rapidamente ações por tipo, usuário e intervalo de datas. Implemente filtros e busca na aba de Auditoria para eu localizar rapidamente ações por tipo, usuário e intervalo de datas. Adicione a opção de exportar os registros da Auditoria em CSV (e/ou PDF) para eu baixar e compartilhar o histórico.</p>
      
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-accent text-muted-fg text-xs font-extrabold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Alvo</th>
              <th className="px-6 py-4">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{log.profiles?.nome || 'Sistema'}</td>
                <td className="px-6 py-4 text-sm">{log.acao}</td>
                <td className="px-6 py-4 text-sm font-medium">{log.alvo_tipo} <span className="text-muted-fg font-normal">({log.alvo_id})</span></td>
                <td className="px-6 py-4 text-xs text-muted-fg font-inter">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-fg font-inter">Nenhum log de auditoria encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
