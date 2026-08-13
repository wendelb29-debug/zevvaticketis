import { useState } from "react";
import { Send, Sparkles, Pencil, Wand2, ArrowUpCircle, AlignLeft, Smile, Volume2, ChevronRight, LayoutList, Globe, FileText, ImageIcon, ShoppingCart, Music, Plus, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ChatInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  onSend: () => void;
  isPending: boolean;
  aiAssistantEnabled: boolean;
  setAiAssistantEnabled: (enabled: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setFileType: (type: string) => void;
  setIsSalesPickerOpen: (open: boolean) => void;
}

export function ChatInput({
  messageText,
  setMessageText,
  onSend,
  isPending,
  aiAssistantEnabled,
  setAiAssistantEnabled,
  fileInputRef,
  setFileType,
  setIsSalesPickerOpen,
}: ChatInputProps) {
  return (
    <div className="flex flex-col gap-3">
      {aiAssistantEnabled && (
        <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
          {["Confirmar reserva?", "Enviar link de pagamento", "Dúvida sobre roteiro"].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => toast.info("IA Sugeriu: " + suggestion)}
              className="whitespace-nowrap px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/20 transition-all"
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3 items-end">
        <div className="flex gap-1.5 mb-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-primary/5 text-muted-foreground-foreground rounded-lg transition-all border border-transparent hover:border-border">
                <Plus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-[220px] bg-popover border border-border p-1 shadow-2xl">
              <DropdownMenuItem onClick={() => { setFileType('image/*'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-foreground">Fotos e Vídeos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSalesPickerOpen(true)} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Enviar Proposta</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFileType('audio/*'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                <Music className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-foreground">Áudio</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFileType('.pdf,.doc,.docx,.xls,.xlsx'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-foreground">Documento</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="p-2 hover:bg-primary/5 text-muted-foreground-foreground rounded-lg transition-all border border-transparent hover:border-border">
            <Smile className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-primary/5 text-muted-foreground-foreground rounded-lg transition-all border border-transparent hover:border-border">
                <Sparkles className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-[280px] bg-popover border border-border p-1 shadow-2xl overflow-y-auto max-h-[450px]">
              <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground-foreground uppercase tracking-widest px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Assistente de IA
              </DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                <Wand2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-foreground">Melhorar texto</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={aiAssistantEnabled} 
                    onCheckedChange={setAiAssistantEnabled}
                    className="scale-75 data-[state=checked]:bg-primary" 
                  />
                  <span className="text-[10px] font-bold text-muted-foreground-foreground">Assistente automático</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            className="w-full bg-card border border-border p-3.5 pr-14 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            placeholder="Digite uma mensagem — use ‘/’ para atalhos"
          />
          <button
            onClick={onSend}
            disabled={!messageText.trim() || isPending}
            className="absolute right-2 top-2 w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
