import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/auth/UserMenu";
import { 
  Search, Send, User, Check, CheckCheck, Phone, Plus, Bell, ChevronDown, 
  MoreVertical, CheckCircle, Shuffle, Users as PeopleIcon, Folder, Clock, 
  History as HistoryIcon, Calendar, Zap, Copy, Printer, Eye, Tag, AlertCircle, 
  LayoutList, MessageSquare, Filter, SlidersHorizontal, ListFilter,
  Settings as SettingsIcon,
  Paperclip, Smile, ImageIcon, Play, Volume2, Pencil, X, Home, ChevronRight,
  ArrowUpDown, SortAsc, SortDesc, CalendarDays, Lock, Globe, MessageCircle,
  Music, FileText, Sparkles, Wand2, ArrowUpCircle, AlignLeft, Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

const READ_RECEIPT_BLUE = "READ_RECEIPT_BLUE";
const ONLINE_STATUS_GREEN = "ONLINE_STATUS_GREEN";
const ATTENDANCE_GOLD = "ATTENDANCE_GOLD"; // Keep as gold if requested to evaluate, or swap to coral if it's the brand color. User suggested evaluating. I will use a constant.
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
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent-top');
  const [sidebarWidth, setSidebarWidth] = useState(540);
  const [isResizing, setIsResizing] = useState(false);
  const [previewContactId, setPreviewContactId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(false);

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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-inter transition-colors duration-300">
      {/* Header Fixo */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="p-2 hover:bg-accent rounded-xl transition-colors text-foreground group"
              title="Voltar para o Admin"
            >
              <Home className="w-5 h-5 group-hover:text-primary transition-colors" />
            </Link>
            <span className="font-black text-lg tracking-tighter text-primary italic">
              zevva.<span className="text-foreground">chat</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-accent rounded-lg p-1 border border-border">
              <button 
                onClick={() => setTheme('light')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                  theme === 'light' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-fg hover:text-foreground"
                )}
              >
                ☀ CLARO
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                  theme === 'dark' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-fg hover:text-foreground"
                )}
              >
                🌙 ESCURO
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-accent rounded-full transition-colors text-muted-fg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-primary rounded-full text-[8px] flex items-center justify-center border-2 border-card text-primary-foreground font-bold">3</span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-foreground uppercase leading-tight">Admin Zevva</div>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest leading-tight",
                agentStatus === 'online' ? "text-green-500" : agentStatus === 'busy' ? "text-amber-500" : "text-muted-fg"
              )}>{agentStatus}</div>
            </div>
            
            {user && (
              <UserMenu 
                user={user}
                onLogout={handleLogout}
                onNavigate={(path) => navigate({ to: path as any })}
                agentStatus={agentStatus}
                onStatusChange={setAgentStatus}
                onOpenSettings={() => setIsChatSettingsOpen(true)}
              />
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Coluna 1: Lista de Conversas */}
        <div 
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "border-r border-border flex flex-col bg-card shrink-0 relative",
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 bg-border group-hover:bg-coral transition-colors rounded-full" />
          </div>

          <div className="p-4 space-y-4">
            <div className="flex p-1 bg-muted rounded-full border border-border">
              <button className="flex-1 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">Em Atendimento</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-muted-foreground">Em Espera</button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-xs border border-border text-foreground focus:ring-1 focus:ring-primary/50 outline-none" 
                  placeholder="Buscar atendimentos..." 
                />
              </div>
              <div className="flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground border border-border">
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[300px] bg-popover border border-border text-popover-foreground p-2">
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-2">Tipos de Ordenação</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('recent-top')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'recent-top' ? "bg-primary/20 text-primary" : "hover:bg-accent")}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Mensagem mais recente no topo (Padrão)</span>
                      </div>
                      <SortDesc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('oldest-top')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'oldest-top' ? "bg-primary/20 text-primary" : "hover:bg-accent")}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Mensagem mais antiga no topo</span>
                      </div>
                      <SortAsc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('created-recent')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'created-recent' ? "bg-primary/20 text-primary" : "hover:bg-accent")}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-xs">Data de criação mais recente no topo</span>
                      </div>
                      <SortDesc className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('created-oldest')}
                      className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer", sortBy === 'created-oldest' ? "bg-primary/20 text-primary" : "hover:bg-accent")}
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
                  className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground border border-border"
                >
                  <Filter className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => setIsHistoryDialogOpen(true)}
                  className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground border border-border"
                >
                  <HistoryIcon className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setIsActiveTicketDialogOpen(true)}
                  className="p-2 bg-primary rounded-lg text-primary-foreground"
                  title="Iniciar atendimento ativo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase px-1">Exibindo {contacts.length} atendimentos de {contacts.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto visible-scrollbar px-2">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={cn(
                  "p-3 rounded-2xl mb-1 cursor-pointer transition-all border border-transparent",
                  selectedContactId === contact.id ? "bg-primary/10 border-primary/20" : "hover:bg-accent"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-card">
                      <MessageSquare className="w-2 h-2 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm truncate text-foreground">{contact.name}</span>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{contact.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
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
                      className="p-1 hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <button className="p-0.5 hover:bg-accent rounded-md">
                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Pré-visualização */}
        <Dialog open={!!previewContactId} onOpenChange={(open) => !open && setPreviewContactId(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {contacts.find(c => c.id === previewContactId)?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm">{contacts.find(c => c.id === previewContactId)?.name}</h3>
                    <Badge variant="outline" className="text-[9px] bg-muted border-border text-muted-foreground px-1.5 py-0 uppercase">Pré-visualização</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Última atividade {contacts.find(c => c.id === previewContactId)?.time}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewContactId(null)}
                className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 h-[500px] overflow-y-auto visible-scrollbar bg-[url('https://w0.peakpx.com/wallpaper/580/678/wallpaper-whatsapp-dark-mode.jpg')] bg-repeat bg-center">
              <div className="flex flex-col gap-4">
                {/* Simulando mensagens na pré-visualização */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-popover text-popover-foreground p-3 rounded-2xl rounded-tl-none shadow-md border border-border">
                    <p className="text-xs">{contacts.find(c => c.id === previewContactId)?.lastMsg}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-[9px] text-muted-foreground">10:05</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-[80%] self-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none shadow-md">
                    <p className="text-xs">Olá! No que podemos ajudar hoje?</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[9px] text-primary-foreground/70">10:07</span>
                      <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                    </div>
                  </div>
                </div>

                {/* Mensagem de voz simulada se for o Paulo Vitor (referência da imagem) */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-popover text-popover-foreground p-3 rounded-2xl rounded-tl-none shadow-md border border-border w-[280px]">
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <div className="flex-1 h-1 bg-muted rounded-full relative">
                        <div className="absolute inset-0 w-1/3 bg-primary rounded-full" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">0:44</span>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-[9px] text-muted-foreground">10:21</span>
                    </div>
                  </div>
                </div>

                {/* Card de imagem simulado */}
                <div className="flex flex-col gap-2 max-w-[80%] self-start">
                  <div className="bg-popover text-popover-foreground p-2 rounded-2xl rounded-tl-none shadow-md border border-border">
                    <div className="bg-card rounded-lg p-3 text-card-foreground mb-2 overflow-hidden">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Mensalidade</p>
                       <div className="flex flex-col gap-0.5">
                         <span className="text-xs text-red-500 line-through">R$ 341,28</span>
                         <span className="text-lg font-black text-green-600">R$ 273,02</span>
                       </div>
                    </div>
                    <div className="flex justify-end mt-1 px-1">
                      <span className="text-[9px] text-muted-foreground">10:23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 text-center border-t border-border">
              <p className="text-[10px] text-muted-foreground font-medium">Pré-visualização — não marca como lida e não abre a conversa.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* 4. ÁREA DA CONVERSA */}
        <div className="flex-1 flex flex-col bg-background shrink-0 relative">
          {selectedContactId ? (
            <>
              {/* Cabeçalho da Conversa */}
              <div className="h-[72px] border-b border-border bg-card px-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-accent border border-border flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                    JS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-foreground text-[15px] tracking-tight leading-none">João Silva</h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-primary/10 rounded-md transition-colors group">
                            <Tag className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[280px] bg-popover border border-border p-2 shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 py-2">Gerenciar Tags</DropdownMenuLabel>
                          <div className="px-2 pb-2">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input 
                                placeholder="Buscar ou criar tag..." 
                                className="h-9 pl-8 text-xs bg-muted border-none"
                              />
                            </div>
                          </div>
                          <DropdownMenuSeparator className="bg-border" />
                          <div className="max-h-[200px] overflow-y-auto py-1">
                            {[
                              { label: 'Analisar', color: 'bg-red-500' },
                              { label: 'Cotação', color: 'bg-cyan-400' },
                              { label: 'Em Negociação', color: 'bg-amber-500' },
                              { label: 'Insatisfeito', color: 'bg-orange-500' },
                              { label: 'Resgate', color: 'bg-blue-500' },
                              { label: 'Venda', color: 'bg-green-500' },
                            ].map((tag) => (
                              <DropdownMenuItem key={tag.label} className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-accent rounded-md group">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-2 h-2 rounded-full", tag.color)} />
                                  <span className="text-xs font-medium text-foreground">{tag.label}</span>
                                </div>
                                <div className="w-4 h-4 border border-border rounded group-hover:border-primary transition-colors" />
                              </DropdownMenuItem>
                            ))}
                          </div>
                          <DropdownMenuSeparator className="bg-border" />
                          <button className="w-full flex items-center gap-2 px-2 py-2 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-md transition-colors mt-1">
                            <Plus className="w-3.5 h-3.5" />
                            CRIAR NOVA TAG
                          </button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      <span className="text-primary font-bold">+55 34 99999-9999</span>
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
                   <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-colors border border-transparent hover:border-border">
                    <Search className="w-[18px] h-[18px]" />
                  </button>
                  <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-colors border border-transparent hover:border-border">
                    <Phone className="w-[18px] h-[18px]" />
                  </button>
                  <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-colors border border-transparent hover:border-border">
                    <MoreVertical className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar bg-background">
                <div className="flex justify-center">
                  <span className="px-4 py-1.5 bg-card text-[10px] font-bold text-muted-foreground uppercase tracking-widest rounded-full border border-border shadow-sm">Hoje, 04 de Agosto</span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full group", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-2xl shadow-sm relative transition-shadow border",
                      msg.sender === 'agent' 
                        ? "bg-primary text-primary-foreground rounded-tr-none border-primary/10 shadow-[0_4px_12px_rgba(var(--primary),0.15)]" 
                        : "bg-card text-foreground rounded-tl-none border-border"
                    )}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1.5 mt-1.5",
                        msg.sender === 'agent' ? "text-primary-foreground/60" : "text-muted-foreground/40"
                      )}>
                        <span className="text-[9px] font-bold">{msg.time}</span>
                        {msg.sender === 'agent' && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 5. CARDS INTERATIVOS */}
                <div className="flex justify-start">
                  <div className="bg-card text-foreground rounded-2xl p-5 shadow-xl shadow-foreground/5 max-w-[320px] overflow-hidden border border-border relative group hover:-translate-y-0.5 transition-transform">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[10px] font-bold uppercase text-foreground tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/5">Negociação de Valor</div>
                    </div>
                    <div className="font-bold text-base mb-1 tracking-tight">Viagem Terra Santa 2026</div>
                    <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Pacote completo com guia especializado e hospedagem premium.</p>
                    <div className="flex items-center gap-3 mb-5 p-3.5 bg-muted rounded-xl border border-border">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Mensalidade</span>
                        <span className="text-sm text-destructive font-bold line-through">R$ 341,28</span>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[ONLINE_STATUS_GREEN] uppercase tracking-widest">Oferta</span>
                        <span className="text-xl font-bold text-[ONLINE_STATUS_GREEN] tracking-tighter">R$ 273,02</span>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      ACEITAR PROPOSTA
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. CAMPO DE DIGITAÇÃO */}
              <div className="p-4 bg-card border-t border-border z-10">
                {agentStatus === 'offline' ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="font-bold text-[18px] text-foreground">Você está Offline</h3>
                         <p className="text-[14px] text-muted-foreground">Conecte-se para começar a receber mensagens</p>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={() => setAgentStatus('busy')} className="px-6 py-2.5 border border-border text-muted-foreground text-[13px] font-semibold rounded-lg hover:bg-accent transition-colors">Ficar Ocupado</button>
                         <button onClick={() => setAgentStatus('online')} className="px-6 py-2.5 bg-primary text-primary-foreground text-[13px] font-bold rounded-lg hover:bg-primary/90 transition-colors">Ficar Online</button>
                      </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-end">
                    <div className="flex gap-1.5 mb-1 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-all border border-transparent hover:border-border">
                            <Plus className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top" className="w-[220px] bg-popover border border-border p-1 shadow-2xl">
                          <DropdownMenuItem onClick={() => { setFileType('image/*'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-foreground">Fotos e Vídeos</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setFileType('audio/*'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                            <Music className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-medium text-foreground">Áudio</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setFileType('.pdf,.doc,.docx,.xls,.xlsx'); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium text-foreground">Documento</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-medium text-foreground">Mensagem interna</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
                              <span className="text-[8px] font-bold text-muted-foreground">i</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-all border border-transparent hover:border-border">
                        <Smile className="w-5 h-5" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-all border border-transparent hover:border-border">
                            <Sparkles className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top" className="w-[280px] bg-popover border border-border p-1 shadow-2xl overflow-y-auto max-h-[450px]">
                          <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary" /> Assistente de IA
                          </DropdownMenuLabel>
                          
                          <div className="px-3 py-2">
                             <div className="flex flex-col gap-1.5 p-2 bg-muted rounded-lg border border-border">
                               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                 <Pencil className="w-3 h-3" /> Criar texto
                               </div>
                               <p className="text-[9px] text-muted-foreground italic">Descreva em pelo menos 20 caracteres</p>
                             </div>
                          </div>

                          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                            <Wand2 className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-foreground">Melhorar texto</span>
                          </DropdownMenuItem>
                          
                           <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                             <ArrowUpCircle className="w-4 h-4 text-green-500" />
                             <span className="text-xs font-medium text-foreground">Aumentar o texto</span>
                           </DropdownMenuItem>

                           <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                             <AlignLeft className="w-4 h-4 text-blue-500" />
                             <span className="text-xs font-medium text-foreground">Resumir</span>
                           </DropdownMenuItem>

                           <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                             <Smile className="w-4 h-4 text-cyan-400" />
                             <span className="text-xs font-medium text-foreground">Adicionar emojis</span>
                           </DropdownMenuItem>

                           <DropdownMenuSeparator className="bg-border" />

                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                                 <div className="flex items-center gap-3">
                                   <Volume2 className="w-4 h-4 text-amber-600" />
                                   <span className="text-xs font-medium text-foreground">Alterar o tom</span>
                                 </div>
                                 <ChevronRight className="w-3 h-3 text-muted-foreground" />
                               </div>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent side="right" className="bg-popover border border-border p-1 shadow-xl">
                              {['Comunicativo', 'Bem-humorado', 'Entusiasmado', 'Informativo', 'Profissional', 'Inteligente', 'Confiável'].map(tone => (
                                 <DropdownMenuItem key={tone} className="text-xs px-3 py-2 hover:bg-accent cursor-pointer rounded-md text-foreground">
                                   {tone}
                                 </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                                 <div className="flex items-center gap-3">
                                   <LayoutList className="w-4 h-4 text-red-500" />
                                   <span className="text-xs font-medium text-foreground">Alterar o sotaque</span>
                                 </div>
                                 <ChevronRight className="w-3 h-3 text-muted-foreground" />
                               </div>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent side="right" className="bg-popover border border-border p-1 shadow-xl max-h-[300px] overflow-y-auto">
                              {['Gaúcho', 'Carioca', 'Paulista', 'Mineiro', 'Nordestino', 'Baiano', 'Nortista', 'Sertanejo', 'Catarinense', 'Paranaense'].map(accent => (
                                 <DropdownMenuItem key={accent} className="text-xs px-3 py-2 hover:bg-accent cursor-pointer rounded-md text-foreground">
                                   {accent}
                                 </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md">
                                 <div className="flex items-center gap-3">
                                   <Globe className="w-4 h-4 text-blue-400" />
                                   <span className="text-xs font-medium text-foreground">Traduzir</span>
                                 </div>
                                 <ChevronRight className="w-3 h-3 text-muted-foreground" />
                               </div>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent side="right" className="bg-popover border border-border p-1 shadow-xl">
                              {[
                                { label: 'Para Inglês', flag: '🇺🇸' },
                                { label: 'Para Português', flag: '🇧🇷' },
                                { label: 'Para Espanhol', flag: '🇪🇸' }
                              ].map(lang => (
                                 <DropdownMenuItem key={lang.label} className="flex items-center gap-2 text-xs px-3 py-2 hover:bg-accent cursor-pointer rounded-md text-foreground">
                                   <span>{lang.flag}</span> {lang.label}
                                 </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenuSeparator className="bg-border" />

                          <div className="px-3 py-2 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <Switch 
                                 checked={aiAssistantEnabled} 
                                 onCheckedChange={setAiAssistantEnabled}
                                 className="scale-75 data-[state=checked]:bg-primary" 
                               />
                               <span className="text-[10px] font-bold text-muted-foreground">Assistente automático</span>
                             </div>
                             <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center cursor-help">
                               <span className="text-[8px] font-bold text-muted-foreground">i</span>
                             </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-all border border-transparent hover:border-border">
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept={fileType || undefined} 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            toast.success(`Arquivo ${e.target.files[0].name} selecionado`);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 relative">
                      <textarea 
                        rows={1}
                        className="w-full bg-muted border border-border p-3.5 pr-14 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                        placeholder="Digite uma mensagem — use ‘/’ para atalhos" 
                      />
                      <button className="absolute right-2 top-2 w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all">

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
                 <div className="w-24 h-24 rounded-full bg-[ONLINE_STATUS_GREEN]/5 flex items-center justify-center animate-pulse">
                     <div className="w-12 h-12 rounded-full bg-green-500 border-4 border-background shadow-lg"></div>
                 </div>
               </div>
               <div className="max-w-md space-y-2">
                   <h3 className="font-bold text-[20px] text-foreground">Você está Online</h3>
                   <p className="text-[14px] text-muted-foreground leading-relaxed">
                     Escolha uma conversa em andamento ou inicie uma nova conversa agora mesmo. Enquanto estiver online, você receberá novos atendimentos normalmente.
                   </p>
               </div>
               <button 
                onClick={() => setIsActiveTicketDialogOpen(true)}
                className="px-8 py-3 bg-primary text-primary-foreground text-[14px] font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              >
                 Iniciar nova conversa
               </button>
            </div>
          )}
        </div>

        {/* 9. BARRA VERTICAL DE AÇÕES (52px) */}
        <div className="w-[52px] border-l border-border flex flex-col items-center py-6 gap-4 bg-card shrink-0 z-10">
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
                i === 0 ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )} title={action.label}>
              <action.icon className="w-5 h-5" />
              {i === 0 && <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-popover text-popover-foreground border border-border text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Finalizar</span>}
              {i === 1 && <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-popover text-popover-foreground border border-border text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-primary">Transferir</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Dialog: Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Filtros</DialogTitle>
            <DialogDescription className="text-muted-foreground">Selecione os filtros que deseja aplicar aos tickets.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projeto</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-muted border-none text-xs h-10">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  <SelectItem value="zevva">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de canal</Label>
              <Select>
                <SelectTrigger className="bg-muted border-none text-xs h-10">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="wa">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de atendimento</Label>
              <Select defaultValue="receptivo">
                <SelectTrigger className="bg-muted border-none text-xs h-10">
                  <SelectValue placeholder="Ativo e receptivo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="receptivo">Ativo e receptivo</SelectItem>
                  <SelectItem value="only-receptivo">Apenas receptivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 py-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Departamentos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Buscar..." className="bg-muted border-none pl-9 h-10 text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tags</Label>
                <AlertCircle className="w-3 h-3 text-primary" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Buscar..." className="bg-muted border-none pl-9 h-10 text-xs" />
              </div>
            </div>
          </div>
          <div className="py-4">
             <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center text-[11px] text-primary font-medium">
               Selecione um projeto para selecionar os canais (não é necessário selecionar um canal para filtrar)
             </div>
          </div>
          <div className="space-y-4 py-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preferências</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mensagens agendadas</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mensagens não lidas</span>
                <Switch />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsFilterDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
                <ListFilter className="w-4 h-4" /> Limpar filtros
              </button>
              <button onClick={() => { toast.success("Filtros aplicados"); setIsFilterDialogOpen(false); }} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest">Aplicar</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Histórico de Conversas */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Histórico de conversas</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projeto</Label>
              <Select defaultValue="zevva">
                <SelectTrigger className="bg-muted border-none text-xs h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="zevva">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pesquisar por protocolo, nome ou telefone <span className="text-primary">*</span></Label>
              <div className="relative">
                <Input placeholder="Buscar por protocolo, nome ou telefone" className="bg-muted border-none h-11 text-xs pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">0 / 255</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de canal</Label>
                 <Select>
                   <SelectTrigger className="bg-muted border-none text-xs h-10">
                     <SelectValue placeholder="Selecione os tipos de canais" />
                   </SelectTrigger>
                   <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="wa">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Canais</Label>
                 <Select>
                   <SelectTrigger className="bg-muted border-none text-xs h-10">
                     <SelectValue placeholder="Selecione um ou mais canais" />
                   </SelectTrigger>
                   <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="c1">Canal 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Período</Label>
              <button className="w-full bg-muted text-left px-4 h-10 rounded-lg text-xs text-muted-foreground">Selecionar período</button>
            </div>
            <button className="w-full py-3 bg-muted text-muted-foreground/50 text-xs font-black uppercase tracking-widest rounded-lg cursor-not-allowed">Buscar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Iniciar Atendimento Ativo */}
      <Dialog open={isActiveTicketDialogOpen} onOpenChange={setIsActiveTicketDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Iniciar Atendimento Ativo</DialogTitle>
            <DialogDescription className="text-muted-foreground">Escolha um cliente para iniciar um novo atendimento ativo</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Organização</Label>
              <Select defaultValue="zevva">
                <SelectTrigger className="bg-muted border-none text-xs h-11">
                  <SelectValue placeholder="Zevva" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="zevva">Zevva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projeto</Label>
              <Select defaultValue="zevva-br">
                <SelectTrigger className="bg-muted border-none text-xs h-11">
                  <SelectValue placeholder="Zevva Tickets" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="zevva-br">Zevva Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Canal</Label>
              <Select>
                <SelectTrigger className="bg-muted border-none text-xs h-11 text-muted-foreground">
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="wa">WhatsApp Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Departamento</Label>
              <Select>
                <SelectTrigger className="bg-muted border-none text-xs h-11 text-muted-foreground">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="vendas">Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsActiveTicketDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button className="flex-1 max-w-[400px] py-3 bg-muted text-muted-foreground/50 text-[11px] font-black uppercase tracking-widest rounded-lg cursor-not-allowed">Escolher Destinatário</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Finalizar Atendimento */}
      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <DialogTitle className="text-xl font-bold">Finalizar atendimento</DialogTitle>
              <Badge variant="outline" className="bg-muted border-border text-muted-foreground text-[10px] px-3 py-1 font-mono w-fit">
                20240804-001
              </Badge>
            </div>
            <DialogDescription className="text-muted-foreground text-left">
              Ao finalizar este atendimento, o ticket será fechado e não poderá ser reaberto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 text-[11px] text-primary font-medium">
              <AlertCircle className="w-4 h-4" /> Não há classificações disponíveis para este departamento.
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Observações</Label>
              <div className="bg-muted rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
                  <div className="flex gap-4 text-muted-foreground">
                     <span className="font-serif font-bold">B</span>
                     <span className="italic font-serif">I</span>
                     <span className="line-through font-serif">S</span>
                     <span className="font-mono">{"<>"}</span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex gap-4 text-muted-foreground">
                    <Smile className="w-4 h-4" />
                    <Pencil className="w-4 h-4" />
                  </div>
                </div>
                <textarea 
                  className="w-full bg-transparent p-6 min-h-[160px] outline-none text-sm resize-none text-foreground"
                  placeholder="Descreva o atendimento..."
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                   <Zap className="w-4 h-4 text-muted-foreground" />
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">0 / 512</span>
                     <MoreVertical className="w-4 h-4 text-muted-foreground" />
                   </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsFinishDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button onClick={() => { toast.success("Atendimento finalizado"); setIsFinishDialogOpen(false); }} className="flex-1 max-w-[400px] py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-lg">Finalizar atendimento</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Transferir Atendimento */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-bold">Transferir atendimento</DialogTitle>
              <Badge variant="outline" className="bg-muted border-none text-muted-foreground text-[10px] px-2 py-0">20240804-001</Badge>
            </div>
            <DialogDescription className="text-muted-foreground">Escolha o destinatário para transferir este atendimento.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de transferência</Label>
                <Select defaultValue="agent">
                  <SelectTrigger className="bg-muted border-none text-xs h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="agent">Para Agente</SelectItem>
                    <SelectItem value="dept">Para Departamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Destinatário</Label>
                <Select>
                  <SelectTrigger className="bg-muted border-none text-xs h-11">
                    <SelectValue placeholder="Selecione um agente" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="a1">Carlos Aguiar</SelectItem>
                    <SelectItem value="a2">Ana Pereira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Motivo da transferência</Label>
              <textarea 
                className="w-full bg-muted border-none p-4 rounded-xl text-xs text-foreground placeholder:text-muted-foreground outline-none min-h-[100px] resize-none"
                placeholder="Explique o motivo da transferência..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-between sm:justify-between items-center w-full">
            <button onClick={() => setIsTransferDialogOpen(false)} className="text-sm font-bold hover:underline">Cancelar</button>
            <button onClick={handleTransfer} className="flex-1 max-w-[400px] py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-lg">Transferir agora</button>
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
          .flex-1.flex.flex-col.bg-background.shrink-0.relative, .flex-1.flex.flex-col.bg-background.shrink-0.relative * {
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
      {/* Dialog: Configurações do Chat */}
      <Dialog open={isChatSettingsOpen} onOpenChange={setIsChatSettingsOpen}>
        <DialogContent className="max-w-md bg-popover border-border text-foreground p-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold">Preferências</DialogTitle>
                <DialogDescription className="text-[10px] text-muted-foreground">Configurações do ez Chat</DialogDescription>
              </div>
            </div>
            <button onClick={() => setIsChatSettingsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                <Bell className="w-3 h-3" /> NOTIFICAÇÕES
              </div>
              <div className="space-y-1 bg-muted rounded-xl border border-border overflow-hidden">
                {[
                  { label: "Notificações de novos chats", icon: true },
                  { label: "Alertas sonoros para novos tickets", sound: true },
                  { label: "Alertas sonoros para novas mensagens", sound: true },
                  { label: "Alertas sonoros para tickets transferidos", sound: true },
                ].map((pref, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4", i !== 3 && "border-b border-border")}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground font-medium">{pref.label}</span>
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3">
                      {pref.sound && <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />}
                      <Switch defaultChecked={pref.label !== "Notificações de novos chats"} className="data-[state=checked]:bg-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                <MessageSquare className="w-3 h-3" /> CHAT
              </div>
              <div className="bg-muted rounded-xl border border-border p-4 flex items-center justify-between">
                <span className="text-xs text-foreground font-medium">Enviar mensagem ao pressionar ENTER</span>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
