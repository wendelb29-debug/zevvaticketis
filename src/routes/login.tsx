import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useUI } from '@/hooks/use-ui';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { openOverlay } = useUI();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAuthenticated(true);
        
        // Redirection logic based on roles
        const userId = session.user.id;
        
        // 1. Check Admin
        const { data: isAdmin } = await supabase.rpc('check_is_platform_admin', { _user_id: userId });
        if (isAdmin) {
          navigate({ to: '/admin' });
          return;
        }

        // 2. Check Producer
        const { data: member } = await supabase
          .from('tenant_members')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (member) {
          navigate({ to: '/produtor' });
          return;
        }

        // 3. Check Staff
        const { data: staff } = await (supabase
          .from('event_staff' as any)
          .select('id')
          .eq('user_id', userId)
          .limit(1) as any);
        if (staff && staff.length > 0) {
          navigate({ to: '/checkin' });
          return;
        }

        // Default: Home
        navigate({ to: '/' });
      } else {
        setIsAuthenticated(false);
        openOverlay('auth', 'login');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsAuthenticated(false);
        openOverlay('auth', 'login');
      }
    });
  }, [openOverlay, navigate]);

  if (isAuthenticated === null) return null;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-inter text-foreground">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-[32px] shadow-xl border border-border text-center">
        <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-coral" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-manrope font-extrabold text-foreground">Acesso Restrito</h1>
          <p className="text-muted-foreground font-medium">
            Você precisa estar logado para acessar esta área.
          </p>
        </div>

        <div className="pt-6 space-y-4">
          <Button 
            className="w-full h-14 rounded-xl bg-coral hover:bg-coral-dark text-white font-bold text-lg shadow-lg shadow-coral/20"
            onClick={() => openOverlay('auth', 'login')}
          >
            Entrar agora
          </Button>
          
          <Link to="/">
            <Button variant="ghost" className="w-full h-12 text-muted-foreground font-bold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
