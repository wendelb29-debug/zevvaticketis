import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Save, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";
import { useServerFn } from "@tanstack/react-start";
import { createEventFull } from "@/lib/events-creation.functions";


export const Route = createFileRoute("/produtor/novo-evento")({
  component: NovoEventoPage,
});

function NovoEventoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeTenant } = useTenants();

  const [loading, setLoading] = useState(false);

  const createEventFullFn = useServerFn(createEventFull);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    cidade: "",
    localizacao: "",
    data_inicio: "",
    imagem_url: "",
  });

  const [ticketTypes, setTicketTypes] = useState([
    { nome: "Individual", preco: 0, quantidade_total: 100 }
  ]);

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!activeTenant) throw new Error("Ambiente não selecionado");

      return await createEventFullFn({
        data: {
          event: {
            title: formData.nome,
            description: formData.descricao,
            category: formData.categoria,
            city: formData.cidade,
            location: formData.localizacao,
            start_date: formData.data_inicio,
            cover_image: formData.imagem_url,
            tenant_id: activeTenant.id,
          },
          ticketTypes: ticketTypes.map(t => ({
            nome: t.nome,
            valor: Number(t.preco),
            quantidade: Number(t.quantidade_total),
          }))
        }
      });
    },
    onSuccess: () => {
      toast.success("Evento criado e enviado para aprovação!");
      queryClient.invalidateQueries({ queryKey: ["producer-events"] });
      navigate({ to: "/produtor/eventos" });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar evento: " + (error.message || "Erro desconhecido"));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate();
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { nome: "", preco: 0, quantidade_total: 0 }]);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate({ to: "/produtor" })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Novo Evento no Projeto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Evento</Label>
                <Input 
                  id="nome" 
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input 
                  id="categoria" 
                  value={formData.categoria} 
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Ex: Show, Workshop, Conferência"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                value={formData.descricao} 
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data e Hora de Início</Label>
                <Input 
                  id="data_inicio" 
                  type="datetime-local" 
                  value={formData.data_inicio} 
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagem_url">URL do Banner</Label>
                <div className="flex gap-2">
                  <Input 
                    id="imagem_url" 
                    value={formData.imagem_url} 
                    onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                    placeholder="https://..."
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input 
                  id="cidade" 
                  value={formData.cidade} 
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Local (Endereço/Nome do local)</Label>
                <Input 
                  id="localizacao" 
                  value={formData.localizacao} 
                  onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tipos de Ingressos</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Lote
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50/50">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input 
                    value={ticket.nome} 
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      if (newTickets[index]) newTickets[index].nome = e.target.value;
                      setTicketTypes(newTickets);
                    }}
                    placeholder="Ex: VIP, Inteira"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input 
                    type="number" 
                    value={ticket.preco} 
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      if (newTickets[index]) newTickets[index].preco = Number(e.target.value);
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input 
                    type="number" 
                    value={ticket.quantidade_total} 
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      if (newTickets[index]) newTickets[index].quantidade_total = Number(e.target.value);
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/produtor" })}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createEventMutation.isPending} className="bg-coral hover:bg-coral/90">
            {createEventMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : "Criar Evento e Enviar para Aprovação"}
          </Button>
        </div>
      </form>
    </div>
  );
}
