import { createFileRoute, useParams, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { getCategoryBySlug, normalizeCategory } from "@/lib/event-categories";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/home/EventCard";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/eventos/categoria/$slug")({
  component: CategoryPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      busca: (search["busca"] as string) || undefined,
    };
  },
});

function CategoryPage() {
  const { slug } = useParams({ from: "/eventos/categoria/$slug" });
  const { busca } = useSearch({ from: "/eventos/categoria/$slug" });
  const [searchTerm, setSearchTerm] = useState(busca || "");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const category = getCategoryBySlug(slug);

  useEffect(() => {
    if (!category) {
      navigate({ 
        to: "/eventos", 
        search: { busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any, 
        replace: true 
      });
      return;
    }

    async function fetchEvents() {
      if (!category) return;
      setLoading(true);
      try {
        let query = supabase
          .from("events")
          .select("*, tenants(nome, logo), ticket_types(valor)")
          .eq("status", "publicado");

        const { data } = await query;
        
        if (data) {
          const filtered = data.filter((e: any) => {
            const normalized = normalizeCategory(e.category);
            const matchesCategory = normalized === (category as any).id;
            
            if (!matchesCategory) return false;
            
            if (searchTerm) {
              const q = searchTerm.toLowerCase();
              const title = (e.title ?? "").toLowerCase();
              const city = (e.city ?? "").toLowerCase();
              return title.includes(q) || city.includes(q);
            }
            
            return true;
          });
          setEvents(filtered);
        }
      } catch (error) {
        console.error("Error fetching category events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [category, slug, searchTerm, navigate]);

  if (!category) return null;

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <Link 
                to="/eventos" 
                search={{ busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any}
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground-muted hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Explorar
              </Link>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                    {category.name}
                  </h1>
                </div>
                <p className="text-foreground-muted font-medium text-lg max-w-xl">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted h-5 w-5" />
                <Input
                  placeholder={`Buscar em ${category.name}...`}
                  className="h-12 pl-12 rounded-xl border border-border bg-surface focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-surface/50">
              <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-foreground-muted" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Nenhum evento encontrado</h2>
              <p className="text-foreground-muted text-sm text-center max-w-sm">
                {searchTerm 
                  ? "Tente ajustar sua busca para encontrar o que procura nesta categoria." 
                  : `Ainda não temos eventos publicados na categoria ${category.name}.`}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
