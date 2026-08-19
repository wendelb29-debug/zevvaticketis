import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Target, BarChart3, TrendingUp, Users, ArrowRight, Loader2, Zap } from "lucide-react";

export function MarketingPanel({ tenantId }: { tenantId: string }) {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-tenant-marketing", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Carregando marketing...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-inter animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-manrope font-black text-foreground tracking-tighter uppercase">🚀 Marketing & Zevva Ads</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestão de visibilidade e performance de campanhas.</p>
        </div>
        <Button className="bg-navy hover:bg-navy/90 text-primary-foreground font-black px-8 h-12 shadow-lg rounded-2xl uppercase tracking-widest text-xs gap-2">
           <Zap className="w-4 h-4 text-primary" />
           Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard 
            title="Impressões Totais" 
            value="12.4k" 
            icon={Target} 
            trend="+18%"
         />
         <MetricCard 
            title="CTR Médio" 
            value="3.2%" 
            icon={TrendingUp} 
            trend="+2.1%"
         />
         <MetricCard 
            title="Conversão" 
            value="1.8%" 
            icon={Users} 
            trend="-0.5%"
            trendColor="text-rose-500"
         />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-manrope font-black text-navy uppercase tracking-tight">Campanhas Zevva Ads</h2>
        <div className="grid gap-6">
          {ads?.map((ad: any) => (
            <Card key={ad.id} className="bg-card border-border overflow-hidden rounded-[32px] hover:border-primary/40 transition-all group shadow-sm">
              <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-24 h-16 rounded-2xl bg-muted/40 overflow-hidden shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
                  {ad.image_url ? (
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Megaphone className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3">
                     <h3 className="text-lg font-black text-navy">{ad.title}</h3>
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${ad.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-muted text-muted-foreground border-border'}`}>
                        {ad.status}
                     </span>
                  </div>
                  <div className="flex gap-6 text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {ad.impressions || 0} Impressões</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> {ad.clicks || 0} Cliques</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-navy hover:bg-navy/5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {ads?.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-[40px] border border-dashed border-border/60">
               <div className="w-20 h-20 bg-muted/40 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                  <Megaphone size={40} />
               </div>
               <p className="text-sm font-bold text-foreground uppercase tracking-tight">Nenhuma campanha ativa</p>
               <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">Promova eventos na página inicial e aumente as vendas deste ambiente.</p>
               <Button variant="link" className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest">Ativar Zevva Ads</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendColor = "text-emerald-500" }: any) {
   return (
      <Card className="bg-card border-border rounded-[32px] shadow-sm overflow-hidden group hover:shadow-md transition-all">
         <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-navy/5 rounded-2xl text-navy group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
               </div>
               <span className={`text-[10px] font-black ${trendColor} bg-white px-2 py-1 rounded-full shadow-sm`}>
                  {trend}
               </span>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
               <p className="text-3xl font-black text-navy">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}
