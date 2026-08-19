import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, ShieldAlert, MoreHorizontal, Settings, Users, CreditCard, ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { SuspendTenantDialog } from "./SuspendTenantDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MasterStatusBadge } from "@/components/admin/master/MasterStatusBadge";

interface TenantHeaderProps {
  tenant: any;
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const navigate = useNavigate();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID copiado com sucesso!");
  };

  return (
    <div className="flex flex-col gap-6 mb-2">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-lg border border-border bg-card shadow-sm shrink-0"
            onClick={() => navigate({ to: "/admin/master" as any, search: { page: 1 } as any })}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg border border-white/10 shadow-md overflow-hidden shrink-0">
              {tenant.logo_url ? <img src={tenant.logo_url} className="w-full h-full object-cover" /> : tenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-manrope font-bold text-foreground tracking-tight leading-none">{tenant.name}</h1>
                <MasterStatusBadge status={tenant.status} />
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                  /{tenant.slug}
                </span>
                <span className="w-1 h-1 bg-border rounded-full" />
                <button 
                  onClick={() => copyToClipboard(tenant.id)}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                >
                  ID: {tenant.id.substring(0, 8)}...
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 rounded-lg font-bold text-rose-500 border-border hover:bg-rose-500/5 hover:border-rose-500/20 transition-all gap-2 px-3"
            onClick={() => setSuspendDialogOpen(true)}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {tenant.status === 'suspenso' ? 'Reativar' : 'Suspender'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 bg-navy hover:bg-navy/90 text-primary-foreground rounded-lg font-bold px-4 transition-all active:scale-95 gap-2">
                Ações
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-52 border-border/50 shadow-lg">
              <DropdownMenuItem className="font-bold text-xs uppercase tracking-wider py-2.5">
                <Settings className="w-3.5 h-3.5 mr-2" /> Editar Projeto
              </DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-xs uppercase tracking-wider py-2.5">
                <CreditCard className="w-3.5 h-3.5 mr-2" /> Alterar Plano
              </DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-xs uppercase tracking-wider py-2.5">
                <Users className="w-3.5 h-3.5 mr-2" /> Gerenciar Equipe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-bold text-xs uppercase tracking-wider py-2.5 text-rose-500 focus:text-rose-500">
                Arquivar Projeto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-2 border-y border-border/40 py-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-foreground/40">Plano:</span>
          <span className="text-foreground">{tenant.plan || 'Free'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-foreground/40">Proprietário:</span>
          <span className="text-foreground">{tenant.owner?.nome || tenant.owner?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-foreground/40">Criado em:</span>
          <span className="text-foreground">{new Date(tenant.created_at).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      <SuspendTenantDialog 
        tenant={tenant}
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
      />
    </div>
  );
}

