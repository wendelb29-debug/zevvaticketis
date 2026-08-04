import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { QrCode, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkin")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }

    const { data: member } = await supabase
      .from("organization_members")
      .select("permissions, role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    const permissions = member?.permissions as string[] || [];
    if (member?.role !== 'produtor_owner' && !permissions.includes('checkin')) {
      throw redirect({ to: "/app" });
    }
  },
  component: CheckinApp,
});

function CheckinApp() {
  const [user, setUser] = useState<any>(null);
  const [checkinCount, setCheckinCount] = useState(0);
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
    <div className="min-h-screen bg-navy text-white font-inter flex flex-col">
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-50 bg-navy">
        <div className="text-xl font-manrope font-extrabold text-coral tracking-tighter">
          ZEVVA <span className="text-white">CHECK-IN</span>
        </div>
        
        {user && (
          <UserMenu 
            user={user}
            onLogout={handleLogout}
            onNavigate={(path) => navigate({ to: path as any })}
          />
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="w-full max-w-sm aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-[32px] flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-coral/5 animate-pulse"></div>
          <QrCode className="w-20 h-20 text-coral relative z-10" />
          <p className="text-sm font-bold text-white/60 relative z-10">Aponte a câmera para o QR Code</p>
          
          {/* Scanner Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-coral shadow-[0_0_15px_rgba(201,154,62,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-5xl font-manrope font-extrabold text-coral">{checkinCount}</div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/40">Check-ins Realizados</p>
        </div>

        <Button 
          className="w-full max-w-sm h-14 bg-white text-navy hover:bg-white/90 font-extrabold rounded-2xl"
          onClick={() => setCheckinCount(prev => prev + 1)}
        >
          Simular Check-in
        </Button>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}} />
    </div>
  );
}

