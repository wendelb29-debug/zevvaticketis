import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useTenants } from "@/hooks/use-tenants";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/admin/notifications/NotificationBell";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";
import { useUI } from "@/hooks/use-ui";
import { getTranslations } from "@/lib/i18n-utils";
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
  Building2,
  Home,
  Globe,
  Languages,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { type SupportedLocale } from "@/lib/i18n/types";

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
  const { theme, setTheme, language: rawLanguage, setLanguage, isSaving } = useUI();
  const language = rawLanguage;
  const t = getTranslations(language);
  const { logout } = useTenants();
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
    await logout();
    navigate({ to: "/" });
  };

  const nav = t.navigation;

  const menuItems = [
    { label: nav['chat'] || "Chat", icon: MessageSquare, href: "/admin/chat" },
    { label: nav['masterConsole'] || "Master Console", icon: Building2, href: "/admin/master" },
    { label: nav['dashboard'] || "Dashboard", icon: LayoutDashboard, href: "/admin", activeOptions: { exact: true } },
    { 
      label: nav['contacts'] || "Contatos", 
      icon: Users, 
      children: [
        { label: nav['allContacts'] || "Todos os Contatos", href: "/admin/contatos" },
        { label: nav['customerGroups'] || "Grupos de Clientes", href: "/admin/grupos" },
      ]
    },
    { 
      label: nav['checkin'] || "Check-in", 
      icon: CheckSquare, 
      children: [
        { label: nav['generalPanel'] || "Painel Geral", href: "/admin/checkin" },
        { label: nav['reports'] || "Relatórios", href: "/admin/checkin", query: { tab: "reports" } },
        { label: nav['globalMonitor'] || "Monitor Global", href: "/admin/checkin-monitor" },
      ]
    },

    { 
      label: nav['plans'] || "Planos", 
      icon: CreditCard, 
      children: [
        { label: nav['plans'] || "Planos", href: "/admin/planos" },
        { label: nav['countriesAndCurrencies'] || "Países e Moedas", href: "/admin/paises-moedas" },
      ]
    },
    { 
      label: nav['marketing'] || "Marketing", 
      icon: Megaphone, 
      children: [
        { label: nav['ads'] || "Anúncios", href: "/admin/marketing/anuncios" },
        { label: nav['advertising'] || "Publicidade", href: "/admin/marketing/publicidade" },
        { label: nav['pushNotifications'] || "Push Notifications", href: "/admin/marketing/push" },
      ]
    },
    { 
      label: nav['massOutreach'] || "Envios Massivos", 
      icon: Rocket, 
      children: [
        { label: nav['createNew'] || "Criar novo", href: "/admin/envios-massivos", query: { wizard: "true" } },
        { label: nav['outreach'] || "Envios", href: "/admin/envios-massivos" },
      ]
    },
    { 
      label: nav['emails'] || "E-mails", 
      icon: Mail, 
      children: [
        { label: nav['dashboard'] || "Dashboard", href: "/admin/email-management" },
        { label: nav['templates'] || "Templates", href: "/admin/email-templates" },
        { label: nav['gmailInbox'] || "Gmail Inbox", href: "/admin/emails" },
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
    return null;
  }

  const SidebarContent = () => (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-card border-r border-border py-8 font-inter transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
      <div className={cn("px-6 mb-12 flex items-center justify-between gap-2", isSidebarCollapsed && "px-4 justify-center flex-col gap-4")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/app" 
              className={cn(
                "p-2 hover:bg-accent rounded-lg transition-all text-muted-foreground hover:text-primary outline-none active:scale-95 border border-border bg-card",
                isSidebarCollapsed ? "w-10 h-10 flex items-center justify-center" : ""
              )}
            >
              <Home className="w-5 h-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-black uppercase tracking-widest text-[10px]">Meus Projetos (Workspace)</p>
          </TooltipContent>
        </Tooltip>

        {!isSidebarCollapsed && (
          <Link to="/" className="text-xl font-manrope font-extrabold text-primary tracking-tighter flex-1 truncate">
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
                        search={(child as any).query}
                        className="block py-2 rounded-lg text-xs font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-primary focus:text-primary active:scale-[0.98]"
                        activeProps={{ className: "text-primary ring-2 ring-primary/20" }}
                        inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/30" }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isChat = item.label === nav['chat'];

          return (
            <Link
              key={item.label}
              to={item.href as any}
              tabIndex={isSidebarCollapsed ? -1 : 0}
              {...(item.activeOptions ? { activeOptions: item.activeOptions } : {})}
              className={cn(
                "flex items-center gap-3 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-300 border-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-[0.98]",
                isSidebarCollapsed ? "px-0 justify-center" : (isChat ? "px-4 justify-center" : "px-4"),
                isChat && "bg-[#D94B52] text-white border-transparent shadow-lg shadow-[#D94B52]/30"
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

      <div className="px-4 mt-auto mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all duration-300 border-2 border-border bg-card text-foreground hover:bg-accent outline-none focus:ring-2 focus:ring-primary focus:border-primary active:scale-[0.98]",
                isSidebarCollapsed && "px-0 justify-center"
              )}
            >
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center w-full h-full">
                      <Globe className="w-5 h-5 shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-black uppercase tracking-widest text-[10px]">
                      {language === 'pt-BR' ? 'Português' : language === 'en-US' ? 'English' : 'Español'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Globe className="w-5 h-5 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{nav['language'] || "Idioma"}</span>
                  <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                    {language.split('-')[0]}
                  </span>
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isSidebarCollapsed ? "right" : "top"} align={isSidebarCollapsed ? "start" : "center"} className="w-48 p-1.5 rounded-xl border-border shadow-2xl font-inter bg-popover/95 backdrop-blur-md">
            <DropdownMenuItem 
              onClick={() => setLanguage('pt-BR')}
              className={cn("flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer", language === 'pt-BR' ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/5")}
            >
              Português (Brasil)
              {language === 'pt-BR' && <Check className="w-3.5 h-3.5" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('en-US')}
              className={cn("flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer", language === 'en-US' ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/5")}
            >
              English
              {language === 'en-US' && <Check className="w-3.5 h-3.5" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('es-ES')}
              className={cn("flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer", language === 'es-ES' ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-primary/5")}
            >
              Español
              {language === 'es-ES' && <Check className="w-3.5 h-3.5" />}
            </DropdownMenuItem>
            {isSaving && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 mb-6">
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
                  aria-label={nav['settings'] || "Configurações"}
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
              <span className="truncate">{nav['settings'] || "Configurações"}</span>
            </>
          )}
        </Link>
      </div>

      <div className="px-4 pb-4">
        <UserMenu 
          user={user} 
          isSidebarCollapsed={isSidebarCollapsed} 
          onLogout={handleLogout}
        />
      </div>
    </div>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarContent />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <GlobalBreadcrumb />
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-accent transition-all text-muted-foreground hover:text-primary"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className={cn(
          "flex-1 overflow-y-auto bg-[#F6F7F8] dark:bg-[#0A0A0B] transition-all duration-300",
          isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
