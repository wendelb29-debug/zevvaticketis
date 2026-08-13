import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Ticket, ArrowLeft, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/eventos/$id")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      busca: (search['busca'] as string) || undefined,
      categoria: (search['categoria'] as string) || undefined,
      cidade: (search['cidade'] as string) || undefined,
      data: (search['data'] as string) || undefined,
    };
  },
  component: EventDetailsPage,
});

function EventDetailsPage() {
  const { id } = useParams({ from: "/eventos/$id" });
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event-details", id],
    queryFn: async () => {
      const { data } = await (supabase
        .from("events" as any)
        .select("*, ticket_types(*), producers(nome_empresa)")
        .eq("id", id)
        .single() as any);
      return data;
    }
  });

  const handlePurchase = () => {
    if (!selectedTicket) {
      toast.error("Por favor, selecione um tipo de ingresso.");
      return;
    }
    navigate({ to: `/eventos/${id}/checkout` });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Evento não encontrado</h1>
      <Button onClick={() => navigate({ to: "/" })}>Voltar para Home</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="relative h-[400px] w-full overflow-hidden">
        {event.imagem_capa ? (
          <img 
            src={event.imagem_capa} 
            alt={event.nome_evento} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-accent flex items-center justify-center">
            <Ticket className="w-20 h-20 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white mb-4 hover:bg-card/10"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Badge className="bg-coral text-white border-none">{event.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-manrope font-extrabold text-white">
                {event.nome_evento}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-coral" />
                  <span>{new Date(event.start_date).toLocaleDateString("pt-BR", { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-coral" />
                  <span>{event.city}, {event.location}</span>
                </div>
              </div>
            </div>
            <Button className="bg-card text-foreground hover:bg-card/90 font-bold px-8 py-6 rounded-2xl">
              <Share2 className="mr-2 h-5 w-5" /> Compartilhar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" /> Sobre o Evento
              </h2>
              <div className="prose prose-slate max-w-none text-muted-foreground-fg leading-relaxed">
                {event.descricao_completa || "Sem descrição disponível."}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" /> Realização
              </h2>
              <Card className="border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                    {event.producers?.nome_empresa?.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground-fg">Organizado por</p>
                    <p className="font-bold text-lg">{event.producers?.nome_empresa || "Produtor Independente"}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-primary shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Ingressos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {event.ticket_types?.map((ticket: any) => (
                    <div 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                        selectedTicket === ticket.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-fg/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{ticket.nome}</span>
                        <span className="text-primary font-black">
                          R$ {Number(ticket.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground-fg">{ticket.descricao}</p>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl"
                  onClick={handlePurchase}
                >
                  COMPRAR INGRESSO
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground-fg uppercase tracking-widest font-bold">
                  Compra 100% Segura • Zevva Tickets
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
