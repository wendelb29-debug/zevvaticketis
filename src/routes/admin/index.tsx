import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Ticket, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: producers },
        { count: events },
        { data: ledger }
      ] = await Promise.all([
        supabase.from("organizations").select("*", { count: 'exact', head: true }),
        supabase.from("events").select("*", { count: 'exact', head: true }),
        supabase.from("ledger_entries").select("valor").eq("tipo", "taxa_plataforma")
      ]);

      const revenue = ledger?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0;
      return { producers: producers || 0, events: events || 0, revenue };
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-manrope font-extrabold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Produtores Ativos" value={stats?.producers || 0} icon={Users} />
        <StatCard title="Eventos Publicados" value={stats?.events || 0} icon={Ticket} />
        <StatCard title="Receita (Taxas)" value={`R$ ${stats?.revenue?.toFixed(2) || "0.00"}`} icon={DollarSign} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}