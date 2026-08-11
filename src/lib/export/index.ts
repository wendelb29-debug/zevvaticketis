import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportToPDF(title: string, data: any[], columns: string[], fileName: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  autoTable(doc, {
    head: [columns],
    body: data.map(row => columns.map(col => String(row[col] ?? ""))),
    startY: 25,
  });
  doc.save(`${fileName}.pdf`);
}

export function exportToExcel(data: any[], fileName: string, sheetName: string = "Sheet1") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
