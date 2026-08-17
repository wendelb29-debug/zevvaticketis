import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  MousePointer2, 
  TrendingUp, 
  Target,
  BarChart,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

export function AdsDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['ad-metrics-summary'],
    queryFn: async () => {
      // Fetch last 30 days of metrics
      const { data, error } = await supabase
        .from('ad_metrics')
        .select('*')
        .order('occurred_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando métricas...</div>;

  const totalImpressions = metrics?.filter(m => m.event_type === 'impression').length || 0;
  const totalClicks = metrics?.filter(m => m.event_type === 'click').length || 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const totalDismissals = metrics?.filter(m => ['close', 'swipe_dismiss'].includes(m.event_type)).length || 0;

  // Process data for chart (grouped by date)
  const chartData = metrics?.reduce((acc: any[], metric) => {
    if (!metric.occurred_at) return acc;
    const date = new Date(metric.occurred_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(a => a.name === date);
    if (existing) {
      if (metric.event_type === 'impression') existing.impressions += 1;
      if (metric.event_type === 'click') existing.clicks += 1;
    } else {
      acc.push({
        name: date,
        impressions: metric.event_type === 'impression' ? 1 : 0,
        clicks: metric.event_type === 'click' ? 1 : 0
      });
    }
    return acc;
  }, []).slice(-7) || [];


  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Impressões" 
          value={totalImpressions.toLocaleString()} 
          icon={<Eye className="h-5 w-5" />} 
          color="blue"
        />
        <MetricCard 
          label="Cliques" 
          value={totalClicks.toLocaleString()} 
          icon={<MousePointer2 className="h-5 w-5" />} 
          color="coral"
        />
        <MetricCard 
          label="CTR Médio" 
          value={`${ctr}%`} 
          icon={<TrendingUp className="h-5 w-5" />} 
          color="green"
        />
        <MetricCard 
          label="Rejeições" 
          value={totalDismissals.toLocaleString()} 
          icon={<Target className="h-5 w-5" />} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-manrope font-extrabold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Performance Diária
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="impressions" name="Impressões" stroke="#3B82F6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="clicks" name="Cliques" stroke="#D94B52" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clicks by Day */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-manrope font-extrabold text-foreground flex items-center gap-2">
              <MousePointer2 className="h-4 w-4 text-primary" /> Engajamento (Cliques)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="clicks" name="Cliques" fill="#D94B52" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'blue' | 'coral' | 'green' | 'red' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600',
    coral: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    red: 'bg-red-500/10 text-red-600'
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">KPI</span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-manrope font-black text-foreground">{value}</p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mt-1">{label}</p>
      </div>
    </div>
  );
}
