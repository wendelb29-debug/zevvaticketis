import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { suspendTenant } from "@/lib/master/tenants.functions";
import { useQueryClient } from "@tanstack/react-query";

interface SuspendTenantDialogProps {
  tenant: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendTenantDialog({ tenant, open, onOpenChange }: SuspendTenantDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [reason, setReason] = useState("");
  const [impact, setImpact] = useState("vendas_novas");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const runSuspend = useServerFn(suspendTenant);

  const handleSuspend = async () => {
    if (confirmName !== tenant.nome) {
      toast.error("O nome do projeto não confere.");
      return;
    }
    
    setIsLoading(true);
    try {
      await runSuspend({ 
        data: { 
          id: tenant.id, 
          motivo: reason, 
          impacto: impact 
        } 
      });
      toast.success("Projeto suspenso com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-tenant", tenant.id] });
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao suspender projeto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] max-w-lg border-border/50">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <ShieldAlert size={24} />
          </div>
          <DialogTitle className="text-2xl font-manrope font-black">Suspender Projeto</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Esta ação é crítica e afetará as operações do tenant <span className="text-foreground font-bold">/{tenant.slug}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest">Motivo da Suspensão</Label>
            <Input 
              placeholder="Ex: Falta de pagamento, Violação de termos..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest">Escopo do Impacto</Label>
            <select 
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            >
              <option value="vendas_novas">Bloquear apenas novas vendas</option>
              <option value="admin_readonly">Painel do Produtor (Somente Leitura)</option>
              <option value="full_block">Bloqueio Total de Segurança</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              <strong>Nota:</strong> Ingressos já adquiridos permanecerão acessíveis e o check-in continuará funcionando para eventos em andamento, exceto em caso de Bloqueio Total.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-rose-500">
              Confirmar nome do projeto: <span className="font-bold">{tenant.nome}</span>
            </Label>
            <Input 
              placeholder="Digite o nome exato do projeto" 
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="rounded-xl border-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" className="rounded-xl font-bold" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black px-6"
            onClick={handleSuspend}
            disabled={isLoading || confirmName !== tenant.nome}
          >
            Confirmar Suspensão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
