import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/home/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersVertical, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";

const eventSearchSchema = z.object({
  busca: z.string().optional(),
  categoria: z.string().optional(),
  cidade: z.string().optional(),
  data: z.string().optional(),
});

export const Route = createFileRoute("/eventos/")({
  validateSearch: (search) => eventSearchSchema.parse(search),
  component: EventsListPage,
});

function EventsListPage() {
  const search = useSearch({ from: "/eventos/" });
  const { busca, categoria, cidade } = search;
  const navigate = useNavigate();

  const { data: events, isLoading, isError, refetch } = useQuery({
    queryKey: ["events-list", busca, categoria, cidade],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, tenants(nome, logo), ticket_types(valor)")
        .eq("status", "publicado");

      if (busca) {
        query = query.ilike("title", `%${busca}%`);
      }

      if (categoria) {
        const catUpper = categoria.toUpperCase();
        if (catUpper.includes("CARAVANA")) {
           query = query.ilike("category", "%CARAVANA%");
        } else if (catUpper.includes("CURSO") || catUpper.includes("WORKSHOP") || catUpper.includes("IMERSÃO")) {
           query = query.or(`category.ilike.%CURSO%,category.ilike.%WORKSHOP%,category.ilike.%IMERSÃO%`);
        } else {
           query = query.eq("category", categoria);
        }
      }

      if (cidade) {
        query = query.ilike("city", `%${cidade}%`);
      }

      const { data, error } = await (query.order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4 flex-1">
            <h1 className="text-4xl md:text-5xl font-manrope font-extrabold text-foreground tracking-tight">
              {categoria ? categoria : "Explorar Eventos"}
            </h1>
            <p className="text-muted-foreground-foreground font-medium text-lg">
              {busca ? `Resultados para "${busca}"` : "Descubra as melhores experiências internacionais."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground-foreground" />
              <Input
                placeholder="Buscar eventos..."
                className="pl-10 h-12 rounded-xl"
                defaultValue={busca}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate({ 
                      to: "/eventos", 
                      search: (prev: any) => ({ ...prev, busca: e.currentTarget.value }) 
                    });
                  }
                }}
              />
            </div>
            <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold px-6">
              <SlidersVertical className="w-4 h-4" /> Filtros
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-[16/10] w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 space-y-6">
            <div className="bg-danger/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
               <RefreshCw className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-2xl font-bold">Ops! Algo deu errado.</h2>
            <p className="text-muted-foreground-foreground">Não conseguimos carregar os eventos no momento.</p>
            <Button onClick={() => refetch()} className="bg-primary text-white font-bold">
              Tentar novamente
            </Button>
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-32 bg-surface rounded-[40px] border border-border border-dashed">
            <p className="text-xl font-bold text-muted-foreground-foreground mb-2">Nenhum evento encontrado.</p>
            <p className="text-muted-foreground-foreground">Tente ajustar seus filtros ou busca.</p>
            { (busca || categoria || cidade) && (
              <Button 
                variant="link" 
                onClick={() => navigate({ to: "/eventos", search: {} as any })}
                className="mt-4 text-primary font-bold"
              >
                Limpar todos os filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event: any) => (
              <Link 
                key={event.id}
                to="/eventos/$id" 
                params={{ id: event.id }}
                search={{ busca: undefined, categoria: undefined, cidade: undefined, data: undefined } as any}
              >
                <EventCard event={event} />
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
