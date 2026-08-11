import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { QrCode, LogOut, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleScan = async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Operador não autenticado");

      // 1. Check ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          *,
          events (title),
          profiles:owner_id (full_name)
        `)
        .eq("qr_code", code)
        .maybeSingle();

      if (ticketError) throw ticketError;

      if (!ticket) {
        setResult({ success: false, message: "INGRESSO INVÁLIDO ❌" });
      } else if (ticket.status === 'utilizado') {
        setResult({ success: false, message: "INGRESSO JÁ UTILIZADO ❌", ticket });
      } else {
        // 2. Perform check-in
        const { error: updateError } = await supabase
          .from("tickets" as any)
          .update({ status: 'utilizado' })
          .eq("id", ticket.id);

        if (updateError) throw updateError;

        await supabase
          .from("checkins_new" as any)
          .insert({
            ticket_id: ticket.id,
            operador_id: user.id,
            local_checkin: "Scanner Web"
          });

        setResult({ success: true, message: "VALIDADO ✅", ticket });
        setCheckinCount(prev => prev + 1);
      }
    } catch (err: any) {
      setResult({ success: false, message: "ERRO NA VALIDAÇÃO: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter flex flex-col">
      <header className="h-16 border-b border-border px-6 flex items-center justify-between sticky top-0 z-50 bg-background">
        <div className="text-xl font-manrope font-extrabold text-coral tracking-tighter">
          ZEVVA <span className="text-foreground">CHECK-IN</span>
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
        {result ? (
          <div className={cn(
            "w-full max-w-sm p-8 rounded-[32px] text-center space-y-6 animate-in zoom-in-95 duration-300",
            result.success ? "bg-green-50 border-2 border-green-500" : "bg-red-50 border-2 border-red-500"
          )}>
            <div className="text-6xl mb-4">{result.success ? "✅" : "❌"}</div>
            <h2 className={cn(
              "text-2xl font-black uppercase tracking-tighter",
              result.success ? "text-green-700" : "text-red-700"
            )}>
              {result.message}
            </h2>
            
            {result.ticket && (
              <div className="space-y-1 py-4 border-y border-black/5">
                <p className="font-bold text-navy">{result.ticket.events?.title}</p>
                <p className="text-sm font-medium text-muted-fg">{result.ticket.name}</p>
                <p className="text-xs font-black uppercase tracking-widest text-muted">{result.ticket.qr_code || result.ticket.id.slice(0, 8)}</p>
              </div>
            )}

            <Button 
              className="w-full h-14 bg-navy text-white hover:bg-navy/90 font-extrabold rounded-2xl"
              onClick={() => setResult(null)}
            >
              PRÓXIMA LEITURA
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full max-w-sm aspect-square bg-muted border-2 border-dashed border-border rounded-[32px] flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-coral/5 animate-pulse"></div>
              <QrCode className="w-20 h-20 text-coral relative z-10" />
              <p className="text-sm font-bold text-muted-foreground relative z-10">
                {loading ? "Validando..." : "Aponte a câmera para o QR Code"}
              </p>
              
              <div className="absolute top-0 left-0 w-full h-1 bg-coral shadow-[0_0_15px_rgba(232,96,74,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-5xl font-manrope font-extrabold text-coral">{checkinCount}</div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Check-ins Realizados</p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Button 
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-extrabold rounded-2xl"
                disabled={loading}
                onClick={() => handleScan("ZEVVA-TEST")}
              >
                {loading ? <Loader2 className="animate-spin" /> : "SIMULAR LEITURA"}
              </Button>
              <p className="text-[10px] text-center text-muted uppercase font-black tracking-widest">
                Modo manual: Digite o código
              </p>
            </div>
          </>
        )}
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

