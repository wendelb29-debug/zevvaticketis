import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Building2, 
  Target, 
  BarChart3, 
  Settings2, 
  Megaphone,
  TrendingUp,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvertiserList } from "@/components/admin/marketing/ads/AdvertiserList";
import { CampaignList } from "@/components/admin/marketing/ads/CampaignList";
import { AdsDashboard } from "@/components/admin/marketing/ads/AdsDashboard";

export const Route = createFileRoute("/admin/marketing/anuncios")({
  component: AnunciosPage,
});

function AnunciosPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'advertisers'>('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'campaigns', label: 'Campanhas', icon: Target },
    { id: 'advertisers', label: 'Anunciantes', icon: Building2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Megaphone className="h-3 w-3" /> Marketing & Ads
          </div>
          <h1 className="text-3xl md:text-4xl font-manrope font-black text-foreground tracking-tighter">
            Central de Anúncios<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-xl">
            Gerencie parceiros, campanhas patrocinadas e acompanhe a performance do marketplace em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Configurações
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-2xl border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id 
                ? "bg-card text-foreground shadow-sm border border-border" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <AdsDashboard />}
        {activeTab === 'campaigns' && <CampaignList />}
        {activeTab === 'advertisers' && <AdvertiserList />}
      </div>

      {/* Footer Info */}
      <div className="bg-brand-dark rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Zevva Ads Network v1.0</p>
            <p className="text-xs text-white/50">Rede de publicidade nativa integrada ao Marketplace.</p>
          </div>
        </div>
        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
          Documentação da API <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

