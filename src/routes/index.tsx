import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from "react";
import { 
  Search, 
  TrendingUp,
  ArrowRight
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


        <section className="px-6 py-16 bg-surface/30">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-manrope font-extrabold text-navy">{t.categories}</h2>
                <p className="text-muted font-medium">{t.categoriesSubtitle}</p>
              </div>
            </div>
            <CategoryGrid />
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-3xl font-manrope font-extrabold text-navy flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-coral" /> {t.nextEvents}
                </h2>
                <p className="text-muted font-medium">{t.nextEventsSubtitle}</p>
              </div>
              <Link 
                to="/eventos" 
                search={{ id: undefined, categoria: "CARAVANAS INTERNACIONAIS" }}
                className="group flex items-center gap-2 text-primary font-bold hover:underline"
              >

                {t.viewAll} <ArrowRight className={cn("w-4 h-4 group-hover:translate-x-1 transition-transform", language === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
              </Link>
            </div>

            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-[3/4] rounded-[24px] bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
                {filteredEvents.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted italic">
                    Nenhum evento encontrado para sua busca.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-24 bg-surface/30">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-manrope font-extrabold text-navy">
                {t.faq}
              </h2>
              <p className="text-muted font-medium">
                {t.faqSubtitle}
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
