import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/admin/notifications/NotificationBell";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { useUI } from "@/hooks/use-ui";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  History,
  UserCog,
  MessageSquare,
  Megaphone,
  Sun,
  Moon,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw redirect({ 
        to: "/unauthorized", 
        search: { code: 'auth_missing', reason: 'Sessão expirada ou usuário não autenticado.' } 
      });
    }

    const { data: isAdminRole, error: roleError } = await supabase.rpc('check_is_platform_admin', { _user_id: authUser.id });
    
    if (roleError || !isAdminRole) {
      console.error("Access denied: Not an admin", roleError);
      
      const errorCode = roleError ? 'db_error' : 'invalid_role';
      const reason = roleError 
        ? 'Erro ao validar permissões no banco de dados.' 
        : 'Seu usuário não possui o nível de acesso necessário (Platform Admin).';

      // Log attempt
      await supabase
        .from('access_logs' as any)
        .insert({
          admin_id: authUser.id,
          resource_type: 'access_denied',
          resource_id: '/admin',
          action: '403_forbidden'
        });

      throw redirect({ 
        to: "/unauthorized", 
        search: { 
          code: errorCode, 
          reason: reason 
        } 
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useUI();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
    if (newState) setOpenGroup(null);
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setIsAdmin(true); // Already verified by beforeLoad
    }
    loadUser();
  }, []);

  // Handle route transition loading state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const menuItems = [
    { label: "Chat", icon: MessageSquare, href: "/admin/chat" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin", activeOptions: { exact: true } },
    { 
      label: "Check-in", 
      icon: CheckSquare, 
      children: [
        { label: "Gestão / BI", href: "/admin/checkin" },
        { label: "Scanner QR", href: "/admin/checkin/scanner" },
        { label: "Monitor Global", href: "/admin/checkin-monitor" },
      ]
    },

    { 
      label: "Planos", 
      icon: CreditCard, 
      children: [
        { label: "Planos", href: "/admin/planos" },
        { label: "Países e Moedas", href: "/admin/paises-moedas" },
      ]
    },
    { 
      label: "Marketing", 
      icon: Megaphone, 
      children: [
        { label: "Anúncios", href: "/admin/marketing/anuncios" },
        { label: "Publicidade", href: "/admin/marketing/publicidade" },
        { label: "Push Notifications", href: "/admin/marketing/push" },
      ]
    },
    { 
      label: "Envios Massivos", 
      icon: Rocket, 
      children: [
        { label: "Criar novo", href: "/admin/envios-massivos", query: { wizard: "true" } },
        { label: "Envios", href: "/admin/envios-massivos" },
      ]
    },
    { label: "E-mails", icon: Mail, href: "/admin/emails" },
    { 
      label: "Usuários", 
      icon: UserCog, 
      children: [
        { label: "Aprovações", href: "/admin/aprovacoes" },
        { label: "Todos os Usuários", href: "/admin/configuracoes", query: { tab: "team" } },
        { label: "Produtores", href: "/admin/produtores" },
        { label: "Eventos Pendentes", href: "/admin/aprovacoes", query: { tab: "events" } },
      ]
    },
    
  ];

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children?.some(child => location.pathname === child.href)) {
        setOpenGroup(item.label);
      }
    });
  }, [location.pathname]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isAdmin === false) {
    // This state shouldn't be reached due to beforeLoad, but kept as safety
    return null;
  }

  const SidebarContent = () => (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-card border-r border-border py-8 font-inter transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
      <div className={cn("px-6 mb-12 flex items-center justify-between", isSidebarCollapsed && "px-4 justify-center")}>
        {!isSidebarCollapsed && (
          <Link to="/" className="text-xl font-manrope font-extrabold text-primary tracking-tighter">
            ZEVVA <span className="text-foreground">ADMIN</span>
          </Link>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-primary rounded-lg transition-all text-foreground outline-none active:scale-95"
              aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-black uppercase tracking-widest text-[10px]">
              {isSidebarCollapsed ? "Expandir" : "Recolher"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          const isGroup = !!item.children;
          const isOpen = openGroup === item.label;
          const hasActiveChild = item.children?.some(child => location.pathname === child.href);

          if (isGroup && !isSidebarCollapsed) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenGroup(isOpen ? null : item.label);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all duration-300 border-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-[0.98]",
                    hasActiveChild ? "border-border bg-transparent text-foreground" : "border-transparent text-foreground hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
                
                {isOpen && (
                  <div className="pl-11 space-y-1">
                    {item.children?.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href as any}
                        search={child.query as any}
                        className="block py-2 rounded-lg text-xs font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-primary focus:text-primary active:scale-[0.98]"
                        activeProps={{ className: "text-primary ring-2 ring-primary/20" }}
                        inactiveProps={{ className: "text-muted-fg hover:text-foreground hover:bg-accent/30" }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isChat = item.label === "Chat";

          return (
            <Link
              key={item.label}
              to={item.href as any}
              tabIndex={isSidebarCollapsed ? -1 : 0}
              {...(item.activeOptions ? { activeOptions: item.activeOptions } : {})}
              className={cn(
                "flex items-center gap-3 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-300 border-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-[0.98]",
                isSidebarCollapsed ? "px-0 justify-center" : (isChat ? "px-4 justify-center" : "px-4"),
                isChat && "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/30"
              )}
              {...(!isChat ? {
                activeProps: { className: "border-border bg-transparent text-foreground shadow-none" },
                inactiveProps: { className: "border-transparent text-foreground hover:bg-accent/50" }
              } : {})}
            >
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="flex items-center justify-center w-full h-full outline-none focus:ring-2 focus:ring-primary rounded-lg transition-all"
                      aria-label={item.label}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate({ to: item.href as any });
                      }}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-black uppercase tracking-widest text-[10px]">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto mb-6">
        <Link
          to="/admin/configuracoes"
          className={cn(
            "flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all duration-300 border-2 border-border bg-card text-foreground hover:bg-accent outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-[0.98]",
            isSidebarCollapsed && "px-0 justify-center"
          )}
        >
          {isSidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="flex items-center justify-center w-full h-full outline-none focus:ring-2 focus:ring-primary rounded-lg transition-all"
                  aria-label="Configurações"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ to: "/admin/configuracoes" as any });
                  }}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-black uppercase tracking-widest text-[10px]">Configurações</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Settings className="w-5 h-5 shrink-0" />
              <span className="truncate">Configurações</span>
            </>
          )}
        </Link>
      </div>


      </div>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Desktop Sidebar */}
      {location.pathname !== "/admin/chat" && (
        <aside className={cn(
          "hidden lg:block h-screen sticky top-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-20" : "w-72"
        )}>
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen relative">
        {location.pathname !== "/admin/chat" && (
          <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between font-inter">
            <div className="flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-hide">
              <GlobalBreadcrumb />
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <NotificationBell />
              {user && (
                <UserMenu 
                  user={user}
                  onLogout={handleLogout}
                  onNavigate={(path) => navigate({ to: path as any })}
                />
              )}
            </div>
          </header>
        )}

        <main className={cn(
          "p-6 sm:p-10 transition-opacity duration-300",
          location.pathname === "/admin/chat" && "p-0 sm:p-0",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          {isTransitioning ? (
            <div className="w-full h-full flex items-center justify-center py-20">
               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}