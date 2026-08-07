import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Ticket, DollarSign, Calendar } from "lucide-react";

export const Route = createFileRoute("/produtor/")({
  component: ProdutorDashboard,
});

function ProdutorDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["producer-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: events } = await supabase
        .from("events" as any)
        .select("id, status")
        .eq("produtor_id", user.id);

      const eventIds = events?.map(e => e.id) || [];
      
      const { data: orders } = await supabase
        .from("orders" as any)
        .select("valor_total")
        .in("evento_id", eventIds)
        .eq("status", "pago");

      const faturamento = orders?.reduce((acc, curr) => acc + Number(curr.valor_total), 0) || 0;
      const vendas = orders?.length || 0;

      return {
        eventosCriados: events?.length || 0,
        vendasRealizadas: vendas,
        faturamento: faturamento,
        ingressosVendidos: vendas, // Simplifying for MVP
      };
    }
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["producer-events"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("events" as any)
        .select("*, ticket_types(quantidade_total, quantidade_disponivel)")
        .eq("produtor_id", user?.id)
        .order("created_at", { ascending: false });
      return data;
    }
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Produtor</h1>
          <p className="text-gray-500">Gerencie seus eventos e acompanhe suas vendas.</p>
        </div>
        <Button asChild className="bg-coral hover:bg-coral/90 text-white">
          <Link to="/produtor/novo-evento">
            <Plus className="mr-2 h-4 w-4" /> Criar Evento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos Criados</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventosCriados || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <Ticket className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vendasRealizadas || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ingressosVendidos || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Meus Eventos</h2>
        <div className="grid gap-4">
          {events?.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="flex items-center p-6 gap-6">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {event.imagem_url ? (
                    <img src={event.imagem_url} alt={event.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{event.nome}</h3>
                    <Badge variant={
                      event.status === 'publicado' ? 'success' : 
                      event.status === 'aguardando_aprovacao' ? 'warning' : 'secondary'
                    }>
                      {event.status === 'publicado' ? 'Publicado' : 
                       event.status === 'aguardando_aprovacao' ? 'Em Aprovação' : 'Rascunho'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{new Date(event.data_inicio).toLocaleDateString("pt-BR", { dateStyle: 'long' })}</p>
                    <p>{event.cidade}, {event.localizacao}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-sm font-medium">
                    {event.ticket_types?.reduce((acc: number, curr: any) => acc + (curr.quantidade_total - curr.quantidade_disponivel), 0)} / {event.ticket_types?.reduce((acc: number, curr: any) => acc + curr.quantidade_total, 0)} vendidos
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {events?.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500">
              Você ainda não criou nenhum evento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
