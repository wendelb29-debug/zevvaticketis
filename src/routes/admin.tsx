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


  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-white/5 p-4 bg-card">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-heading font-bold text-primary">ZEVVA ADMIN</div>
          {user && (
            <UserMenu 
              user={user}
              onLogout={handleLogout}
              onNavigate={(path) => navigate({ to: path as any })}
            />
          )}
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}