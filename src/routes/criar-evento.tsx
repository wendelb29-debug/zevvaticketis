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
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Eye
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CATEGORY_THEMES, getThemeByCategory } from "@/lib/categoryThemes";

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
        setFormData((prev: any) => ({ ...prev, ...parsed.formData }));
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
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200"
            activeProps={{ className: "bg-gold text-white shadow-lg shadow-gold/30" }}
            inactiveProps={{ className: "text-navy hover:bg-surface-2 hover:text-navy" }}
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
                <Input 
                  placeholder="Ex: Festival de Música Zevva" 
                  className="h-14 rounded-xl border-2 border-input focus-visible:ring-gold"
                  value={formData.title}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Descrição do evento *</label>
                <Textarea 
                  placeholder="Descreva todos os detalhes do seu evento..." 
                  className="min-h-[200px] rounded-xl border-2 border-input focus-visible:ring-gold"
                  value={formData.description}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Categoria</label>
                <Select 
                  value={formData.category}
                  onValueChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))}
                >
                  <SelectTrigger className="h-14 rounded-xl border-2 border-input font-bold text-navy">
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
                  <button 
                    onClick={() => setFormData((prev: any) => ({ ...prev, event_type: "presencial" }))}
                    className={cn(
                      "h-14 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all",
                      formData.event_type === "presencial" ? "border-gold bg-gold/5 text-navy" : "border-line text-muted hover:bg-surface"
                    )}
                  >
                    <MapPin className={cn("w-5 h-5", formData.event_type === "presencial" ? "text-gold" : "")} /> Presencial
                  </button>
                  <button 
                    onClick={() => setFormData((prev: any) => ({ ...prev, event_type: "online" }))}
                    className={cn(
                      "h-14 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all",
                      formData.event_type === "online" ? "border-gold bg-gold/5 text-navy" : "border-line text-muted hover:bg-surface"
                    )}
                  >
                    <Globe className={cn("w-5 h-5", formData.event_type === "online" ? "text-gold" : "")} /> Online
                  </button>
                </div>
              </div>

              {formData.event_type === "presencial" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy uppercase tracking-wider">País</label>
                      <Input 
                        className="h-14 rounded-xl" 
                        value={formData.country_id}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, country_id: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy uppercase tracking-wider">Cidade</label>
                      <Input 
                        className="h-14 rounded-xl" 
                        value={formData.city}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-wider">Endereço completo</label>
                    <Input 
                      className="h-14 rounded-xl" 
                      value={formData.location}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Link de transmissão</label>
                  <Input 
                    placeholder="Zoom, Google Meet, YouTube..." 
                    className="h-14 rounded-xl" 
                    value={formData.location}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Data Inicial</label>
                  <Input 
                    type="date" 
                    className="h-14 rounded-xl" 
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Hora Inicial</label>
                  <Input 
                    type="time" 
                    className="h-14 rounded-xl" 
                    value={formData.start_time}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Data Final</label>
                  <Input 
                    type="date" 
                    className="h-14 rounded-xl" 
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Hora Final</label>
                  <Input 
                    type="time" 
                    className="h-14 rounded-xl" 
                    value={formData.end_time}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">Gerenciamento de Ingressos</h3>
              <Button 
                onClick={() => setTickets([...tickets, { id: Date.now(), name: "Novo Lote", description: "", price: 0, quantity: 100, sale_start: "", sale_end: "", limit_per_buyer: 5 }])}
                className="bg-navy text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar ingresso
              </Button>
            </div>
            
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="p-6 rounded-2xl border border-line bg-surface/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-navy">Ingresso #{index + 1}</h4>
                    {tickets.length > 1 && (
                      <button 
                        onClick={() => setTickets(tickets.filter(t => t.id !== ticket.id))}
                        className="text-destructive font-bold text-xs hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase">Nome do ingresso</label>
                      <Input 
                        value={ticket.name}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].name = e.target.value;
                          setTickets(newTickets);
                        }}
                        placeholder="Ex: VIP, Pista"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase">Preço</label>
                      <Input 
                        type="number"
                        value={ticket.price}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].price = parseFloat(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase">Quantidade</label>
                      <Input 
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].quantity = parseInt(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase">Limite por comprador</label>
                      <Input 
                        type="number"
                        value={ticket.limit_per_buyer}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].limit_per_buyer = parseInt(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Instagram</label>
                  <Input 
                    placeholder="@seuusuario" 
                    className="h-14 rounded-xl" 
                    value={formData.instagram}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">WhatsApp</label>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    className="h-14 rounded-xl" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Site / Link externo</label>
                <Input 
                  placeholder="https://seusite.com" 
                  className="h-14 rounded-xl" 
                  value={formData.site}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, site: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center gap-3 p-6 rounded-2xl bg-gold/5 border border-gold/10">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, featured: !!checked }))}
                />
                <label htmlFor="featured" className="text-sm font-bold text-navy cursor-pointer">
                  Destacar este evento no marketplace (Exige aprovação)
                </label>
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
                  <h3 className="text-xl font-bold text-navy">{formData.title || "Título do seu evento aparecerá aqui"}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 
                      {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Data não definida"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> 
                      {formData.city || "Localização não definida"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="outline" className="text-gold border-gold/30 bg-gold/5">{formData.status}</Badge>
                </div>
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Visibilidade</p>
                  <p className="font-bold text-navy">Público</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1">Total de Lotes</p>
                  <p className="font-bold text-navy">{tickets.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-navy border-b border-line pb-2">Ingressos configurados</h4>
                <div className="space-y-2">
                  {tickets.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-line">
                      <span className="font-medium text-navy text-sm">{t.name}</span>
                      <span className="font-bold text-gold">US$ {t.price.toFixed(2)}</span>
                    </div>
                  ))}
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
              <Link to="/produtor" className="p-2 hover:bg-white rounded-full transition-colors text-muted hover:text-navy">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-extrabold text-navy tracking-tight">Criar Novo Evento</h1>
                <p className="text-muted font-medium">Siga as etapas para publicar sua caravana ou evento.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-2 scrollbar-hide">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                    step === s.id ? "bg-navy border-navy text-white shadow-lg shadow-navy/20" : 
                    step > s.id ? "bg-gold/10 border-gold/20 text-gold" : "bg-white border-line text-muted"
                  )}>
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                      step === s.id ? "bg-white text-navy border-white" : 
                      step > s.id ? "bg-gold text-white border-gold" : "bg-surface text-muted border-line"
                    )}>
                      {step > s.id ? "✓" : s.id}
                    </span>
                    <span className="text-xs font-bold whitespace-nowrap">{s.title}</span>
                  </div>
                  {s.id < steps.length && <div className="w-4 h-[1px] bg-line" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-line p-6 sm:p-10 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex-1">
              {renderStep()}
            </div>

            <div className="mt-12 pt-8 border-t border-line flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="h-14 px-8 rounded-xl font-bold text-muted hover:text-navy"
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Voltar
              </Button>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 rounded-xl font-bold border-line hover:bg-surface"
                  onClick={() => {
                    localStorage.setItem("zevva_event_draft", JSON.stringify({ formData, tickets }));
                    alert("Rascunho salvo com sucesso!");
                  }}
                >
                  Salvar rascunho
                </Button>
                
                {step < 5 ? (
                  <Button 
                    className="h-14 px-10 rounded-xl bg-navy text-white font-bold shadow-lg shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={() => setStep(step + 1)}
                  >
                    Próxima etapa <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    className="h-14 px-10 rounded-xl bg-gold text-white font-bold shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { data: member } = await supabase
                          .from("organization_members")
                          .select("organization_id")
                          .eq("user_id", user.id)
                          .single();

                        if (!member) throw new Error("Apenas membros de organizações podem criar eventos.");

                        const { data: event, error: eventError } = await supabase
                          .from("events")
                          .insert({
                            producer_id: member.organization_id,
                            title: formData.title,
                            description: formData.description,
                            category: formData.category,
                            event_type: formData.event_type,
                            country_id: formData.country_id,
                            city: formData.city,
                            location: formData.location,
                            start_date: `${formData.start_date}T${formData.start_time || '00:00'}:00`,
                            end_date: `${formData.end_date}T${formData.end_time || '00:00'}:00`,
                            min_price: tickets.length > 0 ? tickets[0].price : 0,
                            status: 'publicado'
                          })
                          .select()
                          .single();

                        if (eventError) throw eventError;

                        const ticketsToInsert = tickets.map(t => ({
                          event_id: event.id,
                          name: t.name,
                          description: t.description,
                          price: t.price,
                          quantity: t.quantity
                        }));

                        const { error: ticketsError } = await supabase
                          .from("tickets")
                          .insert(ticketsToInsert);

                        if (ticketsError) throw ticketsError;

                        localStorage.removeItem("zevva_event_draft");
                        alert("Evento publicado com sucesso!");
                        navigate({ to: "/produtor" });
                      } catch (error: any) {
                        alert(error.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? "Publicando..." : "Publicar evento"} <CheckCircle2 className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}