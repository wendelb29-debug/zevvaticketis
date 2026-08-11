import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-xl border border-line text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-manrope font-extrabold text-navy">Acesso Negado</h1>
          <p className="text-muted font-medium">
            Você não possui permissão para acessar este painel. Caso acredite que isso seja um erro, entre em contato com o suporte.
          </p>
        </div>

        <div className="pt-6">
          <Link to="/">
            <Button className="w-full h-14 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-lg shadow-lg shadow-navy/20 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Voltar para a Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
