import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ShieldCheck, CreditCard, Ticket, ArrowLeft, Loader2 } from "lucide-center";
import { tracking } from "@/lib/tracking";

export const Route = createFileRoute("/eventos/$id/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { id } = useParams({ from: "/eventos/$id/checkout" });
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: ""
  });

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ["event-checkout", id],
    queryFn: async () => {
      const { data } = await (supabase
        .from("events" as any)
        .select("*, ticket_types(*)")
        .eq("id", id)
        .single() as any);
      return data;
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-checkout"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nome: (userProfile as any).nome_completo || userProfile.nome || "",
        email: userProfile.email || "",
        cpf: (userProfile as any).documento || userProfile.documento || ""
      });
    }
  }, [userProfile]);

  const selectedTicket = event?.ticket_types?.find((t: any) => t.id === selectedTicketId);
  const platformFee = selectedTicket ? Number(selectedTicket.valor) * 0.1 : 0;
  const totalAmount = selectedTicket ? Number(selectedTicket.valor) + platformFee : 0;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from("orders" as any)
        .insert({
          usuario_id: user.id,
          evento_id: id,
          valor_produtos: selectedTicket.valor,
          taxa_plataforma: platformFee,
          valor_total: totalAmount,
          status: 'pago' // Simulating instant approval for MVP
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Generate Ticket with QR Code
      const ticketCode = `ZEVVA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const { error: ticketError } = await supabase
        .from("tickets" as any)
        .insert({
          order_id: (order as any).id,
          evento_id: id,
          usuario_id: user.id,
          ticket_type_id: selectedTicketId,
          codigo_unico: ticketCode,
          qr_code: ticketCode,
          status: 'ativo'
        });

      if (ticketError) throw ticketError;

      return order;
    },
    onSuccess: (data: any) => {
      toast.success("Compra realizada com sucesso!");
      navigate({ to: "/app/historico" }); // Assuming this exists or will be created
    },
    onError: (error: any) => {
      toast.error("Erro ao processar compra: " + error.message);
    }
  });

  if (loadingEvent) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate({ to: `/eventos/${id}` })} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o evento
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}`}>1</div>
              <div className="h-px bg-muted flex-1"></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}`}>2</div>
              <div className="h-px bg-muted flex-1"></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-fg'}`}>3</div>
            </div>

            {step === 1 && (
              <Card>
                <CardHeader><CardTitle>Escolha seu Ingresso</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {event.ticket_types?.map((t: any) => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedTicketId === t.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{t.nome}</p>
                          <p className="text-sm text-muted-fg">{t.descricao}</p>
                        </div>
                        <p className="text-xl font-black text-primary">R$ {Number(t.valor).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-14 rounded-xl font-bold" 
                    disabled={!selectedTicketId}
                    onClick={() => setStep(2)}
                  >
                    Próximo Passo
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader><CardTitle>Identificação</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>CPF</Label>
                    <Input value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button variant="outline" className="flex-1 h-14" onClick={() => setStep(1)}>Voltar</Button>
                  <Button className="flex-1 h-14 font-bold" onClick={() => setStep(3)}>Ir para Pagamento</Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-muted-fg/20">
                    <p className="text-sm text-muted-fg text-center italic">
                      Ambiente de teste: Selecione "Simular Sucesso" para gerar seu ingresso.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-xl bg-accent/20">
                      <CreditCard className="text-primary" />
                      <div className="flex-1 font-bold">Cartão de Crédito / PIX</div>
                      <ShieldCheck className="text-green-500 w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-700 text-white" 
                    disabled={createOrderMutation.isPending}
                    onClick={() => createOrderMutation.mutate()}
                  >
                    {createOrderMutation.isPending ? <Loader2 className="animate-spin" /> : "FINALIZAR E PAGAR"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(2)}>Voltar para identificação</Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-navy text-white overflow-hidden">
              <div className="h-2 bg-coral w-full"></div>
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                    {event.imagem_capa && <img src={event.imagem_capa} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight mb-1">{event.nome_evento}</p>
                    <p className="text-[10px] text-white/60 uppercase font-black">{event.city}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Ingresso:</span>
                    <span className="font-bold">{selectedTicket?.nome || "---"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Valor:</span>
                    <span>R$ {selectedTicket ? Number(selectedTicket.valor).toLocaleString("pt-BR") : "0,00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Taxa de serviço (10%):</span>
                    <span>R$ {platformFee.toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-sm font-bold uppercase text-coral">Total:</span>
                  <span className="text-3xl font-black">R$ {totalAmount.toLocaleString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-white border border-line flex items-center gap-3">
              <ShieldCheck className="text-green-500 w-8 h-8" />
              <div>
                <p className="text-xs font-bold text-navy uppercase">Compra Garantida</p>
                <p className="text-[10px] text-muted leading-tight">Seus dados estão protegidos por criptografia de ponta a ponta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
