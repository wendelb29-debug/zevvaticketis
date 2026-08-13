import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Ticket,
  Percent,
  ChevronRight,
  Download,
  FileText,
  Filter
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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export function AdminDashboardPanel() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    pendingEvents: 0,
    closedEvents: 0,
    totalUsers: 0,
    participants: 0,
    producers: 0,
    staff: 0,
    ticketsSold: 0,
    grossValue: 0,
    zevvaRevenue: 0,
    producerPayout: 0,
    conversionRate: 0
  });

  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Basic counts
      const { count: eventsCount } = await supabase.from("events").select("*", { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from("events").select("*", { count: 'exact', head: true }).eq("status", "publicado");
      const { count: pendingCount } = await supabase.from("events").select("*", { count: 'exact', head: true }).eq("status", "aguardando_aprovacao");
      
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
      const { count: producersCount } = await supabase.from("tenants").select("*", { count: 'exact', head: true });

      // Financials
      const { data: orders } = await supabase.from("orders").select("*").eq("status", "pago");
      
      const ticketsSold = orders?.length || 0;
      const grossValue = orders?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
      const zevvaRevenue = orders?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;
      const producerPayout = orders?.reduce((acc, curr) => acc + (Number(curr.valor_liquido_produtor) || 0), 0) || 0;

      setStats({
        totalEvents: eventsCount || 0,
        activeEvents: activeCount || 0,
        pendingEvents: pendingCount || 0,
        closedEvents: (eventsCount || 0) - (activeCount || 0) - (pendingCount || 0),
        totalUsers: usersCount || 0,
        participants: (usersCount || 0) - (producersCount || 0),
        producers: producersCount || 0,
        staff: 0,
        ticketsSold,
        grossValue,
        zevvaRevenue,
        producerPayout,
        conversionRate: 3.2 // Mock for now
      });

      // Mock chart data based on period
      const days = period === "7d" ? 7 : 30;
      const mockSales = Array.from({ length: days }).map((_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), "dd/MM"),
        vendas: Math.floor(Math.random() * 50) + 10
      }));
      setSalesData(mockSales);

      const mockRevenue = [
        { name: "Jan", vendas: 4000, comissao: 400, repasse: 3600 },
        { name: "Fev", vendas: 3000, comissao: 300, repasse: 2700 },
        { name: "Mar", vendas: 2000, comissao: 200, repasse: 1800 },
      ];
      setRevenueData(mockRevenue);

      // Top events
      const { data: topEventsData } = await supabase
        .from("events")
        .select("id, title, status")
        .limit(5);
      
      setTopEvents(topEventsData?.map((e, i) => ({
        rank: i + 1,
        title: e.title,
        quantity: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 10000) + 2000
      })) || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }

  const handleExportPDF = () => {
    const data = [
      { Categoria: "Eventos Ativos", Valor: stats.activeEvents },
      { Categoria: "Eventos Pendentes", Valor: stats.pendingEvents },
      { Categoria: "Vendas Totais", Valor: stats.ticketsSold },
      { Categoria: "Receita Zevva", Valor: `R$ ${stats.zevvaRevenue}` }
    ];
    exportToPDF(data, [{ header: "Categoria", key: "Categoria" }, { header: "Valor", key: "Valor" }], { title: "Relatório Executivo Zevva", fileName: "relatorio_executivo" });
    toast.success("PDF gerado com sucesso");
  };

  const handleExportExcel = () => {
    const data = [
      { "Indicador": "Eventos Totais", "Valor": stats.totalEvents },
      { "Indicador": "Usuários Totais", "Valor": stats.totalUsers },
      { "Indicador": "Vendas Brutas", "Valor": stats.grossValue },
      { "Indicador": "Comissão Plataforma", "Valor": stats.zevvaRevenue }
    ];
    exportToExcel([{ name: "Resumo", data }], "dashboard_zevva");
    toast.success("Excel gerado com sucesso");
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground-fg">Visão estratégica da plataforma Zevva Tickets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10" onClick={handleExportPDF}>
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10" onClick={handleExportExcel}>
            <Download className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-muted-foreground-fg">TOTAL DE EVENTOS</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-foreground">{stats.totalEvents}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Ativos</span>
                <span className="font-bold text-emerald-500">{stats.activeEvents}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Pendentes</span>
                <span className="font-bold text-amber-500">{stats.pendingEvents}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-muted-foreground-fg">TOTAL DE USUÁRIOS</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-foreground">{stats.totalUsers}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Participantes</span>
                <span className="font-bold">{stats.participants}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Produtores</span>
                <span className="font-bold">{stats.producers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-muted-foreground-fg">VENDAS TOTAIS</CardTitle>
            <Ticket className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-foreground">{stats.ticketsSold}</div>
            <div className="mt-1 text-xs font-bold text-emerald-500">
              R$ {stats.grossValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-muted-foreground-fg mt-1">Ingressos vendidos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-muted-foreground-fg">RECEITA ZEVVA</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-manrope font-extrabold text-foreground">
              R$ {stats.zevvaRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Comissão Zevva</span>
                <span className="font-bold text-emerald-500">R$ {stats.zevvaRevenue}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground-fg">Taxa Conv.</span>
                <span className="font-bold text-primary">{stats.conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Card */}
      <Card className="bg-sidebar text-foreground border border-border shadow-xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Valor total repassado a produtores</p>
            <h2 className="text-4xl font-manrope font-black mt-1">
              R$ {stats.producerPayout.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl flex items-center gap-4 border border-primary/20">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Taxa de Conversão Média</p>
              <p className="text-2xl font-black text-primary">{stats.conversionRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-manrope font-bold">Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#D9A94D" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#D9A94D" }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-manrope font-bold">Receita da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#05070F" radius={[4, 4, 0, 0]} name="Vendas" />
                <Bar dataKey="comissao" fill="#D9A94D" radius={[4, 4, 0, 0]} name="Comissão Zevva" />
                <Bar dataKey="repasse" fill="#FF7F50" radius={[4, 4, 0, 0]} name="Repasse Produtor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-manrope font-bold">Eventos Mais Vendidos</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">Ver Ranking Completo</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEvents.map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                      i === 0 ? "bg-amber-100 text-amber-600" :
                      i === 1 ? "bg-slate-100 text-muted-foreground" :
                      i === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-accent text-muted-foreground-fg"
                    )}>
                      {event.rank}º
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground-fg uppercase font-bold">{event.quantity} Ingressos vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">R$ {event.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Faturamento</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-manrope font-bold">Categorias Mais Rentáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: "Congressos", value: 85, color: "bg-primary" },
                { label: "Festivais", value: 65, color: "bg-primary" },
                { label: "Caravanas", value: 45, color: "bg-emerald-500" },
                { label: "Experiências", value: 30, color: "bg-blue-500" },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">{cat.label}</span>
                    <span className="text-primary">{cat.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: `${cat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
