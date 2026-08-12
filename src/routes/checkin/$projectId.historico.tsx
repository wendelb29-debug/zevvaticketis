import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { History, Search, Download, Calendar, Ticket, User, MapPin, Filter, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { DateTime } from "luxon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkin/$projectId/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const { projectId } = useParams({ from: "/checkin/$projectId/historico" });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

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

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = searchTerm === "" || 
        log.tickets?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.tickets?.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.events?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDate = dateFilter === "" || log.checkin_date === dateFilter;
      
      const matchUser = userFilter === "" || 
        log.profiles?.full_name?.toLowerCase().includes(userFilter.toLowerCase());

      return matchSearch && matchDate && matchUser;
    });
  }, [logs, searchTerm, dateFilter, userFilter]);

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    
    const headers = ["Data", "Hora", "Participante", "QR Code", "Evento", "Operador", "Status"];
    const rows = filteredLogs.map(log => [
      DateTime.fromISO(log.checkin_date).toFormat('dd/MM/yyyy'),
      log.checkin_time,
      log.tickets?.name || "N/A",
      log.tickets?.qr_code || "",
      log.events?.title || "",
      log.profiles?.full_name || "Sistema",
      log.status === 'sucesso' ? "SUCESSO" : "ERRO"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `checkin_historico_${projectId}_${DateTime.now().toFormat('yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const exportPDF = () => {
    if (filteredLogs.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text("Relatório de Check-in - Zevva Staff", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Projeto: ${projectId} | Gerado em: ${DateTime.now().toFormat('dd/MM/yyyy HH:mm')}`, 14, 30);

    const tableHeaders = [["Data/Hora", "Participante", "Evento", "Operador", "Status"]];
    const tableData = filteredLogs.map(log => [
      `${DateTime.fromISO(log.checkin_date).toFormat('dd/MM/yyyy')} ${log.checkin_time}`,
      `${log.tickets?.name || 'N/A'}\n#${log.tickets?.qr_code?.substring(0,8)}`,
      log.events?.title || "",
      log.profiles?.full_name || "Sistema",
      log.status.toUpperCase()
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillStyle: 'dark', fillColor: [15, 23, 42] },
      styles: { fontSize: 8, font: 'helvetica' }
    });

    doc.save(`checkin_relatorio_${projectId}_${DateTime.now().toFormat('yyyyMMdd_HHmm')}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  if (loading) return <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Carregando histórico...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Histórico de Operação</h2>
          <p className="text-xs font-black text-coral uppercase tracking-widest mt-1 opacity-80">Projeto: {projectId}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportCSV}
            variant="outline"
            className="border-slate-200 text-navy rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2 bg-white"
          >
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button 
            onClick={exportPDF}
            className="bg-navy hover:bg-navy/90 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2 shadow-lg"
          >
            <FileText className="w-4 h-4 text-coral" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar participante ou evento..." 
            className="pl-10 h-12 rounded-xl border-slate-200 font-bold focus:ring-coral/20 focus:border-coral transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            type="date"
            className="pl-10 h-12 rounded-xl border-slate-200 font-bold focus:ring-coral/20 focus:border-coral transition-all bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Filtrar por Operador..." 
            className="pl-10 h-12 rounded-xl border-slate-200 font-bold focus:ring-coral/20 focus:border-coral transition-all bg-white"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
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
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Nenhum registro encontrado para estes filtros</p>
                    <Link 
                      to="/checkin/$projectId"
                      params={{ projectId }}
                      className="inline-flex items-center justify-center px-4 py-2 bg-navy/5 text-navy border border-navy/10 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-navy/10 transition-all"
                    >
                      Selecionar outro evento
                    </Link>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-navy uppercase">{DateTime.fromISO(log.checkin_date).toFormat('dd/MM/yyyy')}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{log.checkin_time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-navy" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-navy uppercase truncate">{log.tickets?.name || 'N/A'}</span>
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
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter",
                      log.status === 'sucesso' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {log.status === 'sucesso' ? "Sucesso" : "Falha"}
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
