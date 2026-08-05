import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/checkin-monitor")({
  component: CheckinMonitorPage,
});

function CheckinMonitorPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["checkin-logs-global"],
    queryFn: async () => {
      // @ts-ignore
      const { data } = await supabase
        .from("checkin_logs")
        .select(`
          scanned_at,
          tickets(events(title), profiles(nome))
        `)
        .order("scanned_at", { ascending: false });
      return data;
    }
  });

  if (isLoading) return <div className="p-10 text-center text-muted-fg font-inter">Monitorando acessos...</div>;

  return (
    <div className="space-y-8 text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold">Monitor Global de Check-in</h1>
        <p className="text-muted-fg">Acompanhamento em tempo real de entradas nos eventos Zevva.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-card border-border shadow-sm">
           <CardContent className="p-6 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
               <Ticket className="w-6 h-6 text-primary" />
             </div>
             <div>
               <p className="text-muted-fg font-bold text-xs uppercase tracking-wider">Check-ins Hoje</p>
               <p className="text-3xl font-manrope font-black">{logs?.length || 0}</p>
             </div>
           </CardContent>
         </Card>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-accent text-muted-fg text-xs font-extrabold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Evento</th>
              <th className="px-6 py-4">Participante</th>
              <th className="px-6 py-4">Horário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs?.map((log: any, i: number) => (
              <tr key={i} className="hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{log.tickets?.events?.title}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-fg" />
                    <span className="font-medium">{log.tickets?.profiles?.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-muted-fg font-inter">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(log.scanned_at).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-muted-fg font-inter">Nenhum check-in registrado recentemente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
