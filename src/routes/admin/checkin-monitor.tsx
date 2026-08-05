import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  if (isLoading) return <div>Monitorando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-manrope font-extrabold text-navy">Monitor Global de Check-in</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border">
           <p className="text-muted font-bold text-xs uppercase">Check-ins Totais</p>
           <p className="text-3xl font-black text-navy">{logs?.length || 0}</p>
         </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-line">
            {logs?.map((log: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4">{log.tickets?.events?.title}</td>
                <td className="px-6 py-4 font-bold">{log.tickets?.profiles?.nome}</td>
                <td className="px-6 py-4 text-xs">{new Date(log.scanned_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}