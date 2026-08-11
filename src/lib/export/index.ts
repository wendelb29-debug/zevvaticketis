import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportOptions {
  title: string;
  fileName: string;
  periodLabel?: string;
  activeFilters?: string[];
  summary?: { label: string; value: string | number }[];
}

export function exportToPDF(data: any[], columns: { header: string; key: string }[], options: ExportOptions) {
  const doc = new jsPDF();
  const timestamp = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(5, 7, 15); // Navy
  doc.text("ZEVVA TICKETS", 14, 20);
  
  doc.setFontSize(14);
  doc.text(options.title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${timestamp}`, 14, 38);
  if (options.periodLabel) {
    doc.text(`Período: ${options.periodLabel}`, 14, 44);
  }

  // Summary Executive
  if (options.summary && options.summary.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(5, 7, 15);
    doc.text("Resumo Executivo", 14, 55);
    
    let y = 62;
    options.summary.forEach(item => {
      doc.setFontSize(10);
      doc.text(`${item.label}:`, 14, y);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.value), 60, y);
      doc.setFont("helvetica", "normal");
      y += 6;
    });
  }

  // Active Filters
  if (options.activeFilters && options.activeFilters.length > 0) {
    const filtersY = options.summary ? 62 + (options.summary.length * 6) + 5 : 55;
    doc.setFontSize(10);
    doc.text(`Filtros aplicados: ${options.activeFilters.join(" | ")}`, 14, filtersY);
  }

  // Table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => String(row[col.key] ?? ""))),
    startY: options.summary ? 62 + (options.summary.length * 6) + 15 : 65,
    theme: 'striped',
    headStyles: { fillStyle: 'fill', fillColor: [5, 7, 15], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${options.fileName}_${format(new Date(), "yyyyMMdd")}.pdf`);
}

export function exportToExcel(sheets: { name: string; data: any[] }[], fileName: string) {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  XLSX.writeFile(wb, `${fileName}_${format(new Date(), "yyyyMMdd")}.xlsx`);
}
