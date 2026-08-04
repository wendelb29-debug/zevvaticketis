import { createFileRoute, Outlet, redirect, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  CreditCard, 
  Globe, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }

    const { data: isAdmin } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!isAdmin) {
      throw redirect({ to: "/app" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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

  if (isAdmin === null) return null;
  if (isAdmin === false) throw redirect({ to: "/" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };


  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin", activeOptions: { exact: true } },
    { label: "Aprovações", icon: CheckSquare, href: "/admin/aprovacoes" },
    { label: "Produtores", icon: Users, href: "/admin/produtores" },
    { label: "Planos", icon: CreditCard, href: "/admin/planos" },
    { label: "Países e Moedas", icon: Globe, href: "/admin/paises-moedas" },
    { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-line py-8 font-inter">
      <div className="px-6 mb-12">
        <Link to="/" className="text-xl font-manrope font-extrabold text-gold tracking-tighter">
          ZEVVA <span className="text-navy">ADMIN</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            {...(item.activeOptions ? { activeOptions: item.activeOptions } : {})}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200"
            activeProps={{ className: "bg-coral text-white shadow-lg shadow-coral/30" }}
            inactiveProps={{ className: "text-navy hover:bg-surface-2 hover:text-navy" }}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-coral bg-coral/5 px-3 py-1 rounded-full border border-coral/10">
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

        <main className="p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}