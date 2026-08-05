import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    activeProducers: 0,
    publishedEvents: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count active producers (organizations)
        const { count: producersCount } = await supabase
          .from("organizations")
          .select("*", { count: 'exact', head: true });

        // Count published events
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: 'exact', head: true });

        // Calculate total revenue from ledger_entries (tipo 'taxa_plataforma')
        // Using correct schema column names from types.ts: 'tipo' and 'valor'
        const { data: ledgerData } = await supabase
          .from("ledger_entries")
          .select("valor")
          .eq("tipo", "taxa_plataforma");
        
        const revenue = ledgerData?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;

        setStats({
          activeProducers: producersCount || 0,
          publishedEvents: eventsCount || 0,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Produtores Ativos",
      value: stats.activeProducers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Organizações cadastradas"
    },
    {
      title: "Eventos Publicados",
      value: stats.publishedEvents,
      icon: Calendar,
      color: "text-coral",
      bg: "bg-coral/10",
      description: "Total de eventos no ar"
    },
    {
      title: "Receita de Taxas",
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Soma de taxas da plataforma"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-foreground">Dashboard Geral</h1>
        <p className="text-muted-fg">Visão panorâmica do ecossistema Zevva Tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-muted-fg">{card.title}</CardTitle>
              <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-manrope font-extrabold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-fg mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-manrope font-bold">Atividades Recentes</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary gap-1">Ver tudo <ChevronRight className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-muted-fg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Novo produtor aprovado</p>
                      <p className="text-xs text-muted-fg">Há 2 horas • Agência Trip</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/30 text-emerald-500 bg-emerald-500/5">Sucesso</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-manrope font-bold">Performance da Plataforma</CardTitle>
            <TrendingUp className="w-5 h-5 text-muted-fg" />
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center text-muted-fg bg-accent/20 rounded-xl m-2 border border-dashed border-border text-sm">
            Gráfico de Crescimento (Simulado)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
