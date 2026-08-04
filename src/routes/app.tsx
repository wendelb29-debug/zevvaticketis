import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-bg text-navy font-sans">
      <header className="bg-white border-b border-line h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-surface rounded-full transition-colors text-muted hover:text-navy lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-xl font-heading font-extrabold text-gold tracking-tighter">
              ZEVVA <span className="text-navy">APP</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-bold text-muted hover:text-navy transition-colors"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}