import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  Search, Send, User, Check, CheckCheck, Phone, Plus, Bell, ChevronDown, 
  MoreVertical, CheckCircle, Shuffle, Users as PeopleIcon, Folder, Clock, 
  History as HistoryIcon, Calendar, Zap, Copy, Printer, Eye, Tag, AlertCircle, 
  LayoutList, MessageSquare, Filter, SlidersHorizontal, ListFilter,
  Paperclip, Smile, ImageIcon, Play, Volume2, Pencil, X, Home, ChevronRight,
  ArrowUpDown, SortAsc, SortDesc, CalendarDays, Lock, Globe, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute('/admin/chat')({
  component: AdminChatPage,
});

function AdminChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>("1");
  const [agentStatus, setAgentStatus] = useState<'online' | 'busy' | 'offline'>('offline');
  const [user, setUser] = useState<any>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isActiveTicketDialogOpen, setIsActiveTicketDialogOpen] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent-top');
  const [sidebarWidth, setSidebarWidth] = useState(540);
  const [isResizing, setIsResizing] = useState(false);
  const [previewContactId, setPreviewContactId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(300, e.clientX), 800);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const handleTransfer = () => {
    toast.info("Transferindo atendimento...");
    setIsTransferDialogOpen(false);
  };

  const contacts = [
    { id: "1", name: "João Silva", lastMsg: "Olá, gostaria de saber mais...", time: "Há 10 horas", status: "unread", channel: "wa", direction: 'inbound' },
    { id: "2", name: "Maria Garcia", lastMsg: "Obrigada!", time: "03/08/26, 13:37", status: "read", channel: "wa", direction: 'outbound' },
    { id: "3", name: "Conferência Águas Vivas", lastMsg: "Inscrição confirmada", time: "Há 2 horas", status: "unread", channel: "wa", direction: 'inbound' },
  ];

  const messages = [
    { id: 1, text: "Olá! Como posso ajudar?", sender: "agent", time: "10:00" },
    { id: 2, text: "Olá, gostaria de saber mais sobre o evento no Terra Santa.", sender: "client", time: "10:05" },
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0F1117] text-[#171717] dark:text-white/90 overflow-hidden font-inter">
      {/* Header Fixo */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-line dark:border-white/5 bg-white dark:bg-[#161922] shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-navy group"
              title="Voltar para o Admin"
            >
              <Home className="w-5 h-5 group-hover:text-coral transition-colors" />
            </Link>
            <span className="font-black text-lg tracking-tighter text-coral italic">
              zevva.<span className="text-navy">chat</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-navy/40 hover:text-navy transition-colors">
              <HistoryIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 rounded-full text-[10px] font-black uppercase tracking-wider text-navy/60 border border-line">
              <PeopleIcon className="w-3 h-3 text-coral" /> Atendimentos
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-surface-2 rounded-full transition-colors text-navy/60">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-coral rounded-full text-[8px] flex items-center justify-center border-2 border-white text-white font-bold">3</span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-line">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-navy uppercase leading-tight">Admin Zevva</div>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest leading-tight",
                agentStatus === 'online' ? "text-green-500" : agentStatus === 'busy' ? "text-amber-500" : "text-navy/40"
              )}>{agentStatus}</div>
            </div>
            
            {user && (
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onNavigate={(path) => navigate({ to: path as any })}
                agentStatus={agentStatus}
                onStatusChange={setAgentStatus}
              />
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Coluna 1: Lista de Conversas (410px) */}
        <div 
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "border-r border-[#E5E7EB] dark:border-white/5 flex flex-col bg-white dark:bg-[#161922] shrink-0 relative",
            !isResizing && "transition-[width] duration-150 ease-in-out"
          )}
        >
          {/* Resize Handle */}
          <div 
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className={cn(
              "absolute top-0 right-[-4px] w-2 h-full z-50 cursor-col-resize group transition-colors",
              isResizing ? "bg-coral/40" : "hover:bg-coral/20"
            )}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 bg-line dark:bg-white/10 group-hover:bg-coral transition-colors rounded-full" />
          </div>

          <div className="p-4 space-y-4">
            <div className="flex p-1 bg-surface-2 dark:bg-[#0F1117] rounded-full border dark:border-white/5">
              <button className="flex-1 py-1.5 text-xs font-bold bg-coral text-white rounded-full">Em Atendimento</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-navy/40">Em Espera</button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
                <input 
                  className="w-full pl-9 pr-4 py-2 bg-surface-2 dark:bg-[#0F1117] rounded-lg text-xs border border-line dark:border-white/5 dark:text-white/90 focus:ring-1 focus:ring-coral/50 outline-none" 
                  placeholder="Buscar atendimentos..." 
                />
              </div>
              <div className="flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 bg-surface-2 dark:bg-[#0F1117] rounded-lg text-navy/40 dark:text-white/20 hover:text-navy dark:hover:text-white border border-line dark:border-white/5">
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[300px] bg-[#23262E] border-none text-white p-2">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-2">Tipos de Ordenação</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('recent-top')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'recent-top' ? "bg-coral/20 text-coral" : "hover:bg-white/5")}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Mensagem mais recente no topo (Padrão)</span>
                      </div>
                      <SortDesc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('oldest-top')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'oldest-top' ? "bg-coral/20 text-coral" : "hover:bg-white/5")}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Mensagem mais antiga no topo</span>
                      </div>
                      <SortAsc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('created-recent')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'created-recent' ? "bg-coral/20 text-coral" : "hover:bg-white/5")}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-xs">Data de criação mais recente no topo</span>
                      </div>
                      <SortDesc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('created-oldest')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'created-oldest' ? "bg-coral/20 text-coral" : "hover:bg-white/5")}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-xs">Data de criação mais antiga no topo</span>
                      </div>
                      <SortAsc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button 
                  onClick={() => setIsFilterDialogOpen(true)}
                  className="p-2 bg-surface-2 dark:bg-[#0F1117] rounded-lg text-navy/40 dark:text-white/20 hover:text-navy dark:hover:text-white border border-line dark:border-white/5"
                >
                  <Filter className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => setIsHistoryDialogOpen(true)}
                  className="p-2 bg-surface-2 dark:bg-[#0F1117] rounded-lg text-navy/40 dark:text-white/20 hover:text-navy dark:hover:text-white border border-line dark:border-white/5"
                >
                  <HistoryIcon className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setIsActiveTicketDialogOpen(true)}
                  className="p-2 bg-coral rounded-lg text-white"
                  title="Iniciar atendimento ativo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 font-bold uppercase px-1">Exibindo {contacts.length} atendimentos de {contacts.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto visible-scrollbar px-2">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={cn(
                  "p-3 rounded-2xl mb-1 cursor-pointer transition-all border border-transparent",
                  selectedContactId === contact.id ? "bg-coral/10 dark:bg-coral/20 border-coral/20" : "hover:bg-coral/5 dark:hover:bg-white/5"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center text-white font-black text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                      <MessageSquare className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm truncate dark:text-white/90">{contact.name}</span>
                      <span className="text-[9px] text-gray-500 whitespace-nowrap">{contact.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                      {contact.direction === 'inbound' ? (
                        <div className="w-3 h-3 rounded-full bg-green-500/10 flex items-center justify-center">
                          <ChevronDown className="w-2 h-2 text-green-500 rotate-45" />
                        </div>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <ChevronDown className="w-2 h-2 text-blue-500 -rotate-135" />
                        </div>
                      )}
                      <span className="truncate">{contact.lastMsg}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between py-0.5 shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewContactId(contact.id);
                      }}
                      className="p-1 hover:bg-coral/10 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-navy/20 hover:text-coral transition-colors" />
                    </button>
                    <button className="p-0.5 hover:bg-surface-2 rounded-md">
                      <MoreVertical className="w-3.5 h-3.5 text-navy/20" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Pré-visualização */}
        <Dialog open={!!previewContactId} onOpenChange={(open) => !open && setPreviewContactId(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-[#161922] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1C1F28]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold">
                  {contacts.find(c => c.id === previewContactId)?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{contacts.find(c => c.id === previewContactId)?.name}</h3>
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-white/50 px-1.5 py-0 uppercase">Pré-visualização</Badge>
                  </div>
                  <p className="text-[10px] text-white/40">Última atividade {contacts.find(c => c.id === previewContactId)?.time}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewContactId(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 h-[500px] overflow-y-auto visible-scrollbar bg-[url('https://w0.peakpx.com/wallpaper/580/678/wallpaper-whatsapp-dark-mode.jpg')] bg-repeat bg-center">
              <div className="flex flex-col gap-4">
                {/* Simulando mensagens na pré-visualização */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-[#1C1F28] text-white p-3 rounded-2xl rounded-tl-none shadow-md border border-white/5">
                    <p className="text-xs">{contacts.find(c => c.id === previewContactId)?.lastMsg}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-[9px] text-white/40">10:05</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-[80%] self-end">
                  <div className="bg-coral text-white p-3 rounded-2xl rounded-tr-none shadow-md">
                    <p className="text-xs">Olá! No que podemos ajudar hoje?</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[9px] text-white/70">10:07</span>
                      <CheckCheck className="w-3 h-3 text-white/70" />
                    </div>
                  </div>
                </div>

                {/* Mensagem de voz simulada se for o Paulo Vitor (referência da imagem) */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-[#1C1F28] text-white p-3 rounded-2xl rounded-tl-none shadow-md border border-white/5 w-[280px]">
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-coral">
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                        <div className="absolute inset-0 w-1/3 bg-coral rounded-full" />
                      </div>
                      <span className="text-[10px] text-white/40">0:44</span>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-[9px] text-white/40">10:21</span>
                    </div>
                  </div>
                </div>

                {/* Card de imagem simulado */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-[#1C1F28] text-white p-2 rounded-2xl rounded-tl-none shadow-md border border-white/5">
                    <div className="bg-white rounded-lg p-3 text-navy mb-2 overflow-hidden">
                       <p className="text-[10px] font-bold text-navy/60 uppercase mb-1">Mensalidade</p>
                       <div className="flex flex-col gap-0.5">
                         <span className="text-xs text-red-500 line-through">R$ 341,28</span>
                         <span className="text-lg font-black text-green-600">R$ 273,02</span>
                       </div>
                    </div>
                    <div className="flex justify-end mt-1 px-1">
                      <span className="text-[9px] text-white/40">10:23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#1C1F28] text-center border-t border-white/5">
              <p className="text-[10px] text-white/30 font-medium">Pré-visualização — não marca como lida e não abre a conversa.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* 4. ÁREA DA CONVERSA */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0F1117] shrink-0 relative">
          {selectedContactId ? (
            <>
              {/* Cabeçalho da Conversa */}
              <div className="h-[72px] border-b border-[#E5E7EB] dark:border-white/5 bg-white dark:bg-[#161922] px-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-surface-2 border border-line flex items-center justify-center font-bold text-coral text-sm shadow-sm">
                    JS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-[#171717] dark:text-white/90 text-[15px] tracking-tight leading-none">João Silva</h2>
                      <button className="p-1 hover:bg-[#FAFAFA] rounded-md transition-colors">
                        <Tag className="w-3.5 h-3.5 text-coral" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-[#667085] uppercase tracking-wider">
                      <span className="text-[#315DA8] dark:text-[#5289e9] font-bold">+55 34 99999-9999</span>
                      <span>•</span>
                      <span>Prot: 20240804-001</span>
                      <span>•</span>
                      <span>Zevva Tickets</span>
                      <span>•</span>
                      <span>WhatsApp</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#FAFAFA] text-[#667085] rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <Search className="w-[18px] h-[18px]" />
                  </button>
                  <button className="p-2 hover:bg-[#FAFAFA] text-[#667085] rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <Phone className="w-[18px] h-[18px]" />
                  </button>
                  <button className="p-2 hover:bg-[#FAFAFA] text-[#667085] rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <MoreVertical className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar bg-[#FAFAFA]/30 dark:bg-transparent">
                <div className="flex justify-center">
                  <span className="px-4 py-1.5 bg-white dark:bg-[#1e222d] text-[10px] font-bold text-[#667085] dark:text-white/40 uppercase tracking-widest rounded-full border border-[#E5E7EB] dark:border-white/5 shadow-sm">Hoje, 04 de Agosto</span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full group", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-2xl shadow-sm relative transition-shadow border",
                      msg.sender === 'agent' 
                        ? "bg-coral text-white rounded-tr-none border-coral/10 dark:shadow-[0_4px_12px_rgba(232,96,74,0.15)]" 
                        : "bg-white dark:bg-[#1e222d] text-[#171717] dark:text-white/90 rounded-tl-none border-[#E5E7EB] dark:border-white/5"
                    )}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1.5 mt-1.5",
                        msg.sender === 'agent' ? "text-white/60" : "text-[#667085]/40 dark:text-white/20"
                      )}>
                        <span className="text-[9px] font-bold">{msg.time}</span>
                        {msg.sender === 'agent' && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 5. CARDS INTERATIVOS */}
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#1e222d] text-[#171717] dark:text-white/90 rounded-2xl p-5 shadow-xl shadow-[#171717]/5 dark:shadow-none max-w-[320px] overflow-hidden border border-[#E5E7EB] dark:border-white/5 relative group hover:-translate-y-0.5 transition-transform">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-coral" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[10px] font-bold uppercase text-navy dark:text-white/80 font-bold tracking-widest bg-coral/10 px-2.5 py-1 rounded-md border border-coral/5">Negociação de Valor</div>
                    </div>
                    <div className="font-bold text-base mb-1 tracking-tight">Viagem Terra Santa 2026</div>
                    <p className="text-[11px] text-[#667085] dark:text-white/40 mb-4 leading-relaxed">Pacote completo com guia especializado e hospedagem premium.</p>
                    <div className="flex items-center gap-3 mb-5 p-3.5 bg-[#FAFAFA] dark:bg-[#0F1117] rounded-xl border border-[#E5E7EB] dark:border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#667085] dark:text-white/30 uppercase tracking-widest">Mensalidade</span>
                        <span className="text-sm text-[#E5484D] font-bold line-through">R$ 341,28</span>
                      </div>
                      <div className="w-px h-8 bg-[#E5E7EB] dark:bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#24B667] uppercase tracking-widest">Oferta</span>
                        <span className="text-xl font-bold text-[#24B667] tracking-tighter">R$ 273,02</span>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-[#171717] dark:bg-coral text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-coral/90 transition-all flex items-center justify-center gap-2">
                      ACEITAR PROPOSTA
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. CAMPO DE DIGITAÇÃO */}
              <div className="p-4 bg-white dark:bg-[#161922] border-t border-[#E5E7EB] dark:border-white/5 z-10">
                {agentStatus === 'offline' ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-[#FAFAFA] dark:bg-[#0F1117] border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                        <User className="w-8 h-8 text-[#667085] dark:text-white/20" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="font-bold text-[18px] dark:text-white/90">Você está Offline</h3>
                        <p className="text-[14px] text-[#667085] dark:text-white/40">Conecte-se para começar a receber mensagens</p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setAgentStatus('busy')} className="px-6 py-2.5 border border-[#E5E7EB] dark:border-white/5 dark:text-white/70 text-[13px] font-semibold rounded-lg hover:bg-[#FAFAFA] dark:hover:bg-white/5 transition-colors">Ficar Ocupado</button>
                        <button onClick={() => setAgentStatus('online')} className="px-6 py-2.5 bg-coral text-white text-[13px] font-bold rounded-lg hover:bg-coral/90 transition-colors">Ficar Online</button>
                     </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-end">
                    <div className="flex gap-1.5 mb-1 shrink-0">
                      <button className="p-2 hover:bg-[#FAFAFA] text-[#667085] rounded-lg transition-all border border-transparent hover:border-[#E5E7EB]"><Plus className="w-5 h-5" /></button>
                      <button className="p-2 hover:bg-[#FAFAFA] text-[#667085] rounded-lg transition-all border border-transparent hover:border-[#E5E7EB]"><Smile className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 relative">
                      <textarea 
                        rows={1}
                        className="w-full bg-[#FAFAFA] dark:bg-[#0F1117] border border-[#E5E7EB] dark:border-white/5 p-3.5 pr-14 rounded-xl text-[13px] text-[#171717] dark:text-white/90 placeholder:text-[#667085]/50 focus:outline-none focus:ring-1 focus:ring-coral transition-all resize-none" 
                        placeholder="Digite uma mensagem — use ‘/’ para atalhos" 
                      />
                      <button className="absolute right-2 top-2 w-9 h-9 bg-coral text-white rounded-lg flex items-center justify-center hover:bg-coral/90 transition-all">

                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 3. ESTADO ONLINE SEM CONVERSA SELECIONADA */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
               <div className="relative">
                 <div className="w-24 h-24 rounded-full bg-[#24B667]/5 flex items-center justify-center animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#24B667] border-4 border-white shadow-lg"></div>
                 </div>
               </div>
               <div className="max-w-md space-y-2">
                  <h3 className="font-bold text-[20px] text-[#171717] dark:text-white/90">Você está Online</h3>
                  <p className="text-[14px] text-[#667085] dark:text-white/40 leading-relaxed">
                    Escolha uma conversa em andamento ou inicie uma nova conversa agora mesmo. Enquanto estiver online, você receberá novos atendimentos normalmente.
                  </p>
               </div>
               <button 
                onClick={() => setIsActiveTicketDialogOpen(true)}
                className="px-8 py-3 bg-white border-2 border-coral text-coral text-[14px] font-bold rounded-xl hover:bg-coral/5 transition-colors shadow-sm"
              >
                 Iniciar nova conversa
               </button>
            </div>
          )}
        </div>

        {/* 9. BARRA VERTICAL DE AÇÕES (52px) */}
        <div className="w-[52px] border-l border-[#E5E7EB] dark:border-white/5 flex flex-col items-center py-6 gap-4 bg-white dark:bg-[#161922] shrink-0 z-10">
          {[
            { icon: CheckCircle, label: "Finalizar", onClick: () => setIsFinishDialogOpen(true) },
            { icon: Shuffle, label: "Transferir", onClick: () => setIsTransferDialogOpen(true) },
            { icon: PeopleIcon, label: "Dados" },
            { icon: Folder, label: "Arquivos" },
            { icon: HistoryIcon, label: "Histórico", onClick: () => setIsHistoryDialogOpen(true) },
            { icon: Calendar, label: "Agendar" },
            { icon: Zap, label: "Gatilhos" },
            { icon: Copy, label: "Copiar", onClick: () => {
              const text = messages.map(m => `${m.time} - ${m.sender === 'agent' ? 'Atendente' : 'Cliente'}: ${m.text}`).join('\n');
              navigator.clipboard.writeText(text);
              toast.success("Conversa copiada para a área de transferência");
            }},
            { icon: Printer, label: "Imprimir", onClick: () => window.print() },
          ].map((action, i) => (
            <button 
              key={i} 
              onClick={action.onClick}
              className={cn(
                "p-2.5 rounded-lg transition-all group relative border border-transparent",
                i === 0 ? "bg-coral text-white shadow-lg" : "text-navy/20 hover:bg-coral/5 hover:text-coral"
            )} title={action.label}>
              <action.icon className="w-5 h-5" />
              {i === 0 && <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-[#23262E] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Finalizar</span>}
              {i === 1 && <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-[#23262E] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-coral">Transferir</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Dialog: Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1D29] border-[#2D313F] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Filtros</DialogTitle>
            <DialogDescription className="text-gray-400">Selecione os filtros que deseja aplicar aos tickets.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Projeto</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  <SelectItem value="zevva">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tipo de canal</Label>
              <Select>
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="wa">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tipo de atendimento</Label>
              <Select defaultValue="receptivo">
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                  <SelectValue placeholder="Ativo e receptivo" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="receptivo">Ativo e receptivo</SelectItem>
                  <SelectItem value="only-receptivo">Apenas receptivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 py-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Departamentos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input placeholder="Buscar..." className="bg-[#23262E] border-none pl-9 h-10 text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tags</Label>
                <AlertCircle className="w-3 h-3 text-coral" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input placeholder="Buscar..." className="bg-[#23262E] border-none pl-9 h-10 text-xs" />
              </div>
            </div>
          </div>
          <div className="py-4">
             <div className="bg-[#315DA8]/20 border border-[#315DA8]/30 rounded-lg p-3 text-center text-[11px] text-[#315DA8] font-medium">
               Selecione um projeto para selecionar os canais (não é necessário selecionar um canal para filtrar)
             </div>
          </div>
          <div className="space-y-4 py-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preferências</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Mensagens agendadas</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Mensagens não lidas</span>
                <Switch />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsFilterDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white">
                <ListFilter className="w-4 h-4" /> Limpar filtros
              </button>
              <button onClick={() => { toast.success("Filtros aplicados"); setIsFilterDialogOpen(false); }} className="bg-[#FFD31A] hover:bg-[#FFD31A]/90 text-black px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest">Aplicar</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Histórico de Conversas */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1D29] border-[#2D313F] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Histórico de conversas</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Projeto</Label>
              <Select defaultValue="zevva">
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="zevva">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pesquisar por protocolo, nome ou telefone <span className="text-coral">*</span></Label>
              <div className="relative">
                <Input placeholder="Buscar por protocolo, nome ou telefone" className="bg-[#23262E] border-none h-11 text-xs pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold">0 / 255</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tipo de canal</Label>
                <Select>
                  <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                    <SelectValue placeholder="Selecione os tipos de canais" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23262E] border-none text-white">
                    <SelectItem value="wa">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Canais</Label>
                <Select>
                  <SelectTrigger className="bg-[#23262E] border-none text-xs h-10">
                    <SelectValue placeholder="Selecione um ou mais canais" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23262E] border-none text-white">
                    <SelectItem value="c1">Canal 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Período</Label>
              <button className="w-full bg-[#23262E] text-left px-4 h-10 rounded-lg text-xs text-gray-400">Selecionar período</button>
            </div>
            <button className="w-full py-3 bg-[#2F323D] text-gray-500 text-xs font-black uppercase tracking-widest rounded-lg cursor-not-allowed">Buscar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Iniciar Atendimento Ativo */}
      <Dialog open={isActiveTicketDialogOpen} onOpenChange={setIsActiveTicketDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1D29] border-[#2D313F] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Iniciar Atendimento Ativo</DialogTitle>
            <DialogDescription className="text-gray-400">Escolha um cliente para iniciar um novo atendimento ativo</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Organização</Label>
              <Select defaultValue="zevva">
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-11">
                  <SelectValue placeholder="Zevva" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="zevva">Zevva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Projeto</Label>
              <Select defaultValue="zevva-br">
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-11">
                  <SelectValue placeholder="Zevva Tickets" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="zevva-br">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Canal</Label>
              <Select>
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-11 text-gray-500">
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="wa">WhatsApp Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Departamento</Label>
              <Select>
                <SelectTrigger className="bg-[#23262E] border-none text-xs h-11 text-gray-500">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#23262E] border-none text-white">
                  <SelectItem value="vendas">Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsActiveTicketDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button className="flex-1 max-w-[400px] py-3 bg-[#2F323D] text-gray-500 text-[11px] font-black uppercase tracking-widest rounded-lg cursor-not-allowed">Escolher Destinatário</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Finalizar Atendimento */}
      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1D29] border-[#2D313F] text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold">Finalizar atendimento</DialogTitle>
              <Badge variant="outline" className="bg-[#23262E] border-none text-gray-500 text-[10px] px-2 py-0">20240804-001</Badge>
            </div>
            <DialogDescription className="text-gray-400">Ao finalizar este atendimento, o ticket será fechado e não poderá ser reaberto.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="bg-[#315DA8]/20 border border-[#315DA8]/30 rounded-lg p-3 flex items-center gap-3 text-[11px] text-[#315DA8] font-medium">
              <AlertCircle className="w-4 h-4" /> Não há classificações disponíveis para este departamento.
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Observações</Label>
              <div className="bg-[#23262E] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-4 text-gray-400">
                     <span className="font-serif font-bold">B</span>
                     <span className="italic font-serif">I</span>
                     <span className="line-through font-serif">S</span>
                     <span className="font-mono">{"<>"}</span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex gap-4 text-gray-400">
                    <Smile className="w-4 h-4" />
                    <Pencil className="w-4 h-4" />
                  </div>
                </div>
                <textarea 
                  className="w-full bg-transparent p-6 min-h-[160px] outline-none text-sm resize-none"
                  placeholder="Descreva o atendimento..."
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                   <Zap className="w-4 h-4 text-gray-500" />
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">0 / 512</span>
                     <MoreVertical className="w-4 h-4 text-gray-500" />
                   </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsFinishDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button onClick={() => { toast.success("Atendimento finalizado"); setIsFinishDialogOpen(false); }} className="flex-1 max-w-[400px] py-3 bg-coral hover:bg-coral/90 text-white text-[11px] font-black uppercase tracking-widest rounded-lg">Finalizar atendimento</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Transferir Atendimento */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1D29] border-[#2D313F] text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold">Transferir atendimento</DialogTitle>
              <Badge variant="outline" className="bg-[#23262E] border-none text-gray-500 text-[10px] px-2 py-0">20240804-001</Badge>
            </div>
            <DialogDescription className="text-gray-400">Escolha o destinatário para transferir este atendimento.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tipo de transferência</Label>
                <Select defaultValue="agent">
                  <SelectTrigger className="bg-[#23262E] border-none text-xs h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23262E] border-none text-white">
                    <SelectItem value="agent">Para Agente</SelectItem>
                    <SelectItem value="dept">Para Departamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Destinatário</Label>
                <Select>
                  <SelectTrigger className="bg-[#23262E] border-none text-xs h-11">
                    <SelectValue placeholder="Selecione um agente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#23262E] border-none text-white">
                    <SelectItem value="a1">Carlos Aguiar</SelectItem>
                    <SelectItem value="a2">Ana Pereira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Motivo da transferência</Label>
              <textarea 
                className="w-full bg-[#23262E] border-none p-4 rounded-xl text-xs text-white placeholder:text-gray-600 outline-none min-h-[100px] resize-none"
                placeholder="Explique o motivo da transferência..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsTransferDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button onClick={handleTransfer} className="flex-1 max-w-[400px] py-3 bg-coral hover:bg-coral/90 text-white text-[11px] font-black uppercase tracking-widest rounded-lg">Transferir agora</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(232, 96, 74, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(232, 96, 74, 0.2); }
        
        .custom-scrollbar-fina::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-fina::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-fina::-webkit-scrollbar-thumb { background: rgba(232, 96, 74, 0.05); border-radius: 10px; }

        .visible-scrollbar::-webkit-scrollbar { width: 6px; }
        .visible-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); }
        .visible-scrollbar::-webkit-scrollbar-thumb { background: rgba(232, 96, 74, 0.2); border-radius: 10px; }
        .visible-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(232, 96, 74, 0.4); }
        
        .dark .visible-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .dark .visible-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .dark .visible-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

        @media print {
          body * { visibility: hidden; }
          .flex-1.flex.flex-col.bg-white.shrink-0.relative, .flex-1.flex.flex-col.bg-white.shrink-0.relative * {
            visibility: visible;
          }
          .flex-1.flex.flex-col.bg-white.shrink-0.relative {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          header, .w-[540px], .w-[52px], .p-4.bg-white.border-t, .h-\[72px\] .flex.items-center.gap-2 {
            display: none !important;
          }
          .flex-1.overflow-y-auto.p-8.space-y-8 {
            overflow: visible !important;
            height: auto !important;
          }
          .custom-scrollbar::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}
