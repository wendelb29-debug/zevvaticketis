import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { 
  Plus, 
  MapPin, 
  Video, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Ticket,
  DollarSign,
  Calendar,
  Eye,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_THEMES, CategoryType, getThemeByCategory } from "@/lib/categoryThemes";
import { cn } from "@/lib/utils";
import { Roadmap } from "@/components/produtor/Roadmap";

export const Route = createFileRoute("/produtor/")({
  component: ProdutorDashboard,
});

function ProdutorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) return null;

  const stats = [
    { label: "Eventos publicados", value: "0", color: "text-navy" },
    { label: "Ingressos vendidos", value: "0", color: "text-coral" },
    { label: "Receita total", value: "US$ 0,00", color: "text-good" },
  ];

  return (
    <div className="space-y-10 font-inter max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-manrope font-extrabold text-navy">
          {getTimeGreeting()}, {user?.user_metadata?.nome?.split(' ')[0] || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted font-medium">Já publicou seu evento?</p>
      </div>

      <Roadmap />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Criar evento presencial", icon: MapPin, desc: "Viagens, caravanas e shows", color: "from-coral/10 to-coral/5" },
          { label: "Criar evento online", icon: Video, desc: "Lives, webinars e reuniões", color: "from-navy/10 to-navy/5" },
          { label: "Criar conteúdo digital", icon: Smartphone, desc: "E-books, cursos e guias", color: "from-good/10 to-good/5" },
        ].map((item) => (
          <button 
            key={item.label}
            onClick={() => navigate({ to: '/criar-evento' })}
            className="group flex flex-col items-start p-6 rounded-[24px] border border-line bg-white hover:border-coral/30 hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className={cn("p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br", item.color)}>
              <item.icon className="w-6 h-6 text-navy" />
      </div>

      {/* Theme Preview Section */}
      <div className="bg-white rounded-[32px] border border-line p-8 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-manrope font-extrabold text-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral" /> Prévia de Temas Visuais
            </h2>
            <p className="text-xs text-muted font-medium uppercase tracking-widest">Veja como seu evento aparecerá para os participantes</p>
          </div>
          <Link to="/eventos" className="text-[10px] font-extrabold text-coral uppercase tracking-widest hover:underline">
            Ver página pública completa
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(Object.keys(CATEGORY_THEMES) as CategoryType[]).map((catName) => {
            const theme = CATEGORY_THEMES[catName];
            const Icon = theme.icon;
            return (
              <button 
                key={catName}
                onClick={() => navigate({ to: '/eventos', search: { categoria: catName } as any })}
                className="group p-4 rounded-2xl border-2 border-line hover:border-navy transition-all text-center space-y-3 bg-surface/30 active:scale-95"
                style={{ borderColor: theme.accentColor + '40' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-navy leading-tight">{theme.name}</p>
                <div className="pt-2 flex justify-center">
                  <Eye className="w-3.5 h-3.5 text-muted group-hover:text-navy" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
            <h3 className="font-bold text-navy mb-1">{item.label}</h3>
            <p className="text-xs text-muted font-medium">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 text-white dark-panel">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-coral/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-manrope font-extrabold leading-tight">
                Seu evento pode vender ainda mais!
              </h2>
              <p className="text-white/70 font-medium text-lg">
                Alcance pessoas em todo o mundo com a tecnologia da Zevva Tickets.
              </p>
            </div>
            
            <ul className="space-y-4">
              {[
                "Venda pacotes, caravanas, experiências e ingressos.",
                "Acompanhe vendas e participantes em um só lugar.",
                "Gerencie tudo diretamente pela Zevva Tickets."
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 font-semibold text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-coral flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <Button className="h-14 px-10 bg-gradient-to-r from-coral to-coral-dark text-white font-extrabold rounded-xl shadow-lg shadow-coral/20 hover:opacity-90 border-0 uppercase tracking-widest text-sm">
              Começar agora
            </Button>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel backdrop-blur-md p-6 rounded-2xl text-center shadow-lg bg-white/5">
                <p className="text-3xl font-manrope font-extrabold mb-1 text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-white/90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table Section */}
      <div className="bg-white rounded-[24px] border border-line shadow-sm overflow-hidden">
        <Tabs defaultValue="events" className="w-full">
          <div className="px-8 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-surface p-1 rounded-xl h-11">
              <TabsTrigger value="events" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-sm">Meus eventos</TabsTrigger>
              <TabsTrigger value="contents" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-sm">Meus conteúdos</TabsTrigger>
            </TabsList>
            
            <Button 
              onClick={() => navigate({ to: '/criar-evento' })}
              className="bg-navy hover:bg-navy/90 text-white font-bold rounded-xl h-11 px-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar novo evento
            </Button>
          </div>

          <TabsContent value="events" className="p-0 mt-6">
            <div className="border-t border-line">
              {/* Table Header */}
              <div className="bg-surface/50 grid grid-cols-12 gap-4 px-8 py-4 text-[10px] uppercase font-extrabold tracking-widest text-muted">
                <div className="col-span-5">Evento</div>
                <div className="col-span-2 text-center">Data</div>
                <div className="col-span-2 text-center">Vendas</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1"></div>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-6">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-navy">Você ainda não criou nenhum evento.</h3>
                  <p className="text-muted font-medium max-w-xs">
                    Comece a vender agora mesmo criando seu primeiro evento presencial ou online.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate({ to: '/criar-evento' })}
                  className="h-11 px-8 rounded-xl font-bold border-coral text-coral hover:bg-coral hover:text-white transition-all"
                >
                  Criar meu primeiro evento
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contents" className="py-20 text-center text-muted font-medium">
            Você ainda não possui conteúdos digitais cadastrados.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

