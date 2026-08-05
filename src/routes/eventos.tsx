import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { getThemeByCategory } from "@/lib/categoryThemes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Share2, 
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  Clock,
  Ticket as TicketIcon,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  CheckCircle2,
  Users,
  Plane,
  Hotel,
  Utensils,
  Smartphone,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventDetails } from "@/lib/events.functions";
import { useServerFn } from "@tanstack/react-start";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/eventos")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search['id'] as string) || undefined,
      categoria: (search['categoria'] as string) || "CARAVANAS INTERNACIONAIS",
    };
  },
  component: EventPage,
});

function EventPage() {
  const search = useSearch({ from: "/eventos" }) as any;
  const theme = getThemeByCategory(search.categoria);
  const getEvent = useServerFn(getEventDetails);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    if (search.id) {
      getEvent({ data: { id: search.id } }).then(res => {
        setData(res);
        setLoading(false);
      }).catch(err => {
        console.error("Erro ao buscar evento:", err);
        setLoading(false);
      });
    }
  }, [search.id]);

  if (loading) return (
    <div className="min-h-screen bg-bg p-8 space-y-8 max-w-7xl mx-auto pt-24">
      <Skeleton className="h-[400px] w-full rounded-[40px]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-80 w-full rounded-[32px]" />
      </div>
    </div>
  );

  if (!data?.event) return <div className="p-20 text-center font-manrope font-black text-navy text-2xl">Evento não encontrado.</div>;

  const { event, ticketTypes, itinerary } = data;
  const total = ticketTypes.reduce((acc: number, t: any) => acc + (quantities[t.id] || 0) * t.valor, 0);
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  return (
    <div className={cn("min-h-screen bg-bg text-navy font-inter selection:bg-coral/20", theme.fontFamily)}>
      {/* Sticky Secondary Nav / Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-line h-20 px-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link to="/" className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:bg-surface transition-all active:scale-90">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-navy truncate max-w-[200px] md:max-w-md">{event.title}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tighter">
              <Calendar className="w-3 h-3" />
              {event.start_date && format(new Date(event.start_date), "dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex rounded-xl font-bold gap-2 text-xs h-12">
            <Share2 className="w-4 h-4" /> Compartilhar
          </Button>
          <Button 
            className="bg-coral hover:bg-coral-dark text-white rounded-xl h-12 px-8 font-black text-xs shadow-xl shadow-coral/20 transition-all active:scale-95"
            onClick={() => {
              const el = document.getElementById('tickets-section');
              el?.scrollIntoView({ behavior: 'smooth' });
              setActiveTab("tickets");
            }}
          >
            {total > 0 ? `Comprar (${total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})` : 'Garantir Vaga'}
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-12">
        {/* Banner Hero */}
        <div className="relative h-[450px] rounded-[48px] overflow-hidden shadow-2xl group border-4 border-white">
          <img 
            src={event.cover_image || "https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&fit=crop&q=80&w=1600"} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
          
          <div className="absolute top-8 left-8">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-coral fill-coral" /> {event.category || "CARAVANA"}
            </div>
          </div>

          <div className="absolute bottom-12 left-8 right-8 text-white space-y-4">
            <h1 className="text-4xl md:text-6xl font-manrope font-black tracking-tight leading-none max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <MapPin className="w-4 h-4 text-coral" />
                <span className="text-sm font-bold uppercase tracking-tight">{event.location || "Israel"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <Calendar className="w-4 h-4 text-coral" />
                <span className="text-sm font-bold uppercase tracking-tight">
                  {event.start_date && format(new Date(event.start_date), "dd 'a' 25 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sticky Secondary Navigation */}
        <div className="sticky top-20 z-[90] bg-bg/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-line overflow-x-auto no-scrollbar">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-12 rounded-none p-0">
              <TabsTrigger value="tickets" className="h-full data-[state=active]:text-coral data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-coral rounded-none font-black text-xs uppercase tracking-widest transition-all">Ingressos</TabsTrigger>
              <TabsTrigger value="about" className="h-full data-[state=active]:text-coral data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-coral rounded-none font-black text-xs uppercase tracking-widest transition-all">Sobre</TabsTrigger>
              <TabsTrigger value="travel" className="h-full data-[state=active]:text-coral data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-coral rounded-none font-black text-xs uppercase tracking-widest transition-all">Roteiro da Viagem</TabsTrigger>
              <TabsTrigger value="info" className="h-full data-[state=active]:text-coral data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-coral rounded-none font-black text-xs uppercase tracking-widest transition-all">Informações Úteis</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12" id="tickets-section">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-16">
            
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="tickets" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-2xl font-manrope font-black text-navy flex items-center gap-3">
                    <TicketIcon className="w-6 h-6 text-coral" /> Opções de Ingressos
                  </h3>
                  <p className="text-muted font-medium">Selecione as categorias que melhor atendem sua necessidade.</p>
                </div>

                <div className="grid gap-6">
                  {ticketTypes.map((ticket: any) => (
                    <div 
                      key={ticket.id} 
                      className={cn(
                        "p-8 bg-white rounded-[40px] border-2 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8",
                        quantities[ticket.id] > 0 ? "border-coral shadow-2xl shadow-coral/5 scale-[1.02]" : "border-line hover:border-coral/20"
                      )}
                    >
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <h4 className="text-xl font-manrope font-black text-navy">{ticket.nome}</h4>
                          <p className="text-sm text-muted font-bold leading-relaxed max-w-md">{ticket.descricao}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-3 py-1 bg-surface rounded-full text-[9px] font-black text-navy uppercase flex items-center gap-1 border border-line">
                            <Hotel className="w-3 h-3" /> Hotel 5★
                          </span>
                          <span className="px-3 py-1 bg-surface rounded-full text-[9px] font-black text-navy uppercase flex items-center gap-1 border border-line">
                            <Utensils className="w-3 h-3" /> Pensão Completa
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:flex-col md:items-end gap-6">
                        <div className="text-right">
                          <span className="block text-2xl font-manrope font-black text-navy">
                            {ticket.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                          </span>
                          <span className="text-[10px] text-muted font-black uppercase tracking-widest">por pessoa</span>
                        </div>

                        <div className="flex items-center gap-4 bg-surface p-1.5 rounded-2xl border border-line shadow-inner">
                          <button 
                            onClick={() => updateQuantity(ticket.id, -1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-line text-navy font-black hover:bg-navy hover:text-white transition-all active:scale-90 disabled:opacity-30"
                            disabled={!quantities[ticket.id]}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="w-8 text-center font-manrope font-black text-lg text-navy">{quantities[ticket.id] || 0}</span>
                          <button 
                            onClick={() => updateQuantity(ticket.id, 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-line text-navy font-black hover:bg-navy hover:text-white transition-all active:scale-90"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-10 rounded-[48px] border border-line shadow-sm space-y-8">
                  <h3 className="text-3xl font-manrope font-black text-navy">Sobre esta Jornada</h3>
                  <div className="prose prose-navy max-w-none text-muted font-medium text-lg leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-line">
                    <div className="space-y-4">
                      <h4 className="font-black text-navy flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-good" /> O que está incluso
                      </h4>
                      <ul className="space-y-2 text-sm font-bold text-muted">
                        <li>• Aéreo ida e volta de São Paulo</li>
                        <li>• Hospedagem em hotéis de categoria superior</li>
                        <li>• Café da manhã e jantar em todos os dias</li>
                        <li>• Guia especializado falando português</li>
                        <li>• Seguro viagem internacional de alto valor</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-navy flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-coral" /> Segurança e Políticas
                      </h4>
                      <p className="text-xs font-bold text-muted leading-relaxed">
                        Cancelamento integral até 90 dias antes do embarque. <br />
                        Exigência de passaporte com validade de 6 meses.<br />
                        Assessoria completa para visto (quando aplicável).
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="travel" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <h3 className="text-2xl font-manrope font-black text-navy">Roteiro de Viagem</h3>
                  <div className="space-y-6 relative before:absolute before:left-10 before:top-4 before:bottom-4 before:w-1 before:bg-line before:rounded-full">
                    {itinerary.length > 0 ? itinerary.map((day: any) => (
                      <div key={day.id} className="relative pl-24 group">
                        <div className="absolute left-6 top-0 w-10 h-10 rounded-full bg-white border-2 border-coral flex items-center justify-center z-10 shadow-lg shadow-coral/20 group-hover:scale-110 transition-transform">
                          <span className="text-xs font-black text-coral">D{day.dia_numero}</span>
                        </div>
                        <div className="p-8 bg-white rounded-[32px] border border-line group-hover:border-coral/20 transition-all shadow-sm">
                          <h4 className="text-lg font-manrope font-black text-navy mb-3">{day.titulo}</h4>
                          <p className="text-sm text-muted font-medium leading-relaxed">{day.descricao}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-20 text-center bg-white rounded-[40px] border border-line border-dashed">
                        <Plane className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                        <p className="text-muted font-black uppercase text-xs tracking-widest">O roteiro detalhado será divulgado em breve.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-surface rounded-[40px] border border-line space-y-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Smartphone className="w-6 h-6 text-coral" />
                      </div>
                      <h4 className="font-black text-navy uppercase tracking-tight text-sm">Comunicação WhatsApp</h4>
                      <p className="text-xs text-muted font-bold leading-relaxed">Criaremos um grupo exclusivo para os participantes 30 dias antes do embarque para coordenação e dúvidas rápidas.</p>
                    </div>
                    <div className="p-8 bg-surface rounded-[40px] border border-line space-y-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Users className="w-6 h-6 text-coral" />
                      </div>
                      <h4 className="font-black text-navy uppercase tracking-tight text-sm">Tamanho do Grupo</h4>
                      <p className="text-xs text-muted font-bold leading-relaxed">Trabalhamos com grupos reduzidos de até 40 pessoas para garantir a melhor experiência e atenção individual.</p>
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Sidebar Cart */}
          <aside className="space-y-8">
            <div className="sticky top-40 space-y-8">
              <div className="bg-navy rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-coral/20 rounded-full blur-3xl" />
                
                <h3 className="text-2xl font-manrope font-black mb-8">Seu Pedido</h3>
                
                <div className="space-y-6">
                  {ticketTypes.some((t: any) => (quantities[t.id] || 0) > 0) ? (
                    <div className="space-y-4">
                      {ticketTypes.map((t: any) => quantities[t.id] > 0 && (
                        <div key={t.id} className="flex justify-between items-start border-b border-white/10 pb-4 animate-in fade-in zoom-in-95">
                          <div className="space-y-1">
                            <p className="text-sm font-black text-white">{t.nome}</p>
                            <p className="text-[10px] font-bold text-white/50">{quantities[t.id]}x unidade(s)</p>
                          </div>
                          <span className="font-black text-sm">
                            {(quantities[t.id] * t.valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-4 border-2 border-dashed border-white/10 rounded-3xl">
                      <TicketIcon className="w-10 h-10 text-white/20 mx-auto" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Carrinho Vazio</p>
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-white/60">Total</span>
                      <span className="font-black text-coral text-3xl">
                        {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                      </span>
                    </div>

                    <Button 
                      className="w-full bg-coral hover:bg-coral-dark text-white rounded-[20px] h-16 font-black text-sm transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-coral/20"
                      disabled={total <= 0}
                    >
                      Ir para pagamento <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Producer Info */}
              <div className="bg-white rounded-[40px] border border-line p-8 space-y-6">
                <h4 className="text-[10px] font-black text-muted uppercase tracking-widest">Realização</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center border border-line font-black text-navy text-xs">
                    {data.event?.producer?.nome?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-navy uppercase">{data.event.producer?.nome || "Organização"}</p>
                    <p className="text-[10px] font-bold text-muted uppercase">Produtor Verificado</p>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-surface rounded-[40px] border border-line p-8 text-center space-y-6 group">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-line group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-8 h-8 text-coral" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-manrope font-black text-navy text-lg">Precisa de ajuda?</h4>
                  <p className="text-xs text-muted font-bold leading-relaxed">Nossos especialistas estão disponíveis para te ajudar em cada passo da sua jornada.</p>
                </div>
                <Button variant="outline" className="w-full rounded-2xl h-14 font-black text-xs gap-3 border-line hover:bg-navy hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" /> Atendimento Especializado
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-8 left-6 right-6 z-[110]">
        <Button 
          className="w-full bg-navy text-white rounded-3xl h-16 font-black shadow-2xl flex items-center justify-between px-8 transition-all active:scale-95"
          onClick={() => {
            const el = document.getElementById('tickets-section');
            el?.scrollIntoView({ behavior: 'smooth' });
            setActiveTab("tickets");
          }}
        >
          <div className="text-left">
            <span className="block text-[10px] text-white/50 uppercase font-bold tracking-widest">Total do Pedido</span>
            <span className="text-lg">{total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
          </div>
          <div className="flex items-center gap-2">
            Continuar <ChevronRight className="w-5 h-5" />
          </div>
        </Button>
      </div>
    </div>
  );
}