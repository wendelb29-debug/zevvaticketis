import { createFileRoute, Outlet, redirect, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Globe, 
  Users, 
  BarChart3, 
  LogOut, 
  Plus,
  Bell,
  Menu,
  X,
  ChevronRight,
  Settings as SettingsIcon,
  ShieldCheck,
  FileText,
  UserPlus,
  Ticket,
  Mail,
  Home
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTenants } from "@/hooks/use-tenants";



export const Route = createFileRoute("/produtor")({
  beforeLoad: async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw redirect({ to: "/login" });
    }

    const { data: isProdutor, error: roleError } = await supabase.rpc('has_role', {
      _user_id: authUser.id,
      _role: 'produtor'
    });

    if (roleError || !isProdutor) {
      // Fallback: check if they are in tenant_members
      const { data: member } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!member) {
        throw redirect({ to: "/unauthorized" });
      }
    }
  },
  component: ProdutorLayout,
});

function ProdutorLayout() {
  const { activeTenant, tenants, switchTenant, loading: tenantsLoading } = useTenants();
  const [status, setStatus] = useState<string | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tenantsLoading && !activeTenant) {
      navigate({ to: "/app" });
      return;
    }

    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !activeTenant) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data: memberData } = await supabase
        .from("tenant_members")
        .select("tenant_id, role, permissions")
        .eq("user_id", user.id)
        .eq("tenant_id", activeTenant.id)
        .single();

      if (memberData) {
        setMemberRole(memberData.role);
        setPermissions(memberData.permissions as string[] || []);
        
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("status")
          .eq("id", activeTenant.id)
          .single();
        
        setStatus(tenantData?.status || null);
      }
      setLoading(false);
    }
    
    if (!tenantsLoading && activeTenant) {
      getUserData();
    }
  }, [activeTenant, tenantsLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-inter">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
      <p className="text-navy font-bold">Carregando painel...</p>
    </div>
  </div>;

  if (status === "pendente") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center font-inter">
        <div className="max-w-md space-y-8 bg-white p-12 rounded-[24px] shadow-xl border border-line">
          <div className="text-6xl animate-bounce">⏳</div>
          <div className="space-y-4">
            <h1 className="text-3xl font-manrope font-extrabold text-navy">Cadastro em Análise</h1>
            <p className="text-muted font-medium leading-relaxed">
              Sua organização foi cadastrada com sucesso e está sendo revisada por nossa equipe. 
              Você receberá um e-mail assim que for aprovado para começar a vender.
            </p>
          </div>
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="text-coral font-bold hover:text-coral-dark"
          >
            Sair da conta
          </Button>
        </div>
      </div>
    );
  }

  if (status === "bloqueado") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center font-inter">
        <div className="max-w-md space-y-8 bg-white p-12 rounded-[24px] shadow-xl border border-destructive/20">
          <div className="text-6xl">🚫</div>
          <div className="space-y-4">
            <h1 className="text-3xl font-manrope font-extrabold text-destructive">Acesso Bloqueado</h1>
            <p className="text-muted font-medium leading-relaxed">
              Infelizmente sua conta de produtor foi bloqueada. <br />
              Por favor, entre em contato com nosso suporte para mais informações.
            </p>
          </div>
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="text-navy font-bold hover:text-coral"
          >
            Sair da conta
          </Button>
        </div>
      </div>
    );
  }

  const { hasPermission } = useTenants();

  const allMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/produtor", activeOptions: { exact: true }, permission: "DASHBOARD" },
    { label: "Eventos", icon: FileText, href: "/produtor/eventos", permission: "EVENTOS" },
    { label: "Marketing", icon: Globe, href: "/produtor/marketing", permission: "MARKETING" },
    { label: "Participantes", icon: Users, href: "/produtor/participantes", permission: "PARTICIPANTES" },
    { label: "Check-in", icon: ShieldCheck, href: "/checkin", permission: "CHECKIN" },
    { label: "Financeiro", icon: BarChart3, href: "/produtor/financeiro", permission: "FINANCEIRO" },
    { label: "Equipe", icon: UserPlus, href: "/produtor/equipe", permission: "EQUIPE" },
    { label: "Configurações", icon: SettingsIcon, href: "/produtor/configuracoes", permission: "CONFIGURACOES" },
  ];



  const filteredMenuItems = allMenuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-line py-8 font-inter">
      <div className="px-6 mb-12 flex items-center justify-between gap-3">
        <Link to="/app" className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-muted hover:text-coral outline-none border border-line bg-white shadow-sm flex-shrink-0" title="Ver todos os projetos">
          <Home className="w-5 h-5" />
        </Link>
        <Link to="/" className="text-2xl font-manrope font-extrabold text-coral tracking-tighter truncate">
          ZEVVA <span className="text-navy">TICKETS</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTenant && (
          <div className="mt-6 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-line">
            <Avatar className="w-10 h-10 rounded-xl border border-line">
              <AvatarImage src={activeTenant.logo || undefined} />
              <AvatarFallback className="bg-navy text-white text-xs font-black">
                {activeTenant.nome.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-navy truncate">{activeTenant.nome}</p>
              <p className="text-[10px] text-muted font-bold truncate capitalize">{memberRole?.toLowerCase()}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted hover:text-coral"
                  title="Trocar Ambiente"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-line shadow-xl font-inter bg-white">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted px-2 py-1.5">Meus Projetos</DropdownMenuLabel>
                {tenants.map(t => (
                  <DropdownMenuItem 
                    key={t.id} 
                    onClick={() => switchTenant(t.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold cursor-pointer",
                      activeTenant.id === t.id ? "bg-coral/10 text-coral" : "text-navy hover:bg-surface"
                    )}
                  >
                    <Avatar className="w-5 h-5 rounded-md border border-line">
                      <AvatarImage src={t.logo || undefined} />
                      <AvatarFallback className="text-[8px] bg-navy text-white">{t.nome.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    {t.nome}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-line" />
                <DropdownMenuItem 
                  onClick={() => navigate({ to: "/app" })}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-navy hover:bg-surface cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-coral" /> Gerenciar Projetos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <nav className="space-y-1 px-4 mt-6">
          {filteredMenuItems.map((item) => {
            const isExternal = (item as any).external;
            const LinkComponent = isExternal ? 'a' : Link;
            const linkProps = isExternal 
              ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
              : { to: item.href, ...(item.activeOptions ? { activeOptions: item.activeOptions } : {}) };

            return (
              <LinkComponent
                key={item.label}
                {...(linkProps as any)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200",
                  !isExternal && "" 
                )}
                {...(!isExternal ? {
                  activeProps: { className: "bg-coral text-white shadow-lg shadow-coral/30" },
                  inactiveProps: { className: "text-navy hover:bg-surface-2 hover:text-navy" }
                } : {
                  className: "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold text-navy hover:bg-surface-2 transition-all duration-200"
                })}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </LinkComponent>
            );
          })}
        </nav>
      </div>

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

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-line sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between font-inter">
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
            
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-coral bg-coral/5 px-3 py-1 rounded-full border border-coral/10">
                Área do Produtor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-muted hover:text-navy transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white"></span>
            </button>

            {user && (
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onNavigate={(path) => navigate({ to: path as any })}
              />
            )}
          </div>
        </header>

        <main className="p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
