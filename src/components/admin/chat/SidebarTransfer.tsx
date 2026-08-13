import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDepartments, getDepartmentAgents, transferAttendanceAction } from "@/lib/whatsapp/sidebar.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Users, Building2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface SidebarTransferProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  tenantId: string;
}

export function SidebarTransfer({ isOpen, onClose, contactId, tenantId }: SidebarTransferProps) {
  const queryClient = useQueryClient();
  const [transferType, setTransferType] = useState<"agent" | "dept">("dept");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [clientMessage, setClientMessage] = useState("");

  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['whatsapp-departments', tenantId],
    queryFn: () => getDepartments({ data: { tenantId } }),
    enabled: isOpen
  });

  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['whatsapp-department-agents', selectedDeptId],
    queryFn: () => getDepartmentAgents({ data: { departmentId: selectedDeptId } }),
    enabled: isOpen && !!selectedDeptId
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => transferAttendanceAction({ data }),
    onSuccess: () => {
      toast.success("Atendimento transferido com sucesso");
      queryClient.invalidateQueries({ queryKey: ['whatsapp-contacts'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Erro ao transferir: " + err.message);
    }
  });

  const handleTransfer = () => {
    if (!selectedDeptId) {
      toast.error("Selecione um departamento");
      return;
    }
    if (!reason) {
      toast.error("Informe o motivo da transferência");
      return;
    }

    transferMutation.mutate({
      attendanceId: contactId, // Using contactId as attendanceId placeholder if they are 1:1 or logic handles it
      newDepartmentId: selectedDeptId,
      newAgentId: transferType === 'agent' ? selectedAgentId : null,
      reason,
      clientMessage
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Transferir atendimento</DialogTitle>
              <DialogDescription className="text-muted-foreground">Escolha o destinatário para transferir este atendimento.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="w-3 h-3" />
                Tipo de transferência
              </Label>
              <Select 
                value={transferType} 
                onValueChange={(val: any) => setTransferType(val)}
              >
                <SelectTrigger className="bg-muted border-border text-xs h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="dept">Para Departamento</SelectItem>
                  <SelectItem value="agent">Para Agente Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                Departamento
              </Label>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="bg-muted border-border text-xs h-11">
                  <SelectValue placeholder={isLoadingDepts ? "Carregando..." : "Selecione..."} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {transferType === 'agent' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="w-3 h-3" />
                Agente Destinatário
              </Label>
              <Select 
                value={selectedAgentId} 
                onValueChange={setSelectedAgentId}
                disabled={!selectedDeptId}
              >
                <SelectTrigger className="bg-muted border-border text-xs h-11">
                  <SelectValue placeholder={isLoadingAgents ? "Carregando..." : "Selecione um agente"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  {agents?.map((agent: any) => (
                    <SelectItem key={agent.user_id} value={agent.user_id}>
                      {agent.profiles?.full_name || 'Agente sem nome'}
                    </SelectItem>
                  ))}
                  {agents?.length === 0 && <div className="p-2 text-xs text-muted-foreground">Nenhum agente disponível</div>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Motivo Interno
              </Label>
              <Textarea 
                className="w-full bg-muted border border-border p-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none min-h-[100px] resize-none"
                placeholder="Explique o motivo para seus colegas..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Share2 className="w-3 h-3" />
                Mensagem para o Cliente (Opcional)
              </Label>
              <Textarea 
                className="w-full bg-muted border border-border p-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none min-h-[100px] resize-none"
                placeholder="Esta mensagem será enviada ao cliente..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full bg-muted/30 p-4 -mx-6 -mb-6 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="font-bold">Cancelar</Button>
          <Button 
            onClick={handleTransfer} 
            disabled={transferMutation.isPending}
            className="flex-1 max-w-[300px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
          >
            {transferMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Transferir agora"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}