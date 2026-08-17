import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TenantHeaderProps {
  tenant: any;
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID copiado com sucesso!");
  };

  return (
    <div className="flex flex-col gap-6">
      <Button 
        variant="ghost" 
        className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => navigate({ to: "/admin/master" })}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Master Console
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-navy rounded-[24px] flex items-center justify-center text-primary-foreground font-black text-2xl border-4 border-white shadow-xl overflow-hidden shrink-0">
            {tenant.logo ? <img src={tenant.logo} className="w-full h-full object-cover" /> : tenant.nome.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-manrope font-black text-foreground tracking-tight leading-tight">{tenant.nome}</h1>
              <Badge className={cn(
                "rounded-lg font-black uppercase tracking-widest text-[10px] px-2 py-0.5 border shadow-sm",
                tenant.status === 'aprovado' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                tenant.status === 'suspenso' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                "bg-rose-500/10 text-rose-500 border-rose-500/20"
              )}>
                {tenant.status === 'aprovado' ? 'Ativo' : tenant.status === 'suspenso' ? 'Suspenso' : 'Arquivado'}
              </Badge>
              <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[10px] px-2 py-0.5 border-navy/20 text-navy">
                {tenant.plan || 'Free'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                /{tenant.slug}
              </span>
              <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <button 
                onClick={() => copyToClipboard(tenant.id)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
              >
                ID: {tenant.id.substring(0, 8)}...
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
              <span className="flex items-center gap-1.5">
                Owner: {tenant.owner?.nome || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-none rounded-xl font-bold text-rose-500 border-rose-500/20 hover:bg-rose-500/5 hover:border-rose-500/40 transition-all gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            {tenant.status === 'suspenso' ? 'Reativar Projeto' : 'Suspender Projeto'}
          </Button>
          <Button className="flex-1 md:flex-none bg-navy hover:bg-navy/90 text-primary-foreground rounded-xl font-black px-6 shadow-lg shadow-navy/20 uppercase tracking-widest text-xs h-10 transition-all active:scale-95">
            Ações do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
