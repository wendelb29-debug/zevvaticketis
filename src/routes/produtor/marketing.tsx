import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Megaphone, 
  Smartphone, 
  Plus, 
  Users, 
  TrendingUp, 
  Zap, 
  LayoutDashboard,
  Filter,
  Globe,
  Rocket
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenants } from "@/hooks/use-tenants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produtor/marketing")({
  component: ProjectMarketingPanel,
});

function ProjectMarketingPanel() {
  const { activeTenant } = useTenants();

  const { data: stats } = useQuery({
    queryKey: ["marketing-stats", activeTenant?.id],
    enabled: !!activeTenant,
    queryFn: async () => {
      // Mock stats for demo
      return {
        reach: "45.8k",
        conversion: "4.2%",
        roi: "3.5x",
        activeCampaigns: 12
      };
    }
  });

  return (
    <div className="space-y-8 font-inter animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-manrope font-black text-navy tracking-tighter uppercase">🚀 Central de Marketing</h1>
          <p className="text-sm text-muted font-medium">Gerencie anúncios, push e campanhas deste projeto.</p>
        </div>
        <Button className="bg-coral hover:bg-coral/90 text-white gap-2 font-black px-8 h-12 shadow-lg shadow-coral/20 rounded-xl uppercase tracking-widest text-xs">
          <Plus className="w-5 h-5" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Alcance Total", value: stats?.reach || "0", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Conversão Média", value: stats?.conversion || "0%", icon: Zap, color: "text-primary", bg: "bg-primary/5" },
          { label: "ROI Médio", value: stats?.roi || "0x", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Campanhas Ativas", value: stats?.activeCampaigns || 0, icon: Megaphone, color: "text-orange-500", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-fg uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-navy">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="campanhas" className="w-full">
        <TabsList className="bg-white border border-line p-1 rounded-2xl h-14 shadow-sm mb-8 w-full justify-start overflow-x-auto">
          <TabsTrigger value="campanhas" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <Rocket className="w-4 h-4" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="push" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <Smartphone className="w-4 h-4" /> Push Notifications
          </TabsTrigger>
          <TabsTrigger value="audiencia" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
            <Users className="w-4 h-4" /> Audiência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas" className="space-y-6">
          <Card className="border-line shadow-sm rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-line flex justify-between items-center bg-surface/30">
              <h2 className="text-sm font-black text-navy uppercase tracking-widest">Campanhas Recentes</h2>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">Ver Tudo</Button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface text-muted text-[10px] font-black uppercase tracking-widest border-b border-line">
                  <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Alcance</th>
                    <th className="px-6 py-4">Cliques</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    { name: "Lançamento Verão 🏖️", status: "ativa", reach: "12.5k", clicks: "450" },
                    { name: "Promoção Relâmpago ⚡", status: "pausada", reach: "8.2k", clicks: "120" },
                    { name: "Retargeting VIP 💎", status: "finalizada", reach: "2.1k", clicks: "650" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-navy">{row.name}</td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          row.status === "ativa" ? "bg-green-500" : row.status === "pausada" ? "bg-amber-500" : "bg-slate-500"
                        )}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-navy">{row.reach}</td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-fg">{row.clicks}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase">Detalhes</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
