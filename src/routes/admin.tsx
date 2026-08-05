import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
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
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from("platform_admins")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      setIsAdmin(!!data);
    }
    checkAdmin();
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
    { label: "Aprovações", icon: CheckSquare, href: "/admin/aprovacoes" },
    { 
      label: "Usuários", 
      icon: UserCog, 
      children: [
        { label: "Todos os Usuários", href: "/admin/usuarios" },
        { label: "Produtores", href: "/admin/produtores" },
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
      ]
    },
    { label: "E-mails", icon: Mail, href: "/admin/emails" },
    { label: "Auditoria", icon: History, href: "/admin/auditoria" },
    { label: "Check-in", icon: CheckSquare, href: "/admin/checkin-monitor" },
    { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAdmin === false) {
    navigate({ to: "/" });
    return null;
  }

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border py-8 font-inter transition-all duration-200",
      isSidebarCollapsed ? "w-20" : "w-72"
    )}>
      <div className={cn("px-6 mb-12 flex items-center justify-between", isSidebarCollapsed && "px-4 justify-center")}>
        {!isSidebarCollapsed && (
          <Link to="/" className="text-xl font-manrope font-extrabold text-primary tracking-tighter">
            ZEVVA <span className="text-foreground">ADMIN</span>
          </Link>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isGroup = !!item.children;
          const isOpen = openGroup === item.label;
          const hasActiveChild = item.children?.some(child => location.pathname === child.href);

          if (isGroup && !isSidebarCollapsed) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  className={cn(
                    "w-full flex items-center justify-between py-3.5 px-4 rounded-xl text-sm font-extrabold transition-all duration-200",
                    hasActiveChild ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
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
                        className="block py-2 rounded-lg text-xs font-bold transition-all duration-200"
                        activeProps={{ className: "text-primary" }}
                        inactiveProps={{ className: "text-muted-fg hover:text-foreground" }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href as any}
              {...(item.activeOptions ? { activeOptions: item.activeOptions } : {})}
              className={cn(
                "flex items-center gap-3 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200",
                isSidebarCollapsed ? "px-0 justify-center" : "px-4"
              )}
              activeProps={{ className: "bg-primary text-primary-foreground shadow-lg shadow-primary/30" }}
              inactiveProps={{ className: "text-foreground hover:bg-accent" }}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Desktop Sidebar */}
      {location.pathname !== "/admin/chat" && (
        <aside className={cn(
          "hidden lg:block h-screen sticky top-0 transition-all duration-200",
          isSidebarCollapsed ? "w-20" : "w-72"
        )}>
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen relative">
        {location.pathname !== "/admin/chat" && (
          <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between font-inter">
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                Gestão Global
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
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