import { createFileRoute, redirect, useNavigate, Link, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  User as UserIcon, 
  Globe, 
  Users, 
  BarChart3, 
  LogOut,
  Bell,
  Menu,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Ticket,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/criar-evento")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
    
    // Check if user is a producer (has organization membership)
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single();
      
    if (!member) throw redirect({ to: "/" });
  },
  component: CriarEventoWizard,
});

function CriarEventoWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    category: "",
    event_type: "presencial",
    country_id: "Brasil",
    city: "",
    location: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    instagram: "",
    whatsapp: "",
    site: "",
    featured: false,
    status: "rascunho"
  });
  const [tickets, setTickets] = useState<any[]>([
    { id: 1, name: "Lote 1", description: "", price: 0, quantity: 100, sale_start: "", sale_end: "", limit_per_buyer: 5 }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Simple autosave simulation
    const saved = localStorage.getItem("zevva_event_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (parsed.tickets) setTickets(parsed.tickets);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("zevva_event_draft", JSON.stringify({ formData, tickets }));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData, tickets]);

  const steps = [
    { id: 1, title: "Informações básicas" },
    { id: 2, title: "Local e data" },
    { id: 3, title: "Ingressos" },
    { id: 4, title: "Divulgação" },
    { id: 5, title: "Revisão" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const menuItems = [
    { label: "Início", icon: LayoutDashboard, href: "/produtor" },
    { label: "Dados", icon: UserIcon, href: "/produtor/dados" },
    { label: "Minha página", icon: Globe, href: "/produtor/pagina" },
    { label: "Lista de interessados", icon: Users, href: "/produtor/interessados" },
    { label: "Gestão financeira", icon: BarChart3, href: "/produtor/financeiro" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-line py-8 font-sans">
      <div className="px-6 mb-12">
        <Link to="/" className="text-2xl font-heading font-extrabold text-gold tracking-tighter">
          ZEVVA <span className="text-navy">TICKETS</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-muted hover:bg-surface hover:text-navy transition-all duration-200"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Título do evento *</label>
                <Input placeholder="Ex: Festival de Música Zevva" className="h-14 rounded-xl border-line focus-visible:ring-gold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Descrição do evento *</label>
                <Textarea placeholder="Descreva todos os detalhes do seu evento..." className="min-h-[200px] rounded-xl border-line focus-visible:ring-gold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Categoria</label>
                <Select>
                  <SelectTrigger className="h-14 rounded-xl border-line">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="festa">Festa</SelectItem>
                    <SelectItem value="show">Show</SelectItem>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="viagem">Viagem</SelectItem>
                    <SelectItem value="experiencia">Experiência</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Imagem principal</label>
                <div className="border-2 border-dashed border-line rounded-[24px] p-12 text-center group hover:border-gold/50 transition-colors cursor-pointer bg-surface/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-line flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-navy">Arraste uma imagem ou clique para enviar</p>
                      <p className="text-xs text-muted font-medium mt-1">PNG, JPG ou WEBP (Recomendado: 1600x838 pixels)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Tipo de evento</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="h-14 rounded-xl border-2 border-gold bg-gold/5 text-navy font-bold flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" /> Presencial
                  </button>
                  <button className="h-14 rounded-xl border border-line text-muted font-bold flex items-center justify-center gap-2 hover:bg-surface">
                    <Globe className="w-5 h-5" /> Online
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">País</label><Input className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Estado</label><Input className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Cidade</label><Input className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">CEP</label><Input className="h-14 rounded-xl" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Endereço completo</label>
                <Input className="h-14 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Data Inicial</label><Input type="date" className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Hora Inicial</label><Input type="time" className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Data Final</label><Input type="date" className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Hora Final</label><Input type="time" className="h-14 rounded-xl" /></div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-10">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto text-gold mb-6">
              <Ticket className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy">Gerenciamento de Ingressos</h3>
            <p className="text-muted font-medium mb-8">Crie lotes e defina preços para seu evento.</p>
            <Button className="h-14 px-10 rounded-xl bg-navy text-white font-bold">
              <Plus className="w-5 h-5 mr-2" /> Adicionar ingresso
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">URL do Vídeo (YouTube / Vimeo)</label>
                <Input placeholder="https://youtube.com/watch?v=..." className="h-14 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Instagram</label><Input placeholder="@seuusuario" className="h-14 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-bold text-navy uppercase tracking-wider">Facebook</label><Input placeholder="fb.com/suapagina" className="h-14 rounded-xl" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Tags (separadas por vírgula)</label>
                <Input placeholder="Viagem, Conferência, Terra Santa" className="h-14 rounded-xl" />
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-line space-y-4">
                <h4 className="font-bold text-navy">Configurações de SEO</h4>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Título da página</label>
                  <Input className="bg-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Descrição para buscadores</label>
                  <Textarea className="bg-white" />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="p-8 rounded-[24px] bg-surface/50 border border-line space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-32 h-20 bg-line rounded-lg flex items-center justify-center text-muted">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-navy">Título do seu evento aparecerá aqui</h3>
                  <div className="flex items-center gap-4 text-sm text-muted font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 20 Dez, 2026</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Jerusalém, Israel</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="outline" className="text-gold border-gold/30 bg-gold/5">Rascunho</Badge>
                </div>
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Visibilidade</p>
                  <p className="font-bold text-navy">Público</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Taxas</p>
                  <p className="font-bold text-navy">Por conta do comprador</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-navy border-b border-line pb-2">Ingressos configurados</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-line">
                    <span className="font-medium text-navy text-sm">Pacote Premium Individual</span>
                    <span className="font-bold text-gold">US$ 4.500,00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800 font-medium">
                Ao publicar, seu evento ficará disponível imediatamente para venda em nosso marketplace.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-line sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between font-sans">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-navy">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold bg-gold/5 px-3 py-1 rounded-full border border-gold/10">
              Área do Produtor
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted hover:text-navy transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-white"></span>
            </button>
            <Avatar className="w-10 h-10 border-2 border-surface shadow-sm">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gold text-white font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-6 sm:p-10 max-w-5xl mx-auto w-full font-sans">
          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/produtor' })} className="rounded-full">
                <ArrowLeft className="w-6 h-6 text-navy" />
              </Button>
              <h1 className="text-4xl font-heading font-extrabold text-navy">Criar evento</h1>
            </div>
            <p className="text-muted font-medium text-lg ml-14">Adicione todas as informações necessárias para divulgar e vender seu evento.</p>

            {/* Stepper */}
            <div className="flex gap-3 pt-6 ml-14">
              {steps.map((s, i) => (
                <div key={s.id} className="flex-1 space-y-3">
                  <div className={cn("h-1.5 rounded-full transition-all duration-500", step >= s.id ? "bg-gold" : "bg-line")} />
                  <p className={cn("text-[10px] font-extrabold uppercase tracking-widest", step >= s.id ? "text-gold" : "text-muted")}>
                    {i + 1}. {s.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-line p-8 sm:p-12 shadow-sm min-h-[500px] flex flex-col ml-14">
            <div className="flex-1">
              {renderStep()}
            </div>

            <div className="mt-12 flex justify-between items-center border-t border-line pt-8">
              <Button 
                variant="ghost" 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="h-14 px-8 rounded-xl font-bold text-muted hover:text-navy"
              >
                Anterior
              </Button>
              
              <div className="flex gap-4">
                <Button variant="outline" className="h-14 px-8 rounded-xl font-bold border-line text-navy hover:bg-surface">
                  Salvar rascunho
                </Button>
                <Button 
                  onClick={() => step < 5 ? setStep(s => s + 1) : navigate({ to: '/produtor' })}
                  className="h-14 px-10 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold shadow-lg shadow-navy/20"
                >
                  {step === 5 ? "Publicar Evento" : "Próximo"} 
                  {step < 5 && <ChevronRight className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}