import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Search, Filter, Calendar, MapPin, MoreVertical, Edit, Trash2, ExternalLink, Loader2, FileText, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

export function EventsList({ tenantId }: { tenantId: string }) {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["producer-events", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          ticket_types (
            id, nome, valor, quantidade, quantidade_vendida
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">📅 Eventos do Projeto</h1>
          <p className="text-sm text-muted-foreground font-medium">Visualização administrativa dos eventos deste tenant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card key={event.id} className="group border-border shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden bg-card">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img 
                src={event.cover_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  event.status === 'publicado' ? "bg-emerald-500 text-primary-foreground" : "bg-amber-500 text-primary-foreground"
                )}>
                  {event.status === 'publicado' ? 'Ativo' : 'Rascunho'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-manrope font-black text-foreground leading-tight line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR') : 'Data não definida'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Vendidos</p>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-black text-foreground">
                      {(event.ticket_types as any[])?.reduce((acc: number, t: any) => acc + (t.quantidade_vendida || 0), 0) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
