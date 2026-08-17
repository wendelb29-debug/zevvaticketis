import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  Ticket, 
  Users, 
  CheckCircle2, 
  UserX, 
  TrendingUp, 
  BarChart3,
  Filter,
  Download,
  Search,
  Calendar,
  MapPin,
  Tag,
  ArrowRight
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
  Cell,
  PieChart,
  Pie
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CheckinStats() {
  const { activeTenant } = useTenants();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSold: 0,
    totalCheckins: 0,
    totalPresent: 0,
    totalMissing: 0,
    presenceRate: 0,
    absenceRate: 0
  });

  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [adData, setAdData] = useState<any[]>([]);

  useEffect(() => {
    if (activeTenant) {
      fetchCheckinStats();
    }
  }, [activeTenant]);

  async function fetchCheckinStats() {
    setLoading(true);
    try {
      // 1. Get stats for all events of this tenant
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title")
        .eq("tenant_id", activeTenant!.id);

      const eventIds = eventsData?.map(e => e.id) || [];
      
      if (eventIds.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch ticket stats
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, status")
        .in("event_id", eventIds);

      const totalSold = tickets?.length || 0;
      const totalCheckins = tickets?.filter(t => t.status === 'utilizado' || t.status === 'presente').length || 0;
      const totalMissing = totalSold - totalCheckins;
      const presenceRate = totalSold > 0 ? Math.round((totalCheckins / totalSold) * 100) : 0;

      setStats({
        totalSold,
        totalCheckins,
        totalPresent: totalCheckins,
        totalMissing,
        presenceRate,
        absenceRate: 100 - presenceRate
      });

      // 3. Marketing attribution stats (joining with campaigns)
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select(`
          name, 
          sales_attribution!inner(count),
          checkin_attribution:sales_attribution(count)
        `)
        .eq("tenant_id", activeTenant!.id);

      // Note: checkin_attribution would need a more complex join or server function for exact accuracy
      // This is a placeholder for the UI logic until Phase 4 (Advanced BI)
      setCampaignData(campaigns?.map(c => ({
        name: c.name,
        sold: (c as any).sales_attribution?.[0]?.count || 0,
        checkins: 0, // Needs attribution logic fix in Phase 4
        missing: (c as any).sales_attribution?.[0]?.count || 0,
        rate: 0
      })) || []);

    } catch (error) {
      console.error("Error fetching checkin stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center font-inter text-muted-foreground">Carregando indicadores de check-in...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPIItem title="Ingressos Vendidos" value={stats.totalSold.toLocaleString()} icon={Ticket} color="navy" />
        <KPIItem title="Check-ins Realizados" value={stats.totalCheckins.toLocaleString()} icon={CheckCircle2} color="success" />
        <KPIItem title="Total Presentes" value={stats.totalPresent.toLocaleString()} icon={Users} color="success" />
        <KPIItem title="Total Faltantes" value={stats.totalMissing.toLocaleString()} icon={UserX} color="primary" />
        <KPIItem title="Presença" value={`${stats.presenceRate}%`} icon={TrendingUp} color="primary" />
        <KPIItem title="Ausência" value={`${stats.absenceRate}%`} icon={BarChart3} color="neutral" />
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground/60 uppercase">Filtros:</span>
          </div>
          <SelectFilter placeholder="Evento" options={["Todos os Eventos", "Festival 2026", "Congresso Zevva"]} />
          <SelectFilter placeholder="Produtor" options={["Todos", "Zevva Org", "Producer X"]} />
          <SelectFilter placeholder="Cidade" options={["Todas", "São Paulo", "Rio de Janeiro", "Lisboa"]} />
          <SelectFilter placeholder="Campanha" options={["Todas", "Instagram Festival", "Facebook Ads"]} />
          <Button variant="outline" className="ml-auto rounded-xl border-border text-foreground font-bold flex items-center gap-2 bg-card hover:bg-muted">
            <Download className="w-4 h-4" /> Exportar Relatório
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check-in por Campanha */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/60 border-b border-border">
            <CardTitle className="text-lg font-manrope font-black text-foreground flex items-center justify-between">
              Check-in por Campanha
              <Tag className="w-5 h-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">Campanha</th>
                  <th className="px-4 py-4 text-center">Vendidos</th>
                  <th className="px-4 py-4 text-center">Check-ins</th>
                  <th className="px-4 py-4 text-center">Faltantes</th>
                  <th className="px-6 py-4 text-right">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-inter">
                {campaignData.map((c, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-foreground">{c.name}</td>
                    <td className="px-4 py-4 text-center font-bold text-foreground/70">{c.sold}</td>
                    <td className="px-4 py-4 text-center font-bold text-success">{c.checkins}</td>
                    <td className="px-4 py-4 text-center font-bold text-destructive">{c.missing}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-black text-xs">{c.rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Check-in por Anúncio */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="text-lg font-manrope font-bold text-foreground flex items-center justify-between">
              Check-in por Anúncio
              <BarChart3 className="w-5 h-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">Anúncio</th>
                  <th className="px-4 py-4">Campanha</th>
                  <th className="px-4 py-4 text-center">Vendidos</th>
                  <th className="px-4 py-4 text-center">Check-ins</th>
                  <th className="px-6 py-4 text-right">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-inter">
                {adData.map((ad, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-foreground">{ad.name}</td>
                    <td className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase">{ad.campaign}</td>
                    <td className="px-4 py-4 text-center font-bold text-foreground/70">{ad.sold}</td>
                    <td className="px-4 py-4 text-center font-bold text-success">{ad.checkins}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-foreground">{ad.conv}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios de Presença e No-Show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReportSummaryCard 
          title="Relatório de Presença" 
          subtitle="Participantes confirmados no evento"
          buttonText="Ver Lista Completa"
          type="presence"
        />
        <ReportSummaryCard 
          title="Módulo No-Show" 
          subtitle="Participantes ausentes (venda sem entrada)"
          buttonText="Ver Faltantes"
          type="noshow"
        />
      </div>
      
      {/* Módulo de Gestão de Link e Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border shadow-xl rounded-[40px] overflow-hidden bg-sidebar text-foreground h-full border">
          <CardContent className="p-8 flex flex-col items-start justify-between gap-6 h-full">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                Ambiente Operacional
              </div>
              <h2 className="text-2xl font-manrope font-black tracking-tighter uppercase">Link de Check-in</h2>
              <p className="text-muted-foreground text-sm font-medium">
                Gerencie as URLs de acesso e configure os coletores mobile da sua equipe de recepção.
              </p>
            </div>
            <Link to={"/produtor/checkin-url" as any} className="w-full">
              <Button className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group">
                Configurar Links <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xl rounded-[40px] overflow-hidden bg-card border h-full">
          <CardContent className="p-8 flex flex-col items-start justify-between gap-6 h-full text-foreground">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-muted-foreground rounded-full border border-border text-[10px] font-black uppercase tracking-widest">
                Business Intelligence
              </div>
              <h2 className="text-2xl font-manrope font-black tracking-tighter uppercase">Relatórios Avançados</h2>
              <p className="text-muted-foreground text-sm font-medium">
                Analise conversão de campanhas, no-show e dados demográficos dos participantes presentes.
              </p>
            </div>
            <Button variant="outline" className="w-full h-14 border-border text-foreground hover:bg-muted rounded-2xl font-black uppercase tracking-widest text-xs group bg-card">
              Exportar BI <BarChart3 className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform text-primary" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPIItem({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: 'navy' | 'success' | 'primary' | 'neutral' }) {
  const KPI_STYLES = {
    navy: {
      bar: "bg-foreground",
      iconBackground: "bg-foreground/10",
      icon: "text-foreground",
    },
    success: {
      bar: "bg-success",
      iconBackground: "bg-success/10",
      icon: "text-success",
    },
    primary: {
      bar: "bg-primary",
      iconBackground: "bg-primary/10",
      icon: "text-primary",
    },
    neutral: {
      bar: "bg-muted-foreground",
      iconBackground: "bg-muted",
      icon: "text-muted-foreground",
    },
  };

  const style = KPI_STYLES[color];

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden relative group">
      <div className={cn("absolute top-0 left-0 w-1 h-full", style.bar)} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
          <div className={cn("p-2 rounded-lg", style.iconBackground)}>
            <Icon className={cn("w-4 h-4", style.icon)} />
          </div>
        </div>
        <p className="text-2xl font-manrope font-black text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function SelectFilter({ placeholder, options }: any) {
  return (
    <Select>
      <SelectTrigger className="w-40 h-10 bg-secondary border-border rounded-xl text-xs font-bold text-foreground/70">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt: string) => (
          <SelectItem key={opt} value={opt} className="text-xs font-medium">{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ReportSummaryCard({ title, subtitle, buttonText, type }: any) {
  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
            type === 'presence' ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
          )}>
            {type === 'presence' ? <Users className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-manrope font-extrabold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary font-black text-xs uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
          {buttonText} <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
