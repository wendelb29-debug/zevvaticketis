import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAttendanceMessages } from "@/lib/whatsapp/attendance-history.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "luxon";
import { Loader2, MessageSquare, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceId: string | null;
  protocol?: string | null | undefined;
}

export function AttendanceDetailModal({ isOpen, onClose, attendanceId, protocol }: AttendanceDetailModalProps) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['attendance-messages', attendanceId],
    queryFn: () => getAttendanceMessages({ data: { attendanceId: attendanceId! } }),
    enabled: !!attendanceId && isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-card border-border text-foreground p-0 overflow-hidden flex flex-col h-[85vh]">
        <DialogHeader className="p-6 border-b border-border bg-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Detalhes do Atendimento
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                Protocolo: {protocol || attendanceId?.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-accent/5">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages?.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground italic">
                    Nenhuma mensagem registrada neste ciclo.
                  </div>
                ) : (
                  messages?.map((msg: any) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.direction === 'outbound' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {msg.direction === 'inbound' ? (
                          <>
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Cliente</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Atendente</span>
                            <Bot className="w-3 h-3 text-primary" />
                          </>
                        )}
                        <span className="text-[9px] text-muted-foreground opacity-60">
                          {DateTime.fromISO(msg.created_at).toFormat('HH:mm')}
                        </span>
                      </div>
                      <div 
                        className={cn(
                          "p-3 rounded-2xl text-sm shadow-sm border",
                          msg.direction === 'outbound' 
                            ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none" 
                            : "bg-card text-foreground border-border rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
