import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Users, Clock, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export const Route = createFileRoute("/checkin/event/$id/supervisor")({
  component: SupervisorPanel,
});

function SupervisorPanel() {
  const { id: eventId } = useParams({ from: "/checkin/event/$id/supervisor" });
  const [operators, setOperators] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupervisorData() {
      // Load operators
      const { data: staff } = await (supabase
        .from("event_staff" as any)
        .select("user_id, role, profiles:user_id(full_name, email)")
        .eq("event_id", eventId) as any);

      // Fetch check-in counts per operator
      const operatorsWithCounts = await Promise.all((staff || []).map(async (s: any) => {
        const { count } = await supabase
          .from("checkin_records")
          .select("id", { count: 'exact', head: true })
          .eq("event_id" as any, eventId)
          .eq("operator_id" as any, s.user_id);
        
        return {
          id: s.user_id,
          name: s.profiles?.full_name || 'Operador',
          email: s.profiles?.email,
          checkins: count || 0,
          status: 'online' // Mocked status
        };
      }));

      setOperators(operatorsWithCounts);

      // Hourly data (Mocked for UI visualization, in production would query checkin_records)
      const mockHourly = [
        { hour: '08:00', count: 120 },
        { hour: '09:00', count: 540 },
        { hour: '10:00', count: 900 },
        { hour: '11:00', count: 450 },
        { hour: '12:00', count: 300 },
      ];
      setHourlyData(mockHourly);
      setLoading(false);
    }

    loadSupervisorData();
  }, [eventId]);

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Painel Supervisor</h2>
        <p className="text-slate-500 font-medium">Gestão de equipe e monitoramento de fluxo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[32px] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black text-navy uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-coral" /> Equipe em Campo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operators.map((op) => (
                <div key={op.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-black">
                      {op.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-navy uppercase">{op.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{op.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-coral">{op.checkins}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Entradas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black text-navy uppercase flex items-center gap-2">
              <Activity className="w-5 h-5 text-coral" /> Fluxo por Hora
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#D9A94D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Pico de Entrada" value="900" sublabel="às 10:00" />
        <SummaryCard label="Média por Hora" value="462" sublabel="entradas/hora" />
        <SummaryCard label="Último Check-in" value="Agora" sublabel="Há 12 segundos" />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sublabel }: any) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-navy">{value}</p>
      <p className="text-xs font-bold text-coral uppercase mt-1">{sublabel}</p>
    </div>
  );
}
