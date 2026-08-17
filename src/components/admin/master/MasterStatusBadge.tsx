import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 'aprovado' | 'ativo' | 'pendente' | 'suspenso' | 'bloqueado' | 'arquivado' | string;

export function MasterStatusBadge({ status }: { status: StatusType }) {
  const config: Record<string, { label: string, color: string }> = {
    aprovado: { label: 'Ativo', color: 'bg-emerald-500' },
    ativo: { label: 'Ativo', color: 'bg-emerald-500' },
    pendente: { label: 'Pendente', color: 'bg-amber-500' },
    suspenso: { label: 'Suspenso', color: 'bg-rose-500' },
    bloqueado: { label: 'Bloqueado', color: 'bg-rose-600' },
    arquivado: { label: 'Arquivado', color: 'bg-slate-400' },
  };

  const current = config[status.toLowerCase()] || { label: status, color: 'bg-slate-400' };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50">
      <div className={cn("w-1.5 h-1.5 rounded-full", current.color)} />
      <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/80">
        {current.label}
      </span>
    </div>
  );
}
