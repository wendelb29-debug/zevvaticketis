import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Users, Search, Filter, CheckCircle2, Clock, XCircle, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/checkin/$projectId/presenca")({
  component: PresencaPage,
});

function PresencaPage() {
  const { projectId } = useParams({ from: "/checkin/$projectId/presenca" });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadAttendance() {
      // Resolve tenantId if slug is used
      let tenantId = projectId;
      const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", projectId).maybeSingle();
      if (tenant) tenantId = tenant.id;

      const { data } = await supabase
        .from("tickets")
        .select(`
          id,
          name,
          status,
          checked_in_at,
          profiles:owner_id(full_name, avatar_url),
          events(title)
        `)
        .eq("tenant_id", tenantId)
        .order("checked_in_at", { ascending: false, nullsFirst: false });

      setTickets(data || []);
      setLoading(false);
    }
    loadAttendance();
  }, [projectId]);

  const filteredTickets = tickets.filter(t => 
    t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.events?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedInCount = tickets.filter(t => t.status === 'utilizado').length;

  if (loading) return <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Carregando lista de presença...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-manrope font-black text-navy uppercase tracking-tighter">Lista de Presença</h2>
          <p className="text-xs font-black text-coral uppercase tracking-widest mt-1 opacity-80">Projeto: {projectId}</p>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
            <span className="text-emerald-600">{checkedInCount}</span> Confirmados de {tickets.length} participantes
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Buscar por nome ou evento..." 
            className="pl-12 h-14 rounded-2xl border-slate-200 font-bold focus:ring-coral/20 focus:border-coral transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white">
          <Filter className="w-5 h-5 text-navy" />
        </Button>
      </div>

      <div className="grid gap-3">
        {filteredTickets.length === 0 ? (
          <Card className="rounded-[32px] border-dashed border-2 p-12 text-center bg-white/50 flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest mb-6">Nenhum participante encontrado</p>
            <Link 
              to="/checkin/$projectId"
              params={{ projectId }}
              className="inline-flex items-center justify-center px-6 py-3 bg-navy text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-navy/90 transition-all shadow-lg"
            >
              Selecionar outro evento
            </Link>
          </Card>
        ) : filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="rounded-2xl border-slate-200 overflow-hidden hover:shadow-md transition-all group bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-xl border border-slate-100 group-hover:border-coral/30 transition-colors">
                <AvatarImage src={ticket.profiles?.avatar_url} />
                <AvatarFallback className="bg-navy/5 text-navy font-black text-xs uppercase">
                  {ticket.profiles?.full_name?.substring(0, 2) || '??'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-navy truncate uppercase text-sm">{ticket.profiles?.full_name}</h4>
                  {ticket.status === 'utilizado' && (
                    <div className="flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase">Check-in</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-400 truncate uppercase mt-0.5">{ticket.events?.title}</p>
              </div>

              <div className="text-right hidden sm:block">
                {ticket.status === 'utilizado' ? (
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Entrada</p>
                    <p className="text-xs font-black text-navy uppercase">
                      {new Date(ticket.checked_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-coral/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Aguardando</span>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-navy rounded-xl">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
