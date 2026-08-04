import { createFileRoute, Outlet, redirect, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User as UserIcon, Ticket, User, History } from "lucide-react";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/UserMenu";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }

    // Participants should be able to access /app even if they are also producers/admins
    // But we might want to check if they should be redirected to their main dashboard if they only have one role
  },
  component: AppLayout,
});

function AppLayout() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-bg text-navy font-sans">
      <header className="bg-white border-b border-line h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-navy lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link to="/" className="text-xl font-heading font-extrabold text-gold tracking-tighter">
                ZEVVA <span className="text-navy">APP</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/app" 
                activeOptions={{ exact: true }}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                activeProps={{ className: "bg-gold/10 text-gold" }}
                inactiveProps={{ className: "text-muted hover:text-navy" }}
              >
                Meus Ingressos
              </Link>
              <Link 
                to="/app/perfil" 
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                activeProps={{ className: "bg-gold/10 text-gold" }}
                inactiveProps={{ className: "text-muted hover:text-navy" }}
              >
                Meu Perfil
              </Link>
              <Link 
                to="/app/historico" 
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                activeProps={{ className: "bg-gold/10 text-gold" }}
                inactiveProps={{ className: "text-muted hover:text-navy" }}
              >
                Histórico
              </Link>
            </nav>
          </div>
          <nav className="flex items-center gap-6">
            {user && (
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onNavigate={(path) => navigate({ to: path as any })}
              />
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}