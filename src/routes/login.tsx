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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        navigate({ to: '/' });
      } else {
        setIsAuthenticated(false);
        openOverlay('auth', 'login');
      }
    });
  }, [openOverlay, navigate]);

  if (isAuthenticated === null) return null;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-xl border border-line text-center">
        <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-coral" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Acesso Restrito</h1>
          <p className="text-muted font-medium">
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
            <Button variant="ghost" className="w-full h-12 text-muted font-bold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para a Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
