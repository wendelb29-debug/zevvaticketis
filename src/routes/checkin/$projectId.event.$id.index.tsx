import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CheckCircle2, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/checkin/$projectId/event/$id/")({
  component: EventOperationalDashboard,
});

function EventOperationalDashboard() {
  const { id } = useParams({ from: "/checkin/event/$id/" });
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    missing: 0,
    percentage: 0
  });

  useEffect(() => {
    async function loadStats() {
      const { count: total } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", id);
      const { count: checkedIn } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", id).eq("status", "utilizado");
      
      const totalVal = total || 0;
      const checkedInVal = checkedIn || 0;
      const percentage = totalVal > 0 ? Math.round((checkedInVal / totalVal) * 100) : 0;

      setStats({
        total: totalVal,
        checkedIn: checkedInVal,
        missing: totalVal - checkedInVal,
        percentage
      });
    }

    loadStats();

    // Real-time subscription
    const channel = supabase
      .channel('checkin-stats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets',
        filter: `event_id=eq.${id}`
      }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Painel Operacional</h2>
        <p className="text-slate-500 font-medium">Monitoramento em tempo real do acesso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Esperado" 
          value={stats.total} 
          icon={Users} 
          color="bg-navy" 
        />
        <StatCard 
          label="Entradas Realizadas" 
          value={stats.checkedIn} 
          icon={CheckCircle2} 
          color="bg-good" 
        />
        <StatCard 
          label="Faltantes" 
          value={stats.missing} 
          icon={Clock} 
          color="bg-destructive" 
        />
        <StatCard 
          label="Presença" 
          value={`${stats.percentage}%`} 
          icon={TrendingUp} 
          color="bg-coral" 
        />
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-navy uppercase mb-6">Status da Lotação</h3>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-coral transition-all duration-500" 
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <div className="mt-4 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>0%</span>
          <span>{stats.percentage}% ocupado</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[24px] overflow-hidden border-slate-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-navy">{value}</p>
          </div>
          <div className={`${color} p-3 rounded-xl text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
