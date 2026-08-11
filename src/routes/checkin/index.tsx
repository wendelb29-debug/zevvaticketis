import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { QrCode, ArrowRight, Users, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkin/")({
  component: CheckinDashboard,
});

function CheckinDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAssignedEvents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get events where user is staff
      const { data: staffData } = await (supabase
        .from("event_staff" as any)
        .select("event_id, events(*)")
        .eq("user_id", user.id) as any);

      // Get events for organization owners/admins
      const { data: member } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let orgEvents: any[] = [];
      if (member) {
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("tenant_id", member.tenant_id);
        orgEvents = data || [];
      }

      const allEvents = [
        ...(staffData?.map((s: any) => s.events) || []),
        ...orgEvents
      ].filter((e, i, self) => e && self.findIndex(t => t?.id === e?.id) === i);

      // Fetch stats for each event
      const eventsWithStats = await Promise.all(allEvents.map(async (e) => {
        const { count: total } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", e.id);
        const { count: checkedIn } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", e.id).eq("status", "utilizado");
        return { ...e, total: total || 0, checkedIn: checkedIn || 0 };
      }));

      setEvents(eventsWithStats);
      setLoading(false);
    }
    loadAssignedEvents();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Selecione o Evento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((e) => (
          <Card key={e.id} className="rounded-[24px] p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-navy">{e.title}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase">{e.location} - {new Date(e.start_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <QrCode className="text-coral w-6 h-6" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
                <p className="text-lg font-black">{e.total}</p>
              </div>
              <div className="bg-good/10 p-3 rounded-lg text-center">
                <p className="text-[9px] font-black text-good uppercase">Entraram</p>
                <p className="text-lg font-black text-good">{e.checkedIn}</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg text-center">
                <p className="text-[9px] font-black text-destructive uppercase">Faltam</p>
                <p className="text-lg font-black text-destructive">{e.total - e.checkedIn}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-navy hover:bg-navy/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl"
              onClick={() => navigate({ to: "/checkin/event/$id", params: { id: e.id } as any })}
            >
              Entrar no Check-in <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
