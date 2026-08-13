import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleWhatsAppMessage } from "@/lib/whatsapp/sidebar.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTime } from "luxon";

interface SidebarScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  tenantId: string;
}

export function SidebarSchedule({ isOpen, onClose, contactId, tenantId }: SidebarScheduleProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const scheduleMutation = useMutation({
    mutationFn: (data: { scheduledAt: string, message: string }) => 
      scheduleWhatsAppMessage({ data: { ...data, contactId, tenantId } }),
    onSuccess: () => {
      toast.success("Mensagem agendada com sucesso");
      onClose();
      setMessage("");
      setDate("");
      setTime("");
    },
    onError: (err: any) => {
      toast.error("Erro ao agendar mensagem: " + err.message);
    }
  });

  const handleSchedule = () => {
    if (!date || !time || !message.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const scheduledAt = DateTime.fromFormat(`${date} ${time}`, "yyyy-MM-dd HH:mm").toISO();
    if (!scheduledAt) {
      toast.error("Data ou hora inválida");
      return;
    }

    scheduleMutation.mutate({ scheduledAt, message });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Agendar Mensagem
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A mensagem será enviada automaticamente no horário selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</Label>
              <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-accent border-none h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hora</Label>
              <Input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-accent border-none h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mensagem</Label>
            <Textarea 
              placeholder="Digite o conteúdo da mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-accent border-none min-h-[120px] resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSchedule} 
            disabled={scheduleMutation.isPending}
            className="gap-2"
          >
            {scheduleMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Agendar Envio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
