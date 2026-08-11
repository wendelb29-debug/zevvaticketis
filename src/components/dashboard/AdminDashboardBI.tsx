import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Ticket,
  Percent,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";

export function AdminDashboardBI() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    // Here we'd orchestrate fetching from all BI tables
    setLoading(false);
  }

  const handleExport = (type: 'PDF' | 'Excel') => {
    if (type === 'PDF') {
      exportToPDF("Relatório de BI", [], ["Métrica", "Valor"], "bi_report");
    } else {
      exportToExcel([], "bi_report", "Dashboard");
    }
    toast.success(`${type} gerado com sucesso.`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Business Intelligence</h1>
          <p className="text-muted-fg">Central estratégica de decisão comercial.</p>
        </div>
        <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Periodo" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => handleExport('PDF')} variant="outline"><FileText className="w-4 h-4 mr-2"/> PDF</Button>
            <Button onClick={() => handleExport('Excel')} variant="outline"><Download className="w-4 h-4 mr-2"/> Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-amber-50 border-amber-200">
            <CardHeader><CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Alertas Críticos</CardTitle></CardHeader>
            <CardContent>
                <ul className="text-sm text-amber-800 space-y-2">
                    <li>⚠️ Festival X: Apenas 5 ingressos restantes</li>
                    <li>⚠️ Congresso Y: Baixa conversão (1.2%)</li>
                    <li>⚠️ Pagamento pendente: Produtor Z (3 dias)</li>
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Vendas vs Meta</CardTitle></CardHeader>
            <CardContent className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Vendas', val: 70}, {name: 'Meta', val: 100}]}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="val" fill="#D9A94D"/>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-sm font-bold">Conversão Check-in</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-40">
                <div className="text-4xl font-black text-emerald-600">84%</div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
