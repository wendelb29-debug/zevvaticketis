import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, User, Clock, ArrowRight, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TenantActivityFeedProps {
  activities: any[];
}

export function TenantActivityFeed({ activities }: TenantActivityFeedProps) {
  return (
    <Card className="rounded-[28px] border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-navy" />
          Atividades Recentes
        </CardTitle>
        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-navy gap-2 hover:bg-navy/5">
          Ver Auditoria Completa <ArrowRight className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {!activities || activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-muted/5">
             <Activity className="w-12 h-12 text-muted-foreground/20 mb-4" />
             <p className="text-sm font-bold text-muted-foreground/60">Nenhuma atividade recente registrada.</p>
             <p className="text-xs text-muted-foreground/40 mt-1">Logs de auditoria aparecerão aqui assim que houver operações no projeto.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {activities.map((log) => (
              <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-muted/10 transition-colors group">
                <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/60 group-hover:bg-navy group-hover:text-white transition-all">
                  <User size={18} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black text-foreground">
                      {log.admin?.nome || 'Administrador do Sistema'}
                    </p>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {formatAction(log.acao)} em <span className="text-foreground font-bold">{log.alvo_tipo}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-[0.05em]",
                      log.categoria === 'seguranca' ? "bg-rose-500/5 text-rose-500 border-rose-500/20" : "bg-blue-500/5 text-blue-500 border-blue-500/20"
                    )}>
                      {log.categoria || 'Sistema'}
                    </span>
                    {log.payload?.motivo && (
                      <span className="text-[10px] text-muted-foreground/60 font-medium italic">
                        — "{log.payload.motivo}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    'suspend': 'Suspendeu o projeto',
    'activate': 'Ativou o projeto',
    'update': 'Atualizou as configurações',
    'invite': 'Convidou novo membro',
    'remove': 'Removeu um membro',
    'change_plan': 'Alterou o plano do projeto'
  };
  return map[action] || action;
}
