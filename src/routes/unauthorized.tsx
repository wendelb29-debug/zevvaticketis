import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldAlert, ArrowLeft, HelpCircle, Key, UserX, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const unauthorizedSearchSchema = z.object({
  code: z.string().optional(),
  reason: z.string().optional(),
});

export const Route = createFileRoute('/unauthorized')({
  validateSearch: unauthorizedSearchSchema,
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { code, reason } = Route.useSearch();

  const getErrorDetails = (code: string | undefined) => {
    switch (code) {
      case 'auth_missing':
        return {
          icon: Key,
          title: 'Sessão Inválida',
          instruction: 'Tente realizar o login novamente para renovar suas credenciais.',
          actionLabel: 'Ir para Login',
          actionHref: '/login'
        };
      case 'invalid_role':
        return {
          icon: UserX,
          title: 'Nível de Acesso Insuficiente',
          instruction: 'Solicite ao administrador master a inclusão do seu e-mail na lista de administradores.',
          actionLabel: 'Voltar para Home',
          actionHref: '/'
        };
      case 'db_error':
        return {
          icon: Database,
          title: 'Erro de Conexão',
          instruction: 'Houve uma falha na comunicação com o servidor de permissões. Tente novamente em alguns instantes.',
          actionLabel: 'Recarregar Página',
          actionHref: '/admin'
        };
      default:
        return {
          icon: ShieldAlert,
          title: 'Acesso Negado',
          instruction: 'Caso acredite que isso seja um erro, entre em contato com o suporte técnico.',
          actionLabel: 'Voltar para Home',
          actionHref: '/'
        };
    }
  };

  const details = getErrorDetails(code);
  const Icon = details.icon;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-[32px] shadow-xl border border-line text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-manrope font-extrabold text-foreground">{details.title}</h1>
            {code && (
              <span className="inline-block px-2 py-1 rounded bg-muted/50 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                ID do Erro: {code}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground font-medium leading-relaxed">
              {reason || 'Você não possui permissão para acessar este painel.'}
            </p>
            
            <div className="p-4 bg-navy/[0.03] rounded-2xl border border-navy/5 text-left">
              <div className="flex gap-2 text-foreground mb-1">
                <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-bold text-sm">Como resolver?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {details.instruction}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Link to={details.actionHref as any}>
            <Button className="w-full h-14 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold text-lg shadow-lg shadow-navy/20 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {details.actionLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
