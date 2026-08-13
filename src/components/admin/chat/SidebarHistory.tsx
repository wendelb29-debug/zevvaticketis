import { useQuery } from "@tanstack/react-query";
import { getAttendanceHistory } from "@/lib/whatsapp/sidebar.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "luxon";
import { Clock, User, CheckCircle2, Loader2, MessageSquare, History } from "lucide-react";

interface SidebarHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
}

export function SidebarHistory({ isOpen, onClose, contactId }: SidebarHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['attendance-history', contactId],
    queryFn: () => getAttendanceHistory({ data: { contactId } }),
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground p-0 overflow-hidden flex flex-col h-[80vh]">
        <div className="p-6 border-b border-border bg-accent/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">Histórico de Atendimentos</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Resumo das interações passadas com este cliente
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-full p-6">
              {history?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center text-muted-foreground/30">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nenhum atendimento finalizado ainda</p>
                </div>
              ) : (
                <div className="space-y-6 relative">
                  {/* Vertical line for the timeline */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border hidden sm:block" />

                  {history?.map((attendance) => (
                    <div key={attendance.id} className="relative pl-0 sm:pl-12 group">
                      {/* Timeline dot */}
                      <div className="absolute left-[13px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-card z-10 hidden sm:block group-hover:scale-125 transition-transform" />
                      
                      <div className="bg-accent/30 rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors shadow-sm">
                        <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-4 bg-accent/10">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-card border-border text-muted-foreground">
                              #{attendance.id.slice(0, 8)}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {DateTime.fromISO(attendance.created_at).toFormat('dd/MM/yyyy')}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Finalizado em</span>
                              <span className="text-[11px] font-bold text-foreground">
                                {DateTime.fromISO(attendance.closed_at).toFormat('dd/MM/yy HH:mm')}
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Atendente</p>
                              <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border w-fit min-w-[160px]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                  {attendance.profiles?.full_name?.substring(0, 2) || "U"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-foreground truncate">{attendance.profiles?.full_name || 'Desconhecido'}</p>
                                  <p className="text-[10px] text-muted-foreground">Agente Zevva</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Motivo / Resumo</p>
                            <div className="bg-card p-3 rounded-xl border border-border h-full min-h-[60px]">
                              <p className="text-xs text-foreground/80 leading-relaxed italic">
                                {attendance.summary || "Sem observações registradas."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {attendance.satisfaction_rating && (
                          <div className="px-4 py-2 bg-primary/5 border-t border-border/50 flex items-center justify-between">
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Avaliação do Cliente</span>
                             <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <div key={star} className={cn("w-2 h-2 rounded-full", star <= attendance.satisfaction_rating ? "bg-primary" : "bg-muted-foreground/20")} />
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { cn } from "@/lib/utils";
