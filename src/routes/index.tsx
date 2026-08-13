import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from "react";
import { 
  Search, 
  TrendingUp,
  ArrowRight,
  MapPin,
  Calendar,
  Star,
  Bus,
  Users,
  Award,
  BookOpen
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { EventCard } from "@/components/home/EventCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { CityTicker } from "@/components/home/CityTicker";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUI } from "@/hooks/use-ui";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { tracking } from "@/lib/tracking";
import { getFeaturedEvents } from "@/lib/events.functions";
import { useServerFn } from "@tanstack/react-start";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumNewsletter } from "@/components/ui/premium-newsletter";
import { GridPatternCard, GridPatternCardBody } from "@/components/ui/card-with-grid-pattern";
import { AdmitOneTicket } from "@/components/ui/admit-one-ticket";


export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { language } = useUI();
  const t = translations[language].home;
  
  const fetchFeatured = useServerFn(getFeaturedEvents);

  useEffect(() => {
    tracking.captureUTMs();
    tracking.logEvent("page_view_home");
    
    async function fetchInitialData() {
      try {
        const featured = await fetchFeatured();
        setFeaturedEvents(featured || []);
        setLoadingFeatured(false);
        
        const { data: all } = await (supabase
          .from("events")
          .select("*, tenants(nome, logo), ticket_types(valor)")
          .eq("status", "publicado")
          .order('created_at', { ascending: false })
          .limit(8) as any);


        if (all) setEvents(all);
        setLoadingEvents(false);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        setLoadingFeatured(false);
        setLoadingEvents(false);
      }
    }

    fetchInitialData();
  }, [fetchFeatured]);

  const filteredEvents = events.filter((event: any) => {
    const q = searchTerm.toLowerCase();
    const name = (event.title ?? event.nome ?? "").toLowerCase();
    const city = (event.city ?? event.cidade ?? "").toLowerCase();
    return name.includes(q) || city.includes(q);
  });

  const handleToggleFavorite = async (eventId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate({ to: '/login' });
      return;
    }

    try {
      const { data: existing } = await (supabase
        .from("event_favorites" as any)
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", session.user.id)
        .maybeSingle() as any);

      if (existing) {
        await (supabase
          .from("event_favorites" as any)
          .delete()
          .eq("id", existing.id) as any);
        toast.success("Removido dos favoritos");
      } else {
        await (supabase
          .from("event_favorites" as any)
          .insert({
            event_id: eventId,
            user_id: session.user.id
          }) as any);
        toast.success("Adicionado aos favoritos");
      }
    } catch (error) {
      toast.error("Erro ao favoritar evento");
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", language === 'ar' ? "rtl" : "ltr")} dir={language === 'ar' ? "rtl" : "ltr"}>
      <Navbar selectedCity={null} />
 
      <main className="relative">
        {/* Editorial Hero */}
        <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-[#0A0A0A]">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale"
              alt="Experience background"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-[10px] font-bold text-white uppercase tracking-[0.2em] backdrop-blur-sm">
                Exclusividade Zevva
              </span>
              <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-[0.9]">
                Momentos que <br />
                <span className="italic text-accent">transcendem</span>.
              </h1>
              <p className="text-lg md:text-xl text-white/60 font-medium max-w-xl leading-relaxed">
                Curadoria de eventos, caravanas internacionais e experiências culturais de alto padrão.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="h-14 px-8 bg-white text-black font-bold rounded-sm hover:bg-white/90 transition-all">
                  Explorar Calendário
                </button>
                <button className="h-14 px-8 border border-white/20 text-white font-bold rounded-sm hover:bg-white/5 transition-all">
                  Nossa Curadoria
                </button>
              </div>
            </div>
          </div>
        </section>

        <CityTicker />


        {/* Minimalist Search */}
        <section className="relative -mt-12 z-20 px-6">
          <div className="max-w-6xl mx-auto bg-surface-base p-2 rounded-xl shadow-xl border border-border">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground-muted h-4 w-4" />
                <Input 
                  placeholder="Encontrar experiência ou destino..."
                  className="h-16 pl-14 pr-6 text-base rounded-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground-muted/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="hidden md:flex h-10 w-px bg-border mx-2" />

              <div className="flex items-center gap-2 px-4 w-full md:w-auto">
                <button className="h-16 px-4 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-background rounded-lg transition-colors whitespace-nowrap">
                  <MapPin className="w-4 h-4 text-accent" /> Local
                </button>
                <button className="h-16 px-4 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-background rounded-lg transition-colors whitespace-nowrap">
                  <Calendar className="w-4 h-4 text-accent" /> Quando
                </button>
              </div>

              <button className="w-full md:w-auto h-16 px-10 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/10">
                PESQUISAR
              </button>
            </div>
          </div>
        </section>

        {/* Featured Coverflow */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Curadoria Semanal</span>
                <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                  Experiências em <span className="italic">Destaque</span>
                </h2>
              </div>
              <p className="text-foreground-muted font-medium max-w-xs text-sm leading-relaxed">
                Seleção exclusiva de eventos que definem novos padrões de excelência cultural e profissional.
              </p>
            </div>
          </div>
          
          {loadingFeatured ? (
            <div className="max-w-7xl mx-auto px-6">
              <Skeleton className="h-[500px] w-full rounded-[40px]" />
            </div>
          ) : (
            <CoverflowCarousel 
              events={featuredEvents.map(e => ({
                id: e.id,
                nome: e.nome_evento || e.nome,
                cidade: e.cidade || e.location_city,
                categoria: e.categoria,
                imagem_url: e.imagem_capa || e.imagem_url,
                data_inicio: e.data_inicio || e.start_date,
                slug: e.slug,
                min_price: e.price_from || (e.ticket_types?.[0]?.valor),
                producer_name: e.tenants?.nome
              }))} 
            />

          )}
        </section>


        <section className="px-6 py-32 bg-surface-base border-y border-border">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Curadoria Zevva</span>
              <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                Explore por <span className="italic">Categorias</span>
              </h2>
              <p className="text-foreground-muted font-medium text-sm leading-relaxed">
                Descubra experiências personalizadas através de nossos eixos temáticos exclusivos.
              </p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        {/* Selected for You - Minimal Grid */}
        <section className="px-6 py-32">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Personalizado</span>
                <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                  Sugeridos para <span className="italic">Você</span>
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.slice(0, 4).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>


        {/* Upcoming - Minimalist Layout */}
        <section className="px-6 py-32 bg-background border-y border-border">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Calendário</span>
                <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                  Próximas <span className="italic">Experiências</span>
                </h2>
              </div>
              <Link 
                to="/eventos" 
                search={{ categoria: undefined, id: undefined }}
                className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:text-foreground transition-colors"
              >
                Ver Agenda Completa <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
 
            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-[16/10] rounded-sm bg-surface-elevated animate-pulse border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cursos - Editorial Layout */}
        <section className="px-6 py-32 bg-[#0F0F0F] text-white">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Conhecimento Profissional</span>
              <h2 className="text-5xl md:text-7xl font-serif tracking-tight">
                Aprenda com <br /><span className="italic text-accent">Especialistas</span>
              </h2>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Liderança Exponencial", tutor: "Dr. Marcos Silva", hours: "40h", mode: "Presencial" },
                { title: "Marketing de Experiência", tutor: "Ana Paula Melo", hours: "12h", mode: "Online" },
                { title: "Gestão de Caravanas", tutor: "Ricardo Santos", hours: "24h", mode: "Híbrido" }
              ].map((course, i) => (
                <div key={i} className="group border-b border-white/10 pb-12 hover:border-accent transition-colors">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-8 block">Módulo 0{i+1}</span>
                  <h3 className="text-3xl font-serif mb-4 leading-tight">{course.title}</h3>
                  <p className="text-white/40 text-sm mb-8 font-medium italic">Com {course.tutor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{course.hours} • {course.mode}</span>
                    <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caravanas Marketplace - Editorial Grid */}
        <section className="px-6 py-32 bg-surface-base border-t border-border">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Oportunidades</span>
                <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                  Caravanas em <span className="italic text-accent">Destaque</span>
                </h2>
              </div>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                { title: "Caravana Terra Santa 2027", from: "São Paulo", to: "Israel", date: "Maio 2027", price: "US$ 3.500", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop" },
                { title: "Congresso Europa 2026", from: "Rio de Janeiro", to: "Lisboa/Roma", date: "Outubro 2026", price: "US$ 2.800", image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80" }
              ].map((caravan, i) => (
                <div key={i} className="group flex flex-col md:flex-row gap-10 items-start border-b border-border pb-12 hover:border-accent transition-colors">
                  <div className="w-full md:w-64 aspect-square overflow-hidden rounded-sm grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={caravan.image} alt={caravan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="flex-1 space-y-8 py-2">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{caravan.date}</span>
                      <h3 className="text-3xl font-serif leading-tight">{caravan.title}</h3>
                      <div className="flex items-center gap-8 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] opacity-60">Origem</span>
                          <span>{caravan.from}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] opacity-60">Destino</span>
                          <span>{caravan.to}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-serif italic text-primary">{caravan.price}</span>
                      <button className="h-12 px-8 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all rounded-sm">
                        Reservar Vaga
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admit One Ticket Showcase - Minimalist Modern */}
        <section className="px-6 py-32 bg-[#F0EFEC] border-y border-border overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Tecnologia Exclusiva</span>
              <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                Seu Ingresso <br /><span className="italic text-accent">Redefinido</span>
              </h2>
              <p className="text-foreground-muted font-medium text-lg">
                Experiência interativa 3D com segurança criptográfica e estética editorial premium.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <AdmitOneTicket 
                title="Congresso Internacional de Liderança"
                date="15 DE OUTUBRO, 2026"
                location="SÃO PAULO, BRASIL"
                price="R$ 450,00"
                className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* Grid Pattern Showcase - Por que a Zevva? */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-manrope font-black text-navy uppercase tracking-tighter">
                Por que escolher a Zevva?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GridPatternCard>
                <GridPatternCardBody>
                  <h3 className="text-2xl font-manrope font-black text-navy uppercase mb-4">Tecnologia 3D</h3>
                  <p className="text-muted-fg font-medium">Ingressos interativos com segurança criptográfica e visual premium.</p>
                </GridPatternCardBody>
              </GridPatternCard>

              <GridPatternCard>
                <GridPatternCardBody>
                  <h3 className="text-2xl font-manrope font-black text-navy uppercase mb-4">Ecossistema</h3>
                  <p className="text-muted-fg font-medium">Conectamos organizadores e participantes em uma jornada completa.</p>
                </GridPatternCardBody>
              </GridPatternCard>

              <GridPatternCard>
                <GridPatternCardBody>
                  <h3 className="text-2xl font-manrope font-black text-navy uppercase mb-4">Alcance Global</h3>
                  <p className="text-muted-fg font-medium">Especialistas em caravanas internacionais e grandes eventos.</p>
                </GridPatternCardBody>
              </GridPatternCard>
            </div>
          </div>
        </section>

        {/* Produtores e Prova Social */}
        <section className="px-6 py-24 bg-surface/30">

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-manrope font-black text-navy uppercase tracking-tighter leading-tight">
                  Organizadores verificados
                </h2>
                <p className="text-muted-fg font-bold uppercase tracking-widest text-xs">
                  Confiança e segurança em todas as experiências
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white p-6 rounded-[24px] border border-line flex items-center gap-4 group cursor-pointer hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-accent rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-navy uppercase">Agência {i}</p>
                      <p className="text-[10px] font-bold text-muted">150+ Eventos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy p-12 rounded-[48px] text-white space-y-8 relative overflow-hidden">
               <Award className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
               <div className="relative z-10">
                 <p className="text-2xl font-manrope font-medium italic leading-relaxed">
                   "A Zevva transformou a maneira como organizamos nossas caravanas internacionais. A gestão de pagamentos e a comunicação com os viajantes é impecável."
                 </p>
                 <div className="mt-8 flex items-center gap-4">
                   <div className="w-14 h-14 bg-coral rounded-2xl" />
                   <div>
                     <p className="font-black uppercase tracking-widest text-sm">Pr. André Valadão</p>
                     <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Lagaroinha Global</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        <PremiumNewsletter />

        <section className="px-6 py-32 border-t border-border">
          <div className="max-w-3xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Suporte</span>
              <h2 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight">
                Dúvidas <span className="italic">Frequentes</span>
              </h2>
            </div>
            <FAQAccordion />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

