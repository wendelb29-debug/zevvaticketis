import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mail, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/emails")({
  component: EmailsPage,
});

function EmailsPage() {
  const [filter, setFilter] = useState("todos");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["email-logs", filter],
    queryFn: async () => {
      // @ts-ignore
      let query = supabase.from("email_logs").select("*").order("enviado_em", { ascending: false });
      // @ts-ignore
      if (filter !== "todos") query = query.eq("status", filter);
      const { data } = await query;
      return data;
    }
  });

  if (isLoading) return <div>Carregando logs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Histórico de E-mails</h1>
      
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface text-muted text-xs font-extrabold uppercase">
            <tr>
              <th className="px-6 py-4">Destinatário</th>
              <th className="px-6 py-4">Assunto</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs?.map((log: any) => (
              <tr key={log.id}>
                <td className="px-6 py-4 font-medium text-navy">{log.destinatario}</td>
                <td className="px-6 py-4 text-sm">{log.assunto}</td>
                <td className="px-6 py-4 text-sm">{log.tipo}</td>
                <td className="px-6 py-4">
                  <span className={log.status === 'enviado' ? 'text-green-600' : 'text-red-600'}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted">
                  {new Date(log.enviado_em).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}