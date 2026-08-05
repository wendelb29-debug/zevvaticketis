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

  if (isLoading) return <div>Carregando logs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Auditoria do Sistema</h1>
      
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-muted text-xs font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Alvo</th>
              <th className="px-6 py-4">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs?.map((log: any) => (
              <tr key={log.id}>
                <td className="px-6 py-4 font-bold text-navy">{log.profiles?.nome || 'Sistema'}</td>
                <td className="px-6 py-4">{log.acao}</td>
                <td className="px-6 py-4">{log.alvo_tipo} ({log.alvo_id})</td>
                <td className="px-6 py-4 text-xs text-muted">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted">Nenhum log de auditoria encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}