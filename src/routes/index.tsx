import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Ticket,
  Video,
  Sparkles,
  Users,
  Compass,
  Star,
  Globe,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
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

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { language } = useUI();
  const t = translations[language].home;

  useEffect(() => {
    tracking.captureUTMs();
    tracking.logEvent("page_view_home");
    async function fetchEvents() {
      const { data: featured } = await (supabase
        .from("events")
        .select("*")
        .eq("status", "publicado")
        .limit(5) as any);
      
      const { data: all } = await (supabase
        .from("events")
        .select("*, ticket_types(preco)")
        .eq("status", "publicado")
        .order('created_at', { ascending: false })
        .limit(8) as any);

      if (featured) setFeaturedEvents(featured);
      if (all) setEvents(all);
      setLoading(false);
    }

    fetchEvents();
  }, []);

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
      <Navbar selectedCity={selectedCity} />

      <main className="pt-36 relative">
        {/* City Ticker */}
        <CityTicker />

        {/* Search Bar Overlay */}
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg h-5 w-5 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Buscar por evento, cidade ou categoria..."
              className="h-16 pl-12 pr-4 text-lg rounded-2xl shadow-xl border-border bg-white focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Hero Section / Carousel */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <FeaturedCarousel events={featuredEvents} />
          </div>
        </section>

        {/* Categories Section */}
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

        {/* Events Grid */}
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

            {loading ? (
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

        {/* FAQ Section */}
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
