import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  QrCode, 
  History, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkin")({
  beforeLoad: async () => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw redirect({ to: "/login" });
    }

    // Check if user is staff for ANY event
    const { data: staffAssignments } = await supabase
      .from("event_staff")
      .select("id")
      .eq("user_id", authUser.id)
      .limit(1);

    const { data: isAdmin } = await supabase.rpc('check_is_platform_admin', { _user_id: authUser.id });
    
    // Check if user is owner/admin of an organization
    const { data: member } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!isAdmin && !member && (!staffAssignments || staffAssignments.length === 0)) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: CheckinLayout,
});

function CheckinLayout() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const menuItems = [
    { label: "Operação", icon: QrCode, href: "/checkin", activeOptions: { exact: true } },
    { label: "Scanner", icon: QrCode, href: "/checkin/scanner" },
    { label: "Presença", icon: Users, href: "/checkin/presenca" },
    { label: "Histórico", icon: History, href: "/checkin/historico" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy text-white py-8 font-inter">
      <div className="px-6 mb-12">
        <Link to="/" className="text-xl font-manrope font-black text-white tracking-tighter">
          ZEVVA <span className="text-coral">STAFF</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4">
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
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shadow-2xl">
        <SidebarContent />
      </aside>

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
