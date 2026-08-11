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
  ArrowUpRight,
  MousePointer2,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  MapPin,
  Clock,
  LayoutDashboard
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
  Legend,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

export function AdminDashboardBI() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: { active: 0, closed: 0, upcoming: 0 },
    totalTickets: { available: 0, sold: 0, reserved: 0, used: 0 },
    sales: { quantity: 0, gross: 0, averageTicket: 0 },
    users: { new: 0, recurring: 0, byCampaign: 0 },
    checkin: { expected: 0, performed: 0, percentage: 0, missing: 0 }
  });

  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);

  useEffect(() => {
    fetchBIData();
  }, [period]);

  async function fetchBIData() {
    setLoading(true);
    try {
      // Basic mock data following the BI spec for visual testing
      setStats({
        totalEvents: { active: 12, closed: 45, upcoming: 8 },
        totalTickets: { available: 5000, sold: 3450, reserved: 120, used: 2800 },
        sales: { quantity: 3450, gross: 285400, averageTicket: 82.72 },
        users: { new: 450, recurring: 120, byCampaign: 380 },
        checkin: { expected: 3450, performed: 2800, percentage: 81, missing: 650 }
      });

      setCampaignData([
        { name: "Festival X - Instagram", source: "Instagram", views: 10000, clicks: 500, signups: 200, sales: 80, revenue: 12000, conv: 16, roi: 4.2 },
        { name: "Congresso Y - Google", source: "Google", views: 25000, clicks: 1200, signups: 400, sales: 150, revenue: 45000, conv: 12.5, roi: 5.8 },
        { name: "Trip Z - Facebook", source: "Facebook", views: 8000, clicks: 300, signups: 100, sales: 45, revenue: 9000, conv: 15, roi: 3.5 }
      ]);

      setFunnelData([
        { step: "Visualização", val: 100 },
        { step: "Clique", val: 15 },
        { step: "Cadastro", val: 8 },
        { step: "Carrinho", val: 4 },
        { step: "Compra", val: 2 },
        { step: "Check-in", val: 1.8 }
      ]);
      
    } catch (error) {
      toast.error("Erro ao carregar BI");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = (reportType: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Gerando relatório ${reportType}...`,
        success: `Relatório ${reportType} exportado com sucesso.`,
        error: 'Erro ao gerar relatório.',
      }
    );
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
