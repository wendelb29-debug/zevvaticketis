import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  Zap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
// CoverflowCarousel removido em favor do FeaturedCarousel moderno
import { EventCard } from "@/components/home/EventCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FAQAccordion } from "@/components/home/FAQAccordion";
// CityTicker removido para um visual mais limpo e moderno
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
  const navigate = useNavigate();
  const { language, setIsHomeSearchVisible, homeSearchTerm, setHomeSearchTerm } = useUI();
  const t = translations[language].home;
  const searchRef = useRef<HTMLDivElement>(null);

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
          .order("created_at", { ascending: false })
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
    const q = homeSearchTerm.toLowerCase();
    const name = (event.title ?? event.nome ?? "").toLowerCase();
    const city = (event.city ?? event.cidade ?? "").toLowerCase();
    return name.includes(q) || city.includes(q);
  });

  const handleToggleFavorite = async (eventId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate({ to: "/login" });
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
        await (supabase.from("event_favorites" as any).insert({
          event_id: eventId,
          user_id: session.user.id,
        }) as any);
        toast.success("Adicionado aos favoritos");
      }
    } catch (error) {
      toast.error("Erro ao favoritar evento");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsHomeSearchVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.1, rootMargin: "-80px 0px 0px 0px" }
    );

    if (searchRef.current) {
      observer.observe(searchRef.current);
    }

    return () => observer.disconnect();
  }, [setIsHomeSearchVisible]);

  return (
    <div
      className={cn("min-h-screen bg-background", language === "ar" ? "rtl" : "ltr")}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
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
                  onClick={() =>
                    navigate({
                      to: "/eventos",
                      search: {
                        busca: undefined,
                        categoria: undefined,
                        cidade: undefined,
                        data: undefined,
                      } as any,
                    })
                  }
                  className="h-14 px-10 bg-primary text-white font-bold rounded-md hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                  Explorar eventos
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate({ to: "/cadastro" })}
                  className="h-14 px-10 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-md hover:bg-white/20 transition-all"
                >
                  Criar meu evento
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* City Ticker removed for clean modern look */}

        {/* Minimalist Search */}
        <section ref={searchRef} className="relative -mt-12 z-20 px-6">
          <div className="max-w-5xl mx-auto bg-surface p-4 rounded-2xl shadow-2xl border border-border">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted h-5 w-5" />
                <Input
                  placeholder="Qual evento você está procurando?"
                  className="h-14 pl-12 pr-6 text-base rounded-xl border border-border bg-background focus-visible:ring-primary/20 placeholder:text-foreground-muted/50"
                  value={homeSearchTerm}
                  onChange={(e) => setHomeSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate({
                        to: "/eventos",
                        search: {
                          busca: homeSearchTerm,
                          categoria: undefined,
                          cidade: undefined,
                          data: undefined,
                        } as any,
                      });
                    }
                  }}
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

              <button
                onClick={() =>
                  navigate({
                    to: "/eventos",
                    search: {
                      busca: homeSearchTerm,
                      categoria: undefined,
                      cidade: undefined,
                      data: undefined,
                    } as any,
                  })
                }
                className="w-full md:w-auto h-14 px-10 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/10"
              >
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
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6">
              <FeaturedCarousel
                events={featuredEvents.map((e) => ({
                  id: e.id,
                  title: e.nome_evento || e.nome,
                  city: e.cidade || e.location_city,
                  cover_image: e.imagem_capa || e.imagem_url,
                  start_date: e.data_inicio || e.start_date,
                  min_price: e.price_from || e.ticket_types?.[0]?.valor,
                }))}
              />
            </div>
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
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
                  Personalizado
                </span>
                <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Sugeridos para você
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming - Minimalist Layout */}
        <section className="px-6 py-32 bg-background border-y border-border">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
                  Calendário
                </span>
                <h2 className="text-3xl md:text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Próximas experiências
                </h2>
              </div>
              <Link
                to="/eventos"
                search={
                  {
                    categoria: undefined,
                    busca: undefined,
                    cidade: undefined,
                    data: undefined,
                  } as any
                }
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
              >
                Ver Agenda Completa <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[16/10] rounded-sm bg-surface-elevated animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} onToggleFavorite={handleToggleFavorite} />
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
                {
                  title: "Liderança Exponencial",
                  tutor: "Dr. Marcos Silva",
                  hours: "40h",
                  mode: "Presencial",
                },
                {
                  title: "Marketing de Experiência",
                  tutor: "Ana Paula Melo",
                  hours: "12h",
                  mode: "Online",
                },
                {
                  title: "Gestão de Caravanas",
                  tutor: "Ricardo Santos",
                  hours: "24h",
                  mode: "Híbrido",
                },
              ].map((course, i) => (
                <div
                  key={i}
                  className="group p-8 bg-background rounded-xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold mb-6">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                  <p className="text-foreground-muted text-sm mb-6">Com {course.tutor}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <span className="text-xs font-bold text-foreground/60">
                      {course.hours} • {course.mode}
                    </span>
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
                {
                  title: "Caravana Terra Santa 2027",
                  from: "São Paulo",
                  to: "Israel",
                  date: "Maio 2027",
                  price: "US$ 3.500",
                  image:
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop",
                },
                {
                  title: "Congresso Europa 2026",
                  from: "Rio de Janeiro",
                  to: "Lisboa/Roma",
                  date: "Outubro 2026",
                  price: "US$ 2.800",
                  image:
                    "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80",
                },
              ].map((caravan, i) => (
                <div
                  key={i}
                  className="group flex flex-col md:flex-row gap-8 items-center bg-surface p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-full md:w-48 aspect-square overflow-hidden rounded-xl bg-background">
                    <img
                      src={caravan.image}
                      alt={caravan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {caravan.date}
                      </span>
                      <h3 className="text-2xl font-bold text-foreground leading-tight">
                        {caravan.title}
                      </h3>
                      <div className="flex items-center gap-6 text-sm font-medium text-foreground-muted">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider opacity-50">
                            Origem
                          </span>
                          <span className="font-bold text-foreground">{caravan.from}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider opacity-50">
                            Destino
                          </span>
                          <span className="font-bold text-foreground">{caravan.to}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-2xl font-black text-primary">{caravan.price}</span>
                      <button className="h-12 px-8 bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all rounded-md shadow-lg shadow-primary/10">
                        Saber mais
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Showcase - Modern & Clean */}
        <section className="px-6 py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-manrope font-extrabold text-foreground tracking-tight">
                Vantagens de comprar na Zevva
              </h2>
              <p className="text-foreground-muted font-medium text-lg">
                Sua segurança e experiência são nossa prioridade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Pagamento Seguro</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Transações criptografadas e suporte a diversos métodos de pagamento.
                </p>
              </div>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/10">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Suporte Dedicado</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Time pronto para ajudar em todas as etapas da sua jornada.
                </p>
              </div>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/10">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Ingresso Digital</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  Acesse seus ingressos instantaneamente em qualquer dispositivo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organizer CTA - Functional & Clean */}
        <section className="px-6 py-24 bg-dark-surface">
          <div className="max-w-7xl mx-auto">
            <div className="relative p-12 md:p-20 bg-primary rounded-2xl overflow-hidden shadow-2xl">
              <Zap className="absolute -top-10 -right-10 w-80 h-80 text-white/5 rotate-12" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-manrope font-extrabold text-white leading-tight">
                    Quer organizar seu evento na Zevva?
                  </h2>
                  <p className="text-white/80 text-xl font-medium">
                    Temos as melhores ferramentas de gestão, vendas e check-in para o seu negócio.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                  <button
                    onClick={() => navigate({ to: "/cadastro" })}
                    className="h-16 px-12 bg-white text-primary text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all rounded-md shadow-xl"
                  >
                    Começar agora
                  </button>
                  <button className="h-16 px-12 bg-transparent border-2 border-white/30 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-md">
                    Falar com especialista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PremiumNewsletter removido para simplificação inicial */}

        <section className="px-6 py-24 bg-surface border-t border-border">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-manrope font-extrabold text-foreground tracking-tight">
                Dúvidas frequentes
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
