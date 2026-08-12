import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  QrCode, 
  History, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  X,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTenants } from "@/hooks/use-tenants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/checkin")({
  beforeLoad: async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw redirect({ to: "/login" });
    }

    const { data: isAdmin } = await supabase.rpc('check_is_platform_admin', { _user_id: authUser.id });
    
    // Check if user is owner/admin of an organization
    const { data: member } = await supabase
      .from("tenant_members")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!isAdmin && !member) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: CheckinLayout,
});

function CheckinLayout() {
  const { projectId } = useParams({ from: "/checkin/$projectId/" });





  const { activeTenant, loading: tenantsLoading, userRole, logout } = useTenants();
  const [user, setUser] = useState<any>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // We only need to redirect if we are NOT at the selection screen (/checkin)
    // and we don't have an active tenant.
    if (!tenantsLoading && !activeTenant && location.pathname !== "/checkin" && location.pathname !== "/checkin/") {
      navigate({ to: "/checkin" });
    }
  }, [activeTenant, tenantsLoading, location.pathname]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data: isAdmin } = await supabase.rpc('check_is_platform_admin', { _user_id: authUser.id });
        setIsPlatformAdmin(!!isAdmin);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const menuItems = [
    { label: "Projetos", icon: Building2, href: `/checkin`, activeOptions: { exact: true } },
    { label: "Operação", icon: QrCode, href: `/checkin/${projectId}`, activeOptions: { exact: true } },
    { label: "Scanner", icon: QrCode, href: `/checkin/${projectId}/scanner` },
    { label: "Presença", icon: Users, href: `/checkin/${projectId}/presenca` },
    { label: "Histórico", icon: History, href: `/checkin/${projectId}/historico` },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy text-white py-8 font-inter">
      <div className={cn("px-6 mb-12 flex items-center gap-3", !isPlatformAdmin && "justify-center")}>
        {isPlatformAdmin && (
          <Link to="/app" className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white/60 hover:text-coral outline-none border border-white/10 bg-white/5 shadow-sm flex-shrink-0" title="Voltar para o Workspace">
            <Home className="w-5 h-5" />
          </Link>
        )}
        <Link to="/" className={cn("text-xl font-manrope font-black text-white tracking-tighter", !isPlatformAdmin && "text-center")}>
          ZEVVA <span className="text-coral">STAFF</span>
        </Link>
      </div>
      
      {activeTenant && (
        <div className="mt-6 mx-6 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
          <Avatar className="w-10 h-10 rounded-xl border border-white/10">
            <AvatarImage src={activeTenant.logo || undefined} />
            <AvatarFallback className="bg-white/10 text-white text-xs font-black">
              {activeTenant.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-black text-white truncate">{activeTenant.nome}</p>
            <p className="text-[10px] text-coral font-bold truncate capitalize">{userRole?.toLowerCase() || 'Operador'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate({ to: "/checkin" })} 
            className="h-8 w-8 text-white/40 hover:text-coral"
            title="Trocar Projeto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <nav className="flex-1 space-y-1 px-4 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href as any}
            {...(item.activeOptions ? { activeOptions: item.activeOptions } : {})}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
            activeProps={{ className: "bg-white/10 text-coral shadow-sm border border-white/5" }}
            inactiveProps={{ className: "text-white/60 hover:text-white hover:bg-white/5" }}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar - Only show if a project is selected */}
      {projectId && (
        <aside className="hidden lg:block w-64 h-screen sticky top-0 shadow-2xl">
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-coral" />
            <h1 className="text-sm font-black text-navy uppercase tracking-widest">Controle de Acesso</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onNavigate={(path) => navigate({ to: path as any })}
              />
            )}
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
