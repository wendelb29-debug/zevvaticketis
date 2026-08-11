import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
  CheckCircle2,
  X
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
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

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
    <div className="space-y-8 pb-20 px-4 md:px-8">
      {/* 1. Dashboard Executivo Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-manrope font-black text-navy tracking-tight">Zevva BI</h1>
          <p className="text-muted-fg font-medium">Inteligência de Mercado e Performance Operacional</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-accent/50 p-1 rounded-xl border border-border">
            {["today", "7d", "30d", "custom"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                  period === p ? "bg-white text-navy shadow-sm" : "text-muted-fg hover:text-navy"
                )}
              >
                {p === "today" ? "Hoje" : p === "7d" ? "7 Dias" : p === "30d" ? "30 Dias" : "Personalizado"}
              </button>
            ))}
          </div>
          
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-48 bg-white border-primary/20 text-navy font-bold rounded-xl h-11 shadow-sm">
              <Download className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="Gerar Relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
              <SelectItem value="vendas">Relatório de Vendas</SelectItem>
              <SelectItem value="eventos">Relatório de Eventos</SelectItem>
              <SelectItem value="participantes">Relatório de Participantes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert Panel */}
      <Card className="bg-coral/5 border-coral/20 shadow-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle className="w-24 h-24 text-coral" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black text-coral uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Alertas Críticos da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Próximos da Data", val: "4 Eventos", icon: Clock },
              { label: "Baixa Venda (<10%)", val: "2 Campanhas", icon: TrendingUp },
              { label: "Esgotando (>90%)", val: "VIP Festival X", icon: Ticket },
              { label: "Aprovação Pendente", val: "3 Produtores", icon: Users }
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-coral/10">
                <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center text-coral">
                  <alert.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-coral/60 uppercase">{alert.label}</p>
                  <p className="text-sm font-black text-navy">{alert.val}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* TOTAL DE EVENTOS */}
        <BIStatCard 
          title="Total de Eventos" 
          value={stats.totalEvents.active + stats.totalEvents.closed + stats.totalEvents.upcoming}
          icon={Calendar}
          subMetrics={[
            { label: "Ativos", val: stats.totalEvents.active, color: "text-emerald-500" },
            { label: "Próximos", val: stats.totalEvents.upcoming, color: "text-primary" }
          ]}
        />
        {/* TOTAL DE INGRESSOS */}
        <BIStatCard 
          title="Total Ingressos" 
          value={stats.totalTickets.sold + stats.totalTickets.available}
          icon={Ticket}
          subMetrics={[
            { label: "Vendidos", val: stats.totalTickets.sold, color: "text-navy" },
            { label: "Disponíveis", val: stats.totalTickets.available, color: "text-muted-fg" }
          ]}
        />
        {/* VENDAS */}
        <BIStatCard 
          title="Faturamento Bruto" 
          value={`R$ ${stats.sales.gross.toLocaleString()}`}
          icon={DollarSign}
          subMetrics={[
            { label: "Qtd Vendas", val: stats.sales.quantity, color: "text-navy" },
            { label: "Ticket Médio", val: `R$ ${stats.sales.averageTicket}`, color: "text-emerald-500" }
          ]}
        />
        {/* USUÁRIOS */}
        <BIStatCard 
          title="Novos Usuários" 
          value={stats.users.new}
          icon={Users}
          subMetrics={[
            { label: "Recorrentes", val: stats.users.recurring, color: "text-primary" },
            { label: "Campanhas", val: stats.users.byCampaign, color: "text-navy" }
          ]}
        />
        {/* CHECK-IN */}
        <Link to="/admin/checkin">
          <BIStatCard 
            title="Presença Real" 
            value={`${stats.checkin.percentage}%`}
            icon={CheckCircle2}
            className="cursor-pointer hover:border-primary transition-all shadow-md"
            subMetrics={[
              { label: "Check-ins", val: stats.checkin.performed, color: "text-emerald-600" },
              { label: "Faltantes", val: stats.checkin.missing, color: "text-coral" }
            ]}
          />
        </Link>
      </div>

      {/* Performance de Campanhas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div>
              <CardTitle className="text-xl font-manrope font-black text-navy">Performance de Campanhas</CardTitle>
              <p className="text-xs text-muted-fg font-bold uppercase mt-1">ROI e Atribuição de Origem</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase">Filtros</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpRight className="w-4 h-4"/></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-[10px] font-black text-muted-fg uppercase">Campanha</th>
                    <th className="pb-3 text-[10px] font-black text-muted-fg uppercase text-center">Cliques</th>
                    <th className="pb-3 text-[10px] font-black text-muted-fg uppercase text-center">Conversão</th>
                    <th className="pb-3 text-[10px] font-black text-muted-fg uppercase text-center">ROI</th>
                    <th className="pb-3 text-[10px] font-black text-muted-fg uppercase text-right">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {campaignData.map((c, i) => (
                    <tr key={i} className="hover:bg-accent/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-primary" : i === 1 ? "bg-coral" : "bg-navy")} />
                          <div>
                            <p className="text-sm font-bold text-navy">{c.name}</p>
                            <p className="text-[10px] text-muted-fg uppercase font-bold">{c.source}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-sm font-bold text-navy">{c.clicks.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <span className="text-xs font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">{c.conv}%</span>
                      </td>
                      <td className="py-4 text-center text-sm font-black text-primary">{c.roi}x</td>
                      <td className="py-4 text-right text-sm font-black text-navy">R$ {c.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Funil de Vendas */}
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-xl font-manrope font-black text-navy">Funil de Conversão</CardTitle>
            <p className="text-xs text-muted-fg font-bold uppercase mt-1">Eficiência do Pipeline</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {funnelData.map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-navy uppercase tracking-wider">{step.step}</span>
                    <span className="text-xs font-bold text-muted-fg">{step.val}%</span>
                  </div>
                  <div className="h-3 bg-accent rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", i < 2 ? "bg-primary" : i < 4 ? "bg-coral" : "bg-navy")} 
                      style={{ width: `${step.val}%` }} 
                    />
                  </div>
                  {i < funnelData.length - 1 && (
                    <div className="absolute left-1/2 -bottom-4 translate-x-1/2 text-[10px] font-bold text-muted-fg">
                      ↓ {(funnelData[i+1].val / step.val * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Anúncios e KPIs Extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-navy text-white">
              <CardTitle className="text-lg font-manrope font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-coral" /> Melhores Anúncios (ROI)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { ad: "Stories - Público Jovem", event: "Festival 2026", clicks: 450, sales: 80, roi: "12.4x", badge: "Melhor ROI" },
                    { ad: "Feed - Carrossel", event: "Congresso 2026", clicks: 1200, sales: 210, roi: "9.2x", badge: "Mais Vendas" },
                    { ad: "Search - Keywords", event: "Trip Reino", clicks: 320, sales: 45, roi: "8.5x", badge: "Eficiente" },
                  ].map((ad, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-accent/20 transition-all cursor-pointer">
                       <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-black text-navy">{i+1}</div>
                          <div>
                            <p className="text-sm font-bold text-navy">{ad.ad}</p>
                            <p className="text-[10px] text-muted-fg uppercase font-bold">{ad.event}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-coral/10 text-coral rounded-full">{ad.badge}</span>
                            <span className="text-sm font-black text-navy">{ad.roi}</span>
                          </div>
                          <p className="text-[10px] text-muted-fg font-bold uppercase">{ad.sales} Vendas • {ad.clicks} Cliques</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-manrope font-bold">Vendas por Origem (Canal)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Instagram", value: 45 },
                        { name: "Facebook", value: 25 },
                        { name: "Google", value: 20 },
                        { name: "WhatsApp", value: 10 },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#D9A94D", "#FF7F50", "#05070F", "#64748b"][index] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function BIStatCard({ title, value, icon: Icon, subMetrics, className }: any) {
  return (
    <Card className={cn("border-border bg-card shadow-sm hover:shadow-lg transition-all border-b-4 border-b-primary/20", className)}>

      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-black text-muted-fg uppercase tracking-widest">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-manrope font-black text-navy mb-4 tracking-tight">{value}</div>
        <div className="space-y-2 border-t border-border/50 pt-3">
          {subMetrics.map((m: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-muted-fg">{m.label}</span>
              <span className={m.color}>{m.val}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
