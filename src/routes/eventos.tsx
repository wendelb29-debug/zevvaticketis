import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, normalizeCategory } from "@/lib/event-categories";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/home/EventCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Search, MapPin, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/eventos")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      busca: (search["busca"] as string) || undefined,
      categoria: (search["categoria"] as string) || undefined,
      cidade: (search["cidade"] as string) || undefined,
      data: (search["data"] as string) || undefined,
    };
  },
  component: ExplorarEventosPage,
});

function ExplorarEventosPage() {
  const search = useSearch({ from: "/eventos" });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(search.busca || "");

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        let query = supabase
          .from("events")
          .select("*, tenants(nome, logo), ticket_types(valor)")
          .eq("status", "publicado")
          .order("created_at", { ascending: false });

        const { data } = await query;
        
        if (data) {
          let filtered = data;

          if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(e => {
              const title = (e.title ?? e.nome ?? "").toLowerCase();
              const city = (e.city ?? e.cidade ?? "").toLowerCase();
              return title.includes(q) || city.includes(q);
            });
          }

          if (search.categoria) {
            filtered = filtered.filter(e => normalizeCategory(e.category) === normalizeCategory(search.categoria));
          }

          setEvents(filtered);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchTerm, search.categoria, search.cidade, search.data]);

  const groupedEvents = CATEGORIES.map(cat => {
    const catEvents = events.filter(e => normalizeCategory(e.category) === cat.id);
    return { ...cat, events: catEvents };
  }).filter(group => group.events.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-manrope font-extrabold text-foreground tracking-tight">
                  Explorar eventos
                </h1>
                <p className="text-foreground-muted font-medium text-lg">
                  Encontre as melhores experiências em todo o Brasil.
                </p>
              </div>

              <div className="w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted h-5 w-5" />
                  <Input
                    placeholder="Buscar eventos..."
                    className="h-12 pl-12 rounded-xl border border-border bg-surface focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <section className="p-8 bg-surface border border-border rounded-2xl">
              <div className="flex flex-col space-y-8">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Categorias</span>
                </div>
                <CategoryGrid />
              </div>
            </section>
          </div>

          {/* Events Content */}
          <div className="space-y-20">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : groupedEvents.length > 0 ? (
              groupedEvents.map((group) => (
                <section key={group.id} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                        <group.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-manrope font-extrabold text-foreground tracking-tight">
                        {group.name} em destaque
                      </h2>
                    </div>
                    <Link
                      to={group.id === "CURSOS" ? "/cursos" : "/eventos/categoria/$slug"}
                      params={group.id === "CURSOS" ? {} : { slug: group.slug }}
                      className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      Ver todos
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {group.events.slice(0, 4).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-surface/50">
                <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-foreground-muted" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Nenhum evento encontrado</h2>
                <p className="text-foreground-muted text-sm text-center max-w-sm">
                  Tente ajustar seus filtros ou busca para encontrar o que procura.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
