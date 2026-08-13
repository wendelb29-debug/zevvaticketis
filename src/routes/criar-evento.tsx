import { createFileRoute, redirect, useNavigate, Link, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect } from "react";
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
      .from("tenant_members")
      .select("tenant_id")
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
    <div className="flex flex-col h-full bg-card border-r border-line py-8 font-inter">
      <div className="px-6 mb-12">
        <Link to="/" className="text-2xl font-manrope font-extrabold text-coral tracking-tighter">
          ZEVVA <span className="text-foreground">TICKETS</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200"
            activeProps={{ className: "bg-primary text-primary-foreground shadow-lg shadow-coral/30" }}
            inactiveProps={{ className: "text-foreground hover:bg-surface-2 hover:text-foreground" }}
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
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Título do evento *</label>
                <Input 
                  placeholder="Ex: Festival de Música Zevva" 
                  className="h-14 rounded-xl border-2 border-input focus-visible:ring-coral"
                  value={formData.title}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Descrição do evento *</label>
                <Textarea 
                  placeholder="Descreva todos os detalhes do seu evento..." 
                  className="min-h-[200px] rounded-xl border-2 border-input focus-visible:ring-coral"
                  value={formData.description}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  Categoria & Tema Visual <Sparkles className="w-4 h-4 text-coral" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select 
                    value={formData.category}
                    onValueChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger className="h-14 rounded-xl border-2 border-input font-bold text-foreground">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORY_THEMES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.category && (
                    <div 
                      className={cn(
                        "p-4 rounded-xl border-2 flex items-center justify-between group cursor-pointer transition-all",
                        getThemeByCategory(formData.category).customClass?.includes('animate-pulse-subtle') && "animate-pulse-subtle"
                      )}
                      style={{ 
                        borderColor: getThemeByCategory(formData.category).accentColor + '40',
                        backgroundColor: getThemeByCategory(formData.category).accentColor + '05'
                      }}
                      onClick={() => navigate({ to: '/eventos', search: { categoria: formData.category } as any })}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: getThemeByCategory(formData.category).accentColor }}
                        >
                          {React.createElement(getThemeByCategory(formData.category).icon, { className: "w-5 h-5" })}
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-foreground">Tema aplicado</p>
                          <p className="font-bold text-foreground text-xs">{formData.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-coral font-extrabold text-[10px] uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> Ver prévia
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Imagem principal</label>
                <div className="border-2 border-dashed border-line rounded-[24px] p-12 text-center group hover:border-coral/50 transition-colors cursor-pointer bg-surface/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-card shadow-sm border border-line flex items-center justify-center text-coral group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Arraste uma imagem ou clique para enviar</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">PNG, JPG ou WEBP (Recomendado: 1600x838 pixels)</p>
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
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Tipo de evento</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData((prev: any) => ({ ...prev, event_type: "presencial" }))}
                    className={cn(
                      "h-14 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all",
                      formData.event_type === "presencial" ? "border-coral bg-coral/5 text-foreground" : "border-line text-muted-foreground hover:bg-surface"
                    )}
                  >
                    <MapPin className={cn("w-5 h-5", formData.event_type === "presencial" ? "text-coral" : "")} /> Presencial
                  </button>
                  <button 
                    onClick={() => setFormData((prev: any) => ({ ...prev, event_type: "online" }))}
                    className={cn(
                      "h-14 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all",
                      formData.event_type === "online" ? "border-coral bg-coral/5 text-foreground" : "border-line text-muted-foreground hover:bg-surface"
                    )}
                  >
                    <Globe className={cn("w-5 h-5", formData.event_type === "online" ? "text-coral" : "")} /> Online
                  </button>
                </div>
              </div>

              {formData.event_type === "presencial" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground uppercase tracking-wider">País</label>
                      <Input 
                        className="h-14 rounded-xl" 
                        value={formData.country_id}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, country_id: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground uppercase tracking-wider">Cidade</label>
                      <Input 
                        className="h-14 rounded-xl" 
                        value={formData.city}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-wider">Endereço completo</label>
                    <Input 
                      className="h-14 rounded-xl" 
                      value={formData.location}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Link de transmissão</label>
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
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Data Inicial</label>
                  <Input 
                    type="date" 
                    className="h-14 rounded-xl" 
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Hora Inicial</label>
                  <Input 
                    type="time" 
                    className="h-14 rounded-xl" 
                    value={formData.start_time}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Data Final</label>
                  <Input 
                    type="date" 
                    className="h-14 rounded-xl" 
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Hora Final</label>
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
              <h3 className="text-xl font-bold text-foreground">Gerenciamento de Ingressos</h3>
              <Button 
                onClick={() => setTickets([...tickets, { id: Date.now(), name: "Novo Lote", description: "", price: 0, quantity: 100, sale_start: "", sale_end: "", limit_per_buyer: 5 }])}
                className="bg-navy text-primary-foreground font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar ingresso
              </Button>
            </div>
            
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="p-6 rounded-2xl border border-line bg-surface/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-foreground">Ingresso #{index + 1}</h4>
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
                      <label className="text-xs font-bold text-muted-foreground uppercase">Nome do ingresso</label>
                      <Input 
                        value={ticket.name}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].name = e.target.value;
                          setTickets(newTickets);
                        }}
                        placeholder="Ex: VIP, Pista"
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Preço</label>
                      <Input 
                        type="number"
                        value={ticket.price}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].price = parseFloat(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Quantidade</label>
                      <Input 
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].quantity = parseInt(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-card"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Limite por comprador</label>
                      <Input 
                        type="number"
                        value={ticket.limit_per_buyer}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].limit_per_buyer = parseInt(e.target.value);
                          setTickets(newTickets);
                        }}
                        className="bg-card"
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
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">Instagram</label>
                  <Input 
                    placeholder="@seuusuario" 
                    className="h-14 rounded-xl" 
                    value={formData.instagram}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">WhatsApp</label>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    className="h-14 rounded-xl" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">Site / Link externo</label>
                <Input 
                  placeholder="https://seusite.com" 
                  className="h-14 rounded-xl" 
                  value={formData.site}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, site: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center gap-3 p-6 rounded-2xl bg-coral/5 border border-coral/10">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, featured: !!checked }))}
                />
                <label htmlFor="featured" className="text-sm font-bold text-foreground cursor-pointer">
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
                <div className="w-32 h-20 bg-line rounded-lg flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">{formData.title || "Título do seu evento aparecerá aqui"}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
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
                <div className="p-4 bg-card rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="outline" className="text-coral border-coral/30 bg-coral/5">{formData.status}</Badge>
                </div>
                <div className="p-4 bg-card rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Visibilidade</p>
                  <p className="font-bold text-foreground">Público</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-line text-center">
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Total de Lotes</p>
                  <p className="font-bold text-foreground">{tickets.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-foreground border-b border-line pb-2">Ingressos configurados</h4>
                <div className="space-y-2">
                  {tickets.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-card rounded-lg border border-line">
                      <span className="font-medium text-foreground text-sm">{t.name}</span>
                      <span className="font-bold text-coral">US$ {t.price.toFixed(2)}</span>
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
        <header className="h-20 bg-card/80 backdrop-blur-md border-b border-line sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between font-inter">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="text-xs font-extrabold uppercase tracking-widest text-coral bg-coral/5 px-3 py-1 rounded-full border border-coral/10">
              Área do Produtor
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>
            </button>
            <Avatar className="w-10 h-10 border-2 border-surface shadow-sm">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-6 sm:p-10 max-w-5xl mx-auto w-full font-inter">
          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-4">
              <Link to="/produtor" className="p-2 hover:bg-card rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-manrope font-extrabold text-foreground tracking-tight">Criar Novo Evento</h1>
                <p className="text-muted-foreground font-medium">Siga as etapas para publicar sua caravana ou evento.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-2 scrollbar-hide">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                    step === s.id ? "bg-navy border-navy text-white shadow-lg shadow-navy/20" : 
                    step > s.id ? "bg-coral/10 border-coral/20 text-coral" : "bg-card border-line text-muted-foreground"
                  )}>
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                      step === s.id ? "bg-card text-foreground border-white" : 
                      step > s.id ? "bg-primary text-primary-foreground border-coral" : "bg-surface text-muted-foreground border-line"
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

          <div className="bg-card rounded-[32px] border border-line p-6 sm:p-10 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex-1">
              {renderStep()}
            </div>

            <div className="mt-12 pt-8 border-t border-line flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="h-14 px-8 rounded-xl font-bold text-muted-foreground hover:text-foreground"
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
                    className="h-14 px-10 rounded-xl bg-navy text-primary-foreground font-bold shadow-lg shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={() => setStep(step + 1)}
                  >
                    Próxima etapa <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-coral/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { data: member } = await supabase
                          .from("tenant_members")
                          .select("tenant_id")
                          .eq("user_id", user.id)
                          .single();

                        if (!member) throw new Error("Apenas membros de organizações podem criar eventos.");

                        const { data: event, error: eventError } = await supabase
                          .from("events")
                          .insert({
                            producer_id: member.tenant_id,
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