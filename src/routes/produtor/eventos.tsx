import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTenants } from "@/hooks/use-tenants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produtor/eventos")({
  component: ProducerEventsPage,
});

function ProducerEventsPage() {
  const { activeTenant } = useTenants();
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["producer-events", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          ticket_types (
            id,
            nome,
            valor,
            quantidade,
            quantidade_vendida
          )
        `)
        .eq("tenant_id", activeTenant?.id || "")
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
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">📅 Meus Eventos</h1>
          <p className="text-sm text-muted-foreground font-medium">Gerencie a programação e vendas dos seus eventos.</p>
        </div>
        <Button 
          onClick={() => navigate({ to: "/produtor/novo-evento" })}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-black px-8 h-12 shadow-lg shadow-primary/20 rounded-xl uppercase tracking-widest text-xs w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> Novo Evento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Buscar por nome do evento..." 
            className="pl-11 h-12 rounded-xl border-line bg-card"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-line text-foreground font-bold gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card key={event.id} className="group border-line shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden bg-card">
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
                {event.category && (
                  <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-none text-foreground text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {event.category}
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card text-foreground border-none shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 border-line shadow-xl font-inter">
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-foreground cursor-pointer">
                      <Edit className="w-4 h-4 text-primary" /> Editar Evento
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate({ to: `/eventos/${event.id}` as any })}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-foreground cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-500" /> Ver na Loja
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-manrope font-black text-foreground leading-tight line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data não definida'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {event.city ? `${event.city}${event.location ? `, ${event.location}` : ''}` : 'Local não definido'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Vendidos</p>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-black text-foreground">
                      {(event.ticket_types as any[])?.reduce((acc: number, t: any) => acc + (t.quantidade_vendida || 0), 0) || 0}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold pb-1">/ {(event.ticket_types as any[])?.reduce((acc: number, t: any) => acc + (t.quantidade || 0), 0) || 0}</span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Receita Bruta</p>
                  <p className="text-lg font-black text-emerald-600">
                    R$ {((event.ticket_types as any[])?.reduce((acc: number, t: any) => acc + ((t.quantidade_vendida || 0) * (t.valor || 0)), 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate({ to: `/produtor/${event.id}/dashboard` as any })}
                className="w-full bg-navy hover:bg-navy/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-navy/10"
              >
                Painel de Controle
              </Button>
            </CardContent>
          </Card>
        ))}

        {events?.length === 0 && (
          <div className="col-span-full py-20 bg-card rounded-[32px] border-2 border-dashed border-line flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-muted-foreground">
              <FileText className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-manrope font-black text-foreground">Nenhum evento encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-medium">Você ainda não criou nenhum evento para este projeto. Comece agora mesmo!</p>
            </div>
            <Button 
              onClick={() => navigate({ to: "/produtor/novo-evento" })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-black px-8 h-12 shadow-lg shadow-primary/20 rounded-xl uppercase tracking-widest text-xs"
            >
              <Plus className="w-5 h-5" /> Criar Primeiro Evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

