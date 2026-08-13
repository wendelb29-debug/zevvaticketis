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
      try {
        console.log('Starting auth callback handling...');
        
        // Ensure the session is properly established
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error getting session:', error);
          toast.error('Erro ao estabelecer sessão: ' + error.message);
          navigate({ to: '/' });
          return;
        }

        if (!session) {
          console.log('No session found in callback, checking for error parameters...');
          const url = new URL(window.location.href);
          const errorDesc = url.searchParams.get('error_description');
          const errorCode = url.searchParams.get('error');
          
          if (errorDesc || errorCode) {
            console.error('Auth callback error from URL:', errorCode, errorDesc);
            toast.error(errorDesc || 'Erro na autenticação social');
            navigate({ to: '/' });
            return;
          }

          // If we reach here, maybe it's just slow or misconfigured
          console.warn('Stuck at callback without session or error. Falling back to home.');
          setTimeout(() => {
            navigate({ to: '/' });
          }, 3000);
          return;
        }

        console.log('Session established for user:', session.user.id);

        // Completes producer signup securely once authenticated
        const { ensureProducerOrganization } = await import('@/lib/tenants.functions');
        await ensureProducerOrganization().catch(err => {
          console.error('Error ensuring producer organization:', err);
        });

        // Get the correct redirect path based on user role
        const redirectPath = await getRedirectPath().catch(() => '/');
        console.log('Redirecting to:', redirectPath);
        navigate({ to: redirectPath as any });
      } catch (err: any) {
        console.error('Unexpected error in auth callback:', err);
        toast.error('Erro inesperado no processamento do login');
        navigate({ to: '/' });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-card font-manrope">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground font-extrabold animate-pulse">Autenticando...</p>
      </div>
    </div>
  );
}
