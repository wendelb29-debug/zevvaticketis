import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  Ticket,
  Loader2,
  Calendar,
  MapPin,
  QrCode,
  Download,
  AlertCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DigitalTicket } from "@/components/tickets/DigitalTicket";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";

export const Route = createFileRoute("/app/meus-ingressos")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: MeusIngressos,
});

function MeusIngressos() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events(id, title, start_date, location),
        type:ticket_types(id, nome)
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-brand" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-manrope font-black text-foreground">Meus Ingressos</h1>
        <p className="text-muted-foreground font-medium text-lg">Acesse seus eventos e apresente na entrada.</p>
      </div>

      <div className="grid gap-6">
        {tickets.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2">
            <CardContent className="flex flex-col items-center py-16 text-center space-y-4">
              <Ticket className="w-16 h-16 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-xl font-bold">Nenhum ingresso encontrado</p>
                <p className="text-muted-foreground">Suas compras aparecerão aqui.</p>
              </div>
              <Button asChild className="rounded-xl font-bold h-12 px-8">
                <Link to="/">Ver eventos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="rounded-3xl overflow-hidden border-border group hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="flex-grow p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-manrope font-extrabold text-2xl text-foreground group-hover:text-brand transition-colors">
                      {ticket.event?.title}
                    </h3>
                    <Badge className={cn(
                      "text-[10px] uppercase font-black tracking-widest",
                      ticket.status === 'utilizado' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {ticket.status === 'utilizado' ? 'Utilizado' : 'Ativo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground font-medium">
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand" /> {new Date(ticket.event?.start_date).toLocaleString()}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand" /> {ticket.event?.location}</p>
                    <p className="font-bold text-foreground">Tipo: {ticket.type?.nome}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border-t md:border-t-0 md:border-l p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border shadow-inner">
                    <QrCode className="w-20 h-20 text-foreground" />
                  </div>
                  <Button variant="outline" className="w-full rounded-xl font-bold h-10">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
