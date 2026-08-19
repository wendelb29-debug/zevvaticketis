import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Search, Mail, Download, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ParticipantsList({ tenantId }: { tenantId: string }) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-tenant-participants", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles:owner_id(nome_completo, email, telefone),
          events(title)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(t => ({
        ...t,
        displayStatus: t.status === 'utilizado' || t.status === 'presente' ? 'Utilizado' : 'Válido',
        isUtilized: t.status === 'utilizado' || t.status === 'presente'
      }));
    }
  });

  const handleResendEmail = (ticket: any) => {
    toast.promise(
      fetch('/api/public/webhook?type=order_tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ticket.profiles?.email,
          customer_name: ticket.profiles?.nome_completo,
          event_name: ticket.events?.title,
          order_id: ticket.id.substring(0, 8).toUpperCase(),
          ticket_count: 1,
          url: `${window.location.origin}/app/meus-ingressos`
        })
      }),
      {
        loading: 'Enviando ingressos...',
        success: 'E-mail de ingressos reenviado com sucesso!',
        error: 'Erro ao enviar e-mail.'
      }
    );
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando participantes...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">👥 Participantes</h1>
          <p className="text-muted-foreground font-medium text-sm">Base consolidada de clientes deste ambiente.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-border h-11 font-bold">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
        <Input placeholder="Buscar por nome, e-mail ou código do ingresso..." className="pl-12 h-14 rounded-2xl border-border focus:ring-2 focus:ring-primary/20 bg-card/50" />
      </div>

      <div className="bg-card rounded-[40px] border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
              <tr>
                <th className="px-8 py-5">Participante</th>
                <th className="px-8 py-5">Evento / Ingresso</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Ações</th>
                <th className="px-8 py-5 text-right">Data Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tickets?.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-black text-navy">{ticket.profiles?.nome_completo || 'N/A'}</div>
                    <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3" /> {ticket.profiles?.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-navy">{ticket.events?.title}</div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-tight mt-0.5">{ticket.name || "Ingresso"}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      ticket.isUtilized 
                        ? "bg-blue-50 text-blue-600 border-blue-100" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {ticket.displayStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                      title="Reenviar Ingressos por E-mail"
                      onClick={() => handleResendEmail(ticket)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-8 py-5 text-right text-muted-foreground font-bold text-[11px]">
                    {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {tickets?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <div className="w-16 h-16 bg-muted/40 rounded-[24px] flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                        <Users size={32} />
                     </div>
                     <p className="text-sm font-bold text-foreground">Nenhum participante encontrado</p>
                     <p className="text-xs text-muted-foreground mt-1">Este projeto ainda não possui registros de vendas.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
