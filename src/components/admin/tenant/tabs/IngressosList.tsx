import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, ArrowRight, Edit2, Loader2 } from "lucide-react";

export function IngressosList({ tenantId }: { tenantId: string }) {
  const { data: ticketTypes, isLoading } = useQuery({
    queryKey: ["admin-tenant-ticket-types", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id")
        .eq("tenant_id", tenantId);
      
      if (eventsError) throw eventsError;
      
      const eventIds = events?.map(e => e.id) || [];
      if (eventIds.length === 0) return [];

      const { data, error } = await supabase
        .from("ticket_types")
        .select("*, events(title)")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando ingressos...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">🎟️ Tipos de Ingressos</h1>
          <p className="text-muted-foreground font-medium text-sm">Controle de lotes, preços e inventário do projeto.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {ticketTypes?.map((ticket: any) => (
          <Card key={ticket.id} className="bg-card border-border overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all rounded-[32px] group">
            <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Ticket className="w-10 h-10" />
              </div>
              <div className="flex-grow space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                  Evento: {ticket.events?.title || "Sem evento"}
                </p>
                <h3 className="text-xl font-manrope font-black text-navy">{ticket.nome}</h3>
                <div className="flex flex-wrap gap-6 items-center pt-2">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Valor</p>
                    <span className="text-base font-black text-navy">
                      R$ {Number(ticket.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border hidden md:block" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Disponibilidade</p>
                    <span className="text-sm font-bold text-navy">
                      {ticket.quantidade_vendida || 0} / {ticket.quantidade} <span className="text-muted-foreground font-medium text-[11px] ml-1">vendidos</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-bold gap-2">
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {ticketTypes?.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-[40px] border border-dashed border-border/60">
             <div className="w-20 h-20 bg-muted/40 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                <Ticket size={40} />
             </div>
             <p className="text-sm font-bold text-foreground">Nenhum tipo de ingresso cadastrado</p>
             <p className="text-xs text-muted-foreground mt-1">Este projeto ainda não possui definições de vendas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
