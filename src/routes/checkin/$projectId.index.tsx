import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { QrCode, ArrowRight, Users, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkin/$projectId/")({
  component: CheckinDashboard,
});

function CheckinDashboard() {
  const { projectId } = useParams({ from: "/checkin/$projectId/" });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProjectEvents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Filter events by the projectId from URL (tenant_id or slug)
      // We first need to resolve the projectId if it's a slug
      let tenantId = projectId;
      
      const { data: tenantBySlug } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", projectId)
        .maybeSingle();
      
      if (tenantBySlug) {
        tenantId = tenantBySlug.id;
      }

      const { data: orgEvents } = await supabase
        .from("events")
        .select("*")
        .eq("tenant_id", tenantId)
        .order('start_date', { ascending: true });

      const allEvents = orgEvents || [];

      const eventsWithStats = await Promise.all(allEvents.map(async (e) => {
        const { count: total } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", e.id);
        const { count: checkedIn } = await supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("event_id", e.id).eq("status", "utilizado");
        return { ...e, total: total || 0, checkedIn: checkedIn || 0 };
      }));

      setEvents(eventsWithStats);
      setLoading(false);
    }
    loadProjectEvents();
  }, [projectId]);

  if (loading) return <div className="p-10 text-center font-inter text-muted">Carregando eventos do projeto...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Eventos Disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-line">
            <p className="text-muted font-bold">Nenhum evento encontrado para este projeto.</p>
          </div>
        ) : events.map((e) => (
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
              <div className="bg-emerald-500/10 p-3 rounded-lg text-center">
                <p className="text-[9px] font-black text-emerald-600 uppercase">Entraram</p>
                <p className="text-lg font-black text-emerald-600">{e.checkedIn}</p>
              </div>
              <div className="bg-coral/10 p-3 rounded-lg text-center">
                <p className="text-[9px] font-black text-coral uppercase">Faltam</p>
                <p className="text-lg font-black text-coral">{e.total - e.checkedIn}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-navy hover:bg-navy/90 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl group-hover:bg-coral transition-colors"
              onClick={() => navigate({ 
                to: "/checkin/$projectId/scanner", 
                params: { projectId: projectId },
                search: { eventId: e.id }
              })}
            >
              Iniciar Scanner <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
