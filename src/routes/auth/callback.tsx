import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectPath } from '@/lib/auth.functions';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        toast.error('Erro na autenticação social');
        navigate({ to: '/' });
        return;
      }

      // Completes producer signup securely once authenticated
      await supabase.rpc('ensure_producer_organization');

      // Get the correct redirect path based on user role
      try {
        const redirectPath = await getRedirectPath();
        navigate({ to: redirectPath as any });
      } catch (err) {
        navigate({ to: '/' });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-manrope">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
        <p className="text-navy font-extrabold animate-pulse">Autenticando...</p>
      </div>
    </div>
  );
}
