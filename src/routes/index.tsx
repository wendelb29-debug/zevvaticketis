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
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { EventCard } from "@/components/home/EventCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { CityTicker } from "@/components/home/CityTicker";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      const { data: featured } = await supabase
        .from("events")
        .select("*")
        .eq("destaque", true)
        .eq("status", "publicado")
        .limit(5);
      
      const { data: all } = await supabase
        .from("events")
        .select("*")
        .eq("status", "publicado")
        .limit(8);

      if (featured) setFeaturedEvents(featured);
      if (all) setEvents(all);
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const handleToggleFavorite = async (eventId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate({ to: '/login' });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("event_favorites")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("event_favorites")
          .delete()
          .eq("id", existing.id);
        toast.success("Removido dos favoritos");
      } else {
        await supabase
          .from("event_favorites")
          .insert({
            event_id: eventId,
            user_id: session.user.id
          });
        toast.success("Adicionado aos favoritos");
      }
    } catch (error) {
      toast.error("Erro ao favoritar evento");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar selectedCity={selectedCity} />

      <main className="pt-36">
        {/* City Ticker */}
        <CityTicker />

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
                <h2 className="text-3xl font-manrope font-extrabold text-navy">Categorias</h2>
                <p className="text-muted font-medium">Encontre o evento perfeito para seu momento.</p>
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
                  <TrendingUp className="w-8 h-8 text-coral" /> Próximos Eventos
                </h2>
                <p className="text-muted font-medium">As melhores experiências selecionadas para você.</p>
              </div>
              <Link 
                to="/eventos" 
                className="group flex items-center gap-2 text-coral font-bold hover:underline"
              >
                Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                {events.map((event) => (
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

        {/* FAQ Section */}
        <section className="px-6 py-24 bg-surface/30">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-manrope font-extrabold text-navy">
                Dúvidas Frequentes
              </h2>
              <p className="text-muted font-medium">
                Tudo o que você precisa saber sobre a Zevva Tickets.
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
