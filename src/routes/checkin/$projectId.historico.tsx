import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { History, Search, Download, Calendar, Ticket, User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/checkin/$projectId/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const { projectId } = useParams({ from: "/checkin/$projectId/historico" });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      let tenantId = projectId;
      const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", projectId).maybeSingle();
      if (tenant) tenantId = tenant.id;

      const { data } = await supabase
        .from("checkin_records")
        .select(`
          id,
          status,
          checkin_date,
          checkin_time,
          tickets(name, qr_code),
          events(title, location),
          profiles:operator_id(full_name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      setLogs(data || []);
      setLoading(false);
    }
    loadLogs();
  }, [projectId]);

  if (loading) return <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Carregando histórico...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Histórico de Operação</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Registros de entradas e validações</p>
        </div>
        <Button className="bg-navy hover:bg-navy/90 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum registro encontrado</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-navy uppercase">{new Date(log.checkin_date).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{log.checkin_time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-navy" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-navy uppercase truncate">N/A</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate">#{log.tickets?.qr_code?.substring(0,8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-navy uppercase truncate">{log.events?.title}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{log.events?.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-navy uppercase">{log.profiles?.full_name || 'Sistema'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700">
                      Sucesso
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
