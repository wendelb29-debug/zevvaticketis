import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FileText, Download, Filter, User, Calendar, Tag, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const Route = createFileRoute("/checkin/$projectId/event/$id/relatorios")({
  component: ReportsPage,
});

function ReportsPage() {
  const { id: eventId } = useParams({ from: "/checkin/event/$id/relatorios" });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  useEffect(() => {
    async function loadTickets() {
      const { data } = await supabase
        .from("tickets")
        .select("*, profiles:owner_id(full_name, email)")
        .eq("event_id", eventId);
      
      setTickets(data || []);
      setLoading(false);
    }
    loadTickets();
  }, [eventId]);

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === "todos") return true;
    if (filterStatus === "presente") return t.status === "utilizado";
    if (filterStatus === "faltante") return t.status !== "utilizado";
    return true;
  });

  const exportCSV = () => {
    const headers = ["Nome", "Email", "Status", "Data Check-in"];
    const rows = filteredTickets.map(t => [
      t.profiles?.full_name || "N/A",
      t.profiles?.email || "N/A",
      t.status === 'utilizado' ? 'Presente' : 'Faltante',
      t.checked_in_at ? new Date(t.checked_in_at).toLocaleString('pt-BR') : "-"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `relatorio_checkin_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.text("ZEVVA TICKETS - Relatório de Presença", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Evento: ${eventId}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

    const tableData = filteredTickets.map(t => [
      t.profiles?.full_name || "N/A",
      t.profiles?.email || "N/A",
      t.status === 'utilizado' ? 'Presente' : 'Faltante',
      t.checked_in_at ? new Date(t.checked_in_at).toLocaleString('pt-BR') : "-"
    ]);

    doc.autoTable({
      head: [["Nome", "Email", "Status", "Check-in"]],
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [5, 7, 15] }
    });

    doc.save(`relatorio_checkin_${eventId}.pdf`);
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Relatórios</h2>
          <p className="text-slate-500 font-medium">Gestão de participantes e auditoria de entrada.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-black uppercase text-xs" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button className="bg-coral hover:bg-coral-dark text-white rounded-xl font-black uppercase text-xs" onClick={exportPDF}>
            <FileText className="w-4 h-4 mr-2" /> PDF Profissional
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm flex gap-4">
         <div className="flex-1 flex gap-2">
            {['todos', 'presente', 'faltante'].map((s) => (
              <Button 
                key={s}
                variant={filterStatus === s ? 'default' : 'outline'}
                className={cn(
                  "rounded-full px-6 font-black uppercase text-[10px] tracking-widest",
                  filterStatus === s ? "bg-navy" : "text-slate-500"
                )}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </Button>
            ))}
         </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-in</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-navy uppercase">{t.profiles?.full_name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{t.profiles?.email}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    t.status === 'utilizado' 
                      ? "bg-good/10 text-good border-good/20" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {t.status === 'utilizado' ? 'Presente' : 'Ausente'}
                  </span>
                </td>
                <td className="p-6 text-xs font-bold text-slate-500">
                  {t.checked_in_at ? new Date(t.checked_in_at).toLocaleString('pt-BR') : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
