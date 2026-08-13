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
  BookOpen,
  ShieldCheck,
  Globe,
  Zap
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
        {/* Functional Modern Hero */}
        <section className="relative h-[85vh] flex items-center bg-dark-surface overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-50"
              alt="Events background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-surface via-dark-surface/80 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-5xl md:text-7xl font-manrope font-extrabold text-white tracking-tight leading-[1.1]">
                Encontre experiências que valem a pena viver<span className="text-primary">.</span>
              </h1>
              <p className="text-xl text-white/70 font-medium max-w-xl leading-relaxed">
                Shows, festivais, encontros e eventos perto de você.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => navigate({ to: '/eventos', search: { id: undefined, categoria: undefined } as any })}
                  className="h-14 px-10 bg-primary text-white font-bold rounded-md hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                  Explorar eventos
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate({ to: '/cadastro' })}
                  className="h-14 px-10 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-md hover:bg-white/20 transition-all"
                >
                  Criar meu evento
                </button>
              </div>
            </div>
          </div>
        </section>

        <CityTicker />


        {/* Minimalist Search */}
        <section className="relative -mt-12 z-20 px-6">
          <div className="max-w-5xl mx-auto bg-surface p-4 rounded-2xl shadow-2xl border border-border">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted h-5 w-5" />
                <Input 
                  placeholder="Qual evento você está procurando?"
                  className="h-14 pl-12 pr-6 text-base rounded-xl border border-border bg-background focus-visible:ring-primary/20 placeholder:text-foreground-muted/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="hidden md:flex h-10 w-px bg-border mx-2" />

              <div className="flex items-center gap-2 px-4 w-full md:w-auto">
                <button className="h-14 px-6 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-background rounded-xl border border-border transition-colors whitespace-nowrap">
                  <MapPin className="w-4 h-4 text-primary" /> Onde?
                </button>
                <button className="h-14 px-6 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-background rounded-xl border border-border transition-colors whitespace-nowrap">
                  <Calendar className="w-4 h-4 text-primary" /> Quando?
                </button>
              </div>

              <button className="w-full md:w-auto h-14 px-10 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/10">
                Buscar agora
              </button>
            </div>
          </div>
        </section>

        {/* Featured Coverflow */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Eventos em destaque
                </h2>
                <p className="text-foreground-muted font-medium text-lg max-w-xl">
                  As melhores experiências selecionadas para você.
                </p>
              </div>
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


        <section className="px-6 py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                Explore por categorias
              </h2>
              <p className="text-foreground-muted font-medium text-lg">
                Encontre o evento perfeito para seu momento.
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
                <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Sugeridos para você
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
                <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Próximas experiências
                </h2>
              </div>
              <Link 
                to="/eventos" 
                search={{ categoria: undefined, id: undefined }}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
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

        {/* Cursos - Professional Modern Layout */}
        <section className="px-6 py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-manrope font-extrabold text-foreground tracking-tight">
                Cursos e Imersões
              </h2>
              <p className="text-foreground-muted font-medium text-lg">
                Conhecimento profissional com os melhores especialistas do mercado.
              </p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Liderança Exponencial", tutor: "Dr. Marcos Silva", hours: "40h", mode: "Presencial" },
                { title: "Marketing de Experiência", tutor: "Ana Paula Melo", hours: "12h", mode: "Online" },
                { title: "Gestão de Caravanas", tutor: "Ricardo Santos", hours: "24h", mode: "Híbrido" }
              ].map((course, i) => (
                <div key={i} className="group p-8 bg-background rounded-xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold mb-6">
                    0{i+1}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                  <p className="text-foreground-muted text-sm mb-6">Com {course.tutor}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <span className="text-xs font-bold text-foreground/60">{course.hours} • {course.mode}</span>
                    <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caravanas Marketplace - Modern Layout */}
        <section className="px-6 py-24 bg-background">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-primary pl-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-manrope font-extrabold text-foreground tracking-tight">
                  Caravanas
                </h2>
                <p className="text-foreground-muted font-medium text-lg">
                  Viagens organizadas com todo suporte que você precisa.
                </p>
              </div>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                { title: "Caravana Terra Santa 2027", from: "São Paulo", to: "Israel", date: "Maio 2027", price: "US$ 3.500", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop" },
                { title: "Congresso Europa 2026", from: "Rio de Janeiro", to: "Lisboa/Roma", date: "Outubro 2026", price: "US$ 2.800", image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80" }
              ].map((caravan, i) => (
                <div key={i} className="group flex flex-col md:flex-row gap-8 items-center bg-surface p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <div className="w-full md:w-48 aspect-square overflow-hidden rounded-xl bg-background">
                    <img src={caravan.image} alt={caravan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{caravan.date}</span>
                      <h3 className="text-2xl font-bold text-foreground leading-tight">{caravan.title}</h3>
                      <div className="flex items-center gap-6 text-sm font-medium text-foreground-muted">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider opacity-50">Origem</span>
                          <span className="font-bold text-foreground">{caravan.from}</span>
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

        {/* Features - Editorial Grid */}
        <section className="px-6 py-32 border-b border-border">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <div className="w-12 h-12 border border-accent flex items-center justify-center rounded-sm">
                  <ShieldCheck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-3xl font-serif">Segurança <br /><span className="italic">Criptográfica</span></h3>
                <p className="text-foreground-muted text-sm leading-relaxed font-medium">
                  Protocolos avançados que garantem a autenticidade de cada ingresso e a proteção total dos seus dados e transações.
                </p>
              </div>

              <div className="space-y-6">
                <div className="w-12 h-12 border border-accent flex items-center justify-center rounded-sm">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-3xl font-serif">Escala <br /><span className="italic">Global</span></h3>
                <p className="text-foreground-muted text-sm leading-relaxed font-medium">
                  Infraestrutura robusta preparada para suportar grandes volumes de tráfego e vendas em qualquer lugar do mundo.
                </p>
              </div>

              <div className="space-y-6">
                <div className="w-12 h-12 border border-accent flex items-center justify-center rounded-sm">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-3xl font-serif">Experiência <br /><span className="italic">Imersiva</span></h3>
                <p className="text-foreground-muted text-sm leading-relaxed font-medium">
                  Design orientado à emoção, transformando a compra de um ingresso em um prelúdio memorável do próprio evento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - Editorial Section */}
        <section className="px-6 py-32 bg-surface-base">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-16">
              <div className="space-y-6">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Confiança</span>
                <h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-[0.9]">
                  Líderes que <br /><span className="italic">Transformam</span> com a Zevva
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                {[1,2,3,4].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20" />
                    <div>
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Organizador Verificado</p>
                      <p className="text-xs text-foreground-muted font-medium italic">Agência de Turismo {i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative p-12 md:p-20 bg-primary text-white rounded-sm overflow-hidden">
               <Award className="absolute -top-10 -right-10 w-80 h-80 text-white/5 rotate-12" />
               <div className="relative z-10 space-y-10">
                 <p className="text-3xl md:text-4xl font-serif italic leading-tight">
                   "A Zevva transformou a maneira como organizamos nossas caravanas internacionais. A estética editorial e a segurança 3D elevaram nossa percepção de valor perante os clientes."
                 </p>
                 <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-accent/20 rounded-full border border-white/10" />
                   <div>
                     <p className="text-sm font-bold uppercase tracking-[0.2em]">Dr. André Valadão</p>
                     <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Lagaroinha Global</p>
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

