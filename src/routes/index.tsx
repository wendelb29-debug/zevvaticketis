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
          .select("*, ticket_types(preco)")
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

  const filteredEvents = events.filter((event: any) => 
    event.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.cidade && event.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className={cn("min-h-screen bg-white", language === 'ar' ? "rtl" : "ltr")} dir={language === 'ar' ? "rtl" : "ltr"}>
      <Navbar selectedCity={null} />

      <main className="relative">
        {/* Premium Hero */}
        <section className="hero-premium-bg h-[600px] flex items-center justify-center text-center text-white px-6">
          <div className="max-w-3xl space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <h1 className="text-4xl md:text-7xl font-manrope font-black tracking-tighter uppercase leading-tight">
              Viva experiências que conectam pessoas
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90">
              Eventos, cursos, caravanas e experiências em um só lugar.
            </p>
          </div>
        </section>

        <CityTicker />


        {/* Main Search & Quick Filters */}
        <section className="relative -mt-16 z-20 px-6">
          <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-[32px] shadow-2xl border border-line space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-[2]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
                <Input 
                  placeholder="🔎 O que você procura? Ex: Congresso, Curso..."
                  className="h-14 pl-12 text-lg rounded-2xl border-2 border-line bg-surface/50 focus-visible:ring-coral"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-[1.5] flex gap-2">
                <button className="flex-1 h-14 bg-surface border-2 border-line rounded-2xl text-xs font-black text-navy uppercase flex items-center justify-center gap-2 hover:bg-line transition-all">
                  <MapPin className="w-4 h-4 text-coral" /> Localização
                </button>
                <button className="flex-1 h-14 bg-surface border-2 border-line rounded-2xl text-xs font-black text-navy uppercase flex items-center justify-center gap-2 hover:bg-line transition-all">
                  <Calendar className="w-4 h-4 text-coral" /> Data
                </button>
              </div>

              <button className="h-14 px-8 bg-coral text-white font-black rounded-2xl hover:bg-coral-dark transition-all shadow-lg active:scale-95">
                BUSCAR EXPERIÊNCIAS
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-widest pt-4 border-t border-line">
              <span>Buscas em alta:</span>
              <button className="px-3 py-1 bg-accent/30 rounded-full hover:bg-accent transition-colors">#Israel2027</button>
              <button className="px-3 py-1 bg-accent/30 rounded-full hover:bg-accent transition-colors">#Liderança</button>
              <button className="px-3 py-1 bg-accent/30 rounded-full hover:bg-accent transition-colors">#Festivais</button>
            </div>
          </div>
        </section>

        {/* Featured Coverflow */}
        <section className="py-24 bg-surface/10">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-manrope font-black text-navy uppercase tracking-tighter">
              Experiências em destaque
            </h2>
            <p className="text-muted-fg font-bold mt-4 uppercase tracking-widest text-xs md:text-sm">
              Seleção exclusiva Zevva para você
            </p>
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
                min_price: e.price_from || (e.ticket_types?.[0]?.preco)
              }))} 
            />
          )}
        </section>


        <section className="px-6 py-24 bg-surface/30">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-manrope font-black text-navy uppercase tracking-tighter">
                Explore Categorias
              </h2>
              <p className="text-muted-fg font-bold uppercase tracking-widest text-xs">
                O que você deseja vivenciar hoje?
              </p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        {/* Recomendados - Seção Inteligente */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-manrope font-black text-navy flex items-center gap-3">
                  <Star className="w-8 h-8 text-coral animate-pulse" /> Selecionados para você
                </h2>
                <p className="text-muted-fg font-bold uppercase tracking-widest text-xs">Com base no seu perfil e localização</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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


        {/* Eventos Próximos */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-manrope font-black text-navy flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-coral" /> Próximos Eventos
                </h2>
                <p className="text-muted-fg font-bold uppercase tracking-widest text-xs">As melhores experiências agendadas para você</p>
              </div>
              <Link 
                to="/eventos" 
                search={{ categoria: undefined, id: undefined }}
                className="group flex items-center gap-2 text-primary font-bold hover:underline"
              >
                Ver tudo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-[3/4] rounded-[24px] bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Cursos e Imersões */}
        <section className="px-6 py-24 bg-navy text-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-manrope font-black uppercase tracking-tighter">
                Aprenda com especialistas
              </h2>
              <p className="text-white/60 font-bold uppercase tracking-widest text-xs">
                Cursos, workshops e imersões presenciais e online
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Liderança Exponencial", tutor: "Dr. Marcos Silva", hours: "40h", mode: "Presencial" },
                { title: "Marketing de Experiência", tutor: "Ana Paula Melo", hours: "12h", mode: "Online" },
                { title: "Gestão de Caravanas", tutor: "Ricardo Santos", hours: "24h", mode: "Híbrido" }
              ].map((course, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 bg-coral rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-manrope font-black mb-2 uppercase">{course.title}</h3>
                  <p className="text-white/40 text-sm mb-6">Com {course.tutor}</p>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-coral" /> {course.hours}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full">{course.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caravanas Marketplace */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-manrope font-black text-navy flex items-center gap-3">
                  <Bus className="w-8 h-8 text-coral" /> Caravanas em Destaque
                </h2>
                <p className="text-muted-fg font-bold uppercase tracking-widest text-xs">Viagens em grupo com suporte completo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Caravana Terra Santa 2027", from: "São Paulo", to: "Israel", date: "Maio 2027", price: "US$ 3.500" },
                { title: "Congresso Europa 2026", from: "Rio de Janeiro", to: "Lisboa/Roma", date: "Outubro 2026", price: "US$ 2.800" }
              ].map((caravan, i) => (
                <div key={i} className="bg-surface rounded-[40px] p-8 border border-line flex flex-col md:flex-row gap-8 items-center group">
                  <div className="w-full md:w-48 h-48 bg-slate-200 rounded-[32px] flex items-center justify-center overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-manrope font-black text-navy uppercase leading-tight">{caravan.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                      <div><p className="text-coral">Origem</p><p className="text-navy">{caravan.from}</p></div>
                      <div><p className="text-coral">Destino</p><p className="text-navy">{caravan.to}</p></div>
                    </div>
                    <div className="pt-4 border-t border-line flex items-center justify-between">
                      <span className="text-xl font-manrope font-black text-navy">{caravan.price}</span>
                      <button className="px-6 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-colors">Reservar Vaga</button>
                    </div>
                  </div>
                </div>
              ))}
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

        <section className="px-6 py-24">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-manrope font-extrabold text-navy">
                Dúvidas Frequentes
              </h2>
              <p className="text-muted font-medium">
                Tudo o que você precisa saber sobre a Zevva
              </p>
            </div>
            <FAQAccordion />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

