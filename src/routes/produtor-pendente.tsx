import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, Mail, ArrowLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/produtor-pendente')({
  component: ProducerPendingPage,
});

function ProducerPendingPage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-card font-inter p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="absolute top-16 right-[38%] bg-card rounded-full p-1 border border-line">
            <ShieldCheck className="w-6 h-6 text-foreground" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Cadastro em análise</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Olá, <span className="text-foreground font-bold">{user?.user_metadata?.nome || user?.email?.split('@')[0]}</span>!
            Sua organização está sendo avaliada por nossa equipe de curadoria.
          </p>
        </div>

        <div className="bg-surface/50 border border-line rounded-[20px] p-6 space-y-4 text-left">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-card rounded-xl border border-line flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">O que acontece agora?</p>
              <p className="text-xs text-muted-foreground font-medium">Você receberá um e-mail em até 24h úteis informando o status da sua aprovação.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline"
            className="w-full h-12 rounded-xl font-bold border-navy text-foreground hover:bg-navy hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
            onClick={() => window.location.reload()}
          >
            Verificar status novamente
          </Button>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-foreground transition-colors mx-auto"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-8">
          Equipe Zevva Tickets — Segurança e Qualidade
        </p>
      </div>
    </div>
  );
}
