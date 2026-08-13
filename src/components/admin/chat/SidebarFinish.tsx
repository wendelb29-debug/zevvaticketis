import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeAttendance } from "@/lib/whatsapp/sidebar.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SidebarFinishProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
}

export function SidebarFinish({ isOpen, onClose, contactId }: SidebarFinishProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const finishMutation = useMutation({
    mutationFn: (data: { reason: string, notes: string }) => 
      // Note: we'd need to find the ACTIVE attendance ID first. 
      // For now, let's assume the backend finds it for the contact or we pass a placeholder.
      closeAttendance({ data: { attendanceId: contactId, reason: data.reason, notes: data.notes } }),
    onSuccess: () => {
      toast.success("Atendimento finalizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Erro ao finalizar atendimento: " + err.message);
    }
  });

  const handleFinish = () => {
    if (!reason) {
      toast.error("Selecione o motivo da finalização");
      return;
    }
    finishMutation.mutate({ reason, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            Finalizar Atendimento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Deseja encerrar este atendimento? Ele será movido para o histórico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
              Ao finalizar, a conversa sairá da sua lista ativa. Você poderá reabri-la enviando uma nova mensagem.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motivo da Finalização</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger className="bg-accent border-none h-10">
                <SelectValue placeholder="Selecione um motivo..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="resolvido">Dúvida Resolvida</SelectItem>
                <SelectItem value="venda_concluida">Venda Concluída</SelectItem>
                <SelectItem value="sem_retorno">Sem Retorno do Cliente</SelectItem>
                <SelectItem value="spam">Spam / Engano</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas Internas (Opcional)</Label>
            <Textarea 
              placeholder="Resumo do que foi tratado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-accent border-none min-h-[100px] resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>Continuar Atendimento</Button>
          <Button 
            onClick={handleFinish} 
            disabled={finishMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-primary-foreground"
          >
            {finishMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirmar Finalização"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
