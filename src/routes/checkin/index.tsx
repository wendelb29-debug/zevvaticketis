import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { 
  QrCode, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

      // Get events where user is staff (cast to any)
      const { data: staffData } = await (supabase
        .from("event_staff" as any)
        .select("event_id, events(*)")
        .eq("user_id", user.id) as any);

      // Also get events for organization owners/admins
      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let orgEvents: any[] = [];
      if (member) {
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("organization_id", member.organization_id);
        orgEvents = data || [];
      }

      // Merge and deduplicate
      const allEvents = [
        ...(staffData?.map((s: any) => s.events) || []),
        ...orgEvents
      ].filter((e, i, self) => e && self.findIndex(t => t?.id === e?.id) === i);

      setEvents(allEvents);
      setLoading(false);
    }
    loadAssignedEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Buscando eventos autorizados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Eventos Autorizados</h2>
        <p className="text-slate-500 font-medium">Selecione o evento para iniciar a recepção.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="group overflow-hidden border-slate-200 hover:border-coral/30 hover:shadow-xl transition-all duration-300 rounded-[24px]">
              <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-manrope font-black text-navy uppercase tracking-tight group-hover:text-coral transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="font-bold text-xs uppercase tracking-widest mt-1">
                      {new Date(event.start_date).toLocaleDateString('pt-BR')} — {event.location}
                    </CardDescription>
                  </div>
                  <div className="bg-coral/10 text-coral p-2 rounded-xl border border-coral/20">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Esperado</p>
                    <p className="text-lg font-black text-navy">--</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-ins</p>
                    <p className="text-lg font-black text-good">--</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-navy hover:bg-navy/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl group-hover:bg-coral group-hover:shadow-lg group-hover:shadow-coral/20 transition-all"
                  onClick={() => navigate({ to: "/checkin/scanner", search: { eventId: event.id } as any })}
                >
                  Iniciar Scanner <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-manrope font-black text-navy uppercase">Nenhum evento encontrado</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
              Você não possui permissões de staff para nenhum evento ativo no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
