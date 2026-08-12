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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSold: 10000,
    totalCheckins: 8500,
    totalPresent: 8500,
    totalMissing: 1500,
    presenceRate: 85,
    absenceRate: 15
  });

  const [campaignData, setCampaignData] = useState([
    { name: "Instagram Festival", sold: 500, checkins: 430, missing: 70, rate: 86 },
    { name: "Facebook Ads", sold: 800, checkins: 600, missing: 200, rate: 75 },
    { name: "Email Marketing", sold: 200, checkins: 190, missing: 10, rate: 95 }
  ]);

  const [adData, setAdData] = useState([
    { name: "Festival Jovem Instagram", campaign: "Instagram Festival", sold: 300, checkins: 260, missing: 40, conv: 86.6 },
    { name: "Trip Promo FB", campaign: "Facebook Ads", sold: 400, checkins: 310, missing: 90, conv: 77.5 }
  ]);

  useEffect(() => {
    // Simulando carregamento de dados reais
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-10 text-center font-inter text-muted">Carregando indicadores de check-in...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPIItem title="Ingressos Vendidos" value={stats.totalSold.toLocaleString()} icon={Ticket} color="bg-navy" />
        <KPIItem title="Check-ins Realizados" value={stats.totalCheckins.toLocaleString()} icon={CheckCircle2} color="bg-emerald-500" />
        <KPIItem title="Total Presentes" value={stats.totalPresent.toLocaleString()} icon={Users} color="bg-emerald-600" />
        <KPIItem title="Total Faltantes" value={stats.totalMissing.toLocaleString()} icon={UserX} color="bg-coral" />
        <KPIItem title="Presença" value={`${stats.presenceRate}%`} icon={TrendingUp} color="bg-primary" />
        <KPIItem title="Ausência" value={`${stats.absenceRate}%`} icon={BarChart3} color="bg-slate-400" />
      </div>

      {/* Filters */}
      <Card className="border-line shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-xl border border-line">
            <Filter className="w-4 h-4 text-navy/40" />
            <span className="text-xs font-bold text-navy/60 uppercase">Filtros:</span>
          </div>
          <SelectFilter placeholder="Evento" options={["Todos os Eventos", "Festival 2026", "Congresso Zevva"]} />
          <SelectFilter placeholder="Produtor" options={["Todos", "Zevva Org", "Producer X"]} />
          <SelectFilter placeholder="Cidade" options={["Todas", "São Paulo", "Rio de Janeiro", "Lisboa"]} />
          <SelectFilter placeholder="Campanha" options={["Todas", "Instagram Festival", "Facebook Ads"]} />
          <Button variant="outline" className="ml-auto rounded-xl border-line text-navy font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar Relatório
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check-in por Campanha */}
        <Card className="border-line shadow-sm overflow-hidden">
          <CardHeader className="bg-surface border-b border-line">
            <CardTitle className="text-lg font-manrope font-black text-navy flex items-center justify-between">
              Check-in por Campanha
              <Tag className="w-5 h-5 text-coral" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/50 text-[10px] font-black text-navy/40 uppercase tracking-widest border-b border-line">
                <tr>
                  <th className="px-6 py-4">Campanha</th>
                  <th className="px-4 py-4 text-center">Vendidos</th>
                  <th className="px-4 py-4 text-center">Check-ins</th>
                  <th className="px-4 py-4 text-center">Faltantes</th>
                  <th className="px-6 py-4 text-right">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-inter">
                {campaignData.map((c, i) => (
                  <tr key={i} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-navy">{c.name}</td>
                    <td className="px-4 py-4 text-center font-bold text-navy/70">{c.sold}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600">{c.checkins}</td>
                    <td className="px-4 py-4 text-center font-bold text-coral">{c.missing}</td>
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
        <Card className="border-line shadow-sm overflow-hidden">
          <CardHeader className="bg-navy text-white">
            <CardTitle className="text-lg font-manrope font-bold flex items-center justify-between">
              Check-in por Anúncio
              <BarChart3 className="w-5 h-5 text-coral" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-[10px] font-black text-navy/40 uppercase tracking-widest border-b border-line">
                <tr>
                  <th className="px-6 py-4">Anúncio</th>
                  <th className="px-4 py-4">Campanha</th>
                  <th className="px-4 py-4 text-center">Vendidos</th>
                  <th className="px-4 py-4 text-center">Check-ins</th>
                  <th className="px-6 py-4 text-right">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-inter">
                {adData.map((ad, i) => (
                  <tr key={i} className="hover:bg-accent/10 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-navy">{ad.name}</td>
                    <td className="px-4 py-4 text-xs font-bold text-muted uppercase">{ad.campaign}</td>
                    <td className="px-4 py-4 text-center font-bold">{ad.sold}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600">{ad.checkins}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-navy">{ad.conv}%</span>
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
        <Card className="border-line shadow-xl rounded-[40px] overflow-hidden bg-navy text-white h-full">
          <CardContent className="p-8 flex flex-col items-start justify-between gap-6 h-full">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/20 text-coral rounded-full border border-coral/20 text-[10px] font-black uppercase tracking-widest">
                Ambiente Operacional
              </div>
              <h2 className="text-2xl font-manrope font-black tracking-tighter uppercase">Link de Check-in</h2>
              <p className="text-white/60 text-sm font-medium">
                Gerencie as URLs de acesso e configure os coletores mobile da sua equipe de recepção.
              </p>
            </div>
            <Link to={"/produtor/checkin-url" as any} className="w-full">
              <Button className="w-full h-14 bg-coral hover:bg-coral-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-coral/20 group">
                Configurar Links <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-line shadow-xl rounded-[40px] overflow-hidden bg-white border border-line h-full">
          <CardContent className="p-8 flex flex-col items-start justify-between gap-6 h-full text-navy">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy/5 text-navy/60 rounded-full border border-line text-[10px] font-black uppercase tracking-widest">
                Business Intelligence
              </div>
              <h2 className="text-2xl font-manrope font-black tracking-tighter uppercase">Relatórios Avançados</h2>
              <p className="text-muted text-sm font-medium">
                Analise conversão de campanhas, no-show e dados demográficos dos participantes presentes.
              </p>
            </div>
            <Button variant="outline" className="w-full h-14 border-line text-navy hover:bg-surface rounded-2xl font-black uppercase tracking-widest text-xs group">
              Exportar BI <BarChart3 className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform text-coral" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPIItem({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-line bg-white shadow-sm overflow-hidden relative group">
      <div className={cn("absolute top-0 left-0 w-1 h-full", color)} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">{title}</p>
          <div className={cn("p-2 rounded-lg bg-opacity-10", color.replace('bg-', 'bg-').replace('bg-', 'text-'))}>
            <Icon className={cn("w-4 h-4", color.replace('bg-', 'text-'))} />
          </div>
        </div>
        <p className="text-2xl font-manrope font-black text-navy">{value}</p>
      </CardContent>
    </Card>
  );
}

function SelectFilter({ placeholder, options }: any) {
  return (
    <Select>
      <SelectTrigger className="w-40 h-10 bg-white border-line rounded-xl text-xs font-bold text-navy/70">
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
    <Card className="border-line shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
            type === 'presence' ? "bg-emerald-500/10 text-emerald-600" : "bg-coral/10 text-coral"
          )}>
            {type === 'presence' ? <Users className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-manrope font-extrabold text-navy">{title}</h3>
            <p className="text-xs text-muted font-medium">{subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary font-black text-xs uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
          {buttonText} <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
