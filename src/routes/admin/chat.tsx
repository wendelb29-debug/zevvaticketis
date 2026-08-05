import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  Search, Send, User, Check, CheckCheck, Phone, Plus, Bell, ChevronDown, 
  MoreVertical, CheckCircle, Shuffle, Users as PeopleIcon, Folder, Clock, 
  History as HistoryIcon, Calendar, Zap, Copy, Printer, Eye, Tag, AlertCircle, 
  LayoutList, MessageSquare, Filter, SlidersHorizontal, ListFilter,
  Paperclip, Smile, Image as ImageIcon, Play, Volume2, Pencil, X, Home, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin/chat')({
  component: AdminChatPage,
});

function AdminChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>("1");
  const [agentStatus, setAgentStatus] = useState<'online' | 'busy' | 'offline'>('offline');

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
    <div className="flex flex-col h-screen bg-white text-[#171717] overflow-hidden font-inter">
      {/* Header Fixo */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-line bg-white shrink-0 z-10 shadow-sm">
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
            <div className="text-right">
              <div className="text-xs font-black text-navy uppercase">Admin Zevva</div>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                agentStatus === 'online' ? "text-green-500" : agentStatus === 'busy' ? "text-amber-500" : "text-navy/40"
              )}>{agentStatus}</div>
            </div>
            <div className="relative cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-surface-2 border border-line overflow-hidden flex items-center justify-center font-black text-navy/40">
                <User className="w-6 h-6" />
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                agentStatus === 'online' ? "bg-green-500" : agentStatus === 'busy' ? "bg-amber-500" : "bg-navy/20"
              )} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Coluna 1: Lista de Conversas (410px) */}
        <div className="w-[410px] border-r border-[#2d3247] flex flex-col bg-[#1a1d29] shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex p-1 bg-[#24283b] rounded-full">
              <button className="flex-1 py-1.5 text-xs font-bold bg-[#d9a94d] text-[#14182a] rounded-full">Em Atendimento</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-gray-500">Em Espera</button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  className="w-full pl-9 pr-4 py-2 bg-[#2d3247] rounded-lg text-xs border-none focus:ring-1 focus:ring-[#d9a94d]/50" 
                  placeholder="Buscar atendimentos..." 
                />
              </div>
              <div className="flex gap-1">
                <button className="p-2 bg-[#2d3247] rounded-lg text-gray-400 hover:text-white"><LayoutList className="w-4 h-4" /></button>
                <button className="p-2 bg-[#2d3247] rounded-lg text-gray-400 hover:text-white"><Clock className="w-4 h-4" /></button>
                <button className="p-2 bg-[#d9a94d] rounded-lg text-[#14182a]"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 font-bold uppercase px-1">Exibindo {contacts.length} atendimentos de {contacts.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-fina px-2">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={cn(
                  "p-3 rounded-2xl mb-1 cursor-pointer transition-all border border-transparent",
                  selectedContactId === contact.id ? "bg-[#2d3247] border-[#d9a94d]/20" : "hover:bg-[#24283b]"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d9a94d] to-[#b8925a] flex items-center justify-center text-navy font-black text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-[#1a1d29]">
                      <MessageSquare className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm truncate">{contact.name}</span>
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
                    <Eye className="w-3.5 h-3.5 text-gray-600 hover:text-[#d9a94d] transition-colors" />
                    <button className="p-0.5 hover:bg-[#1a1d29] rounded-md">
                      <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ÁREA DA CONVERSA */}
        <div className="flex-1 flex flex-col bg-white shrink-0 relative">
          {selectedContactId ? (
            <>
              {/* Cabeçalho da Conversa */}
              <div className="h-[72px] border-b border-[#E5E7EB] bg-white px-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center font-bold text-[#FFD31A] text-sm shadow-sm">
                    JS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-[#171717] text-[15px] tracking-tight leading-none">João Silva</h2>
                      <button className="p-1 hover:bg-[#FAFAFA] rounded-md transition-colors">
                        <Tag className="w-3.5 h-3.5 text-[#FFD31A]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-[#667085] uppercase tracking-wider">
                      <span className="text-[#315DA8] font-bold">+55 34 99999-9999</span>
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
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar bg-[#FAFAFA]/30">
                <div className="flex justify-center">
                  <span className="px-4 py-1.5 bg-white text-[10px] font-bold text-[#667085] uppercase tracking-widest rounded-full border border-[#E5E7EB] shadow-sm">Hoje, 04 de Agosto</span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full group", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-2xl shadow-sm relative transition-shadow border",
                      msg.sender === 'agent' 
                        ? "bg-[#FFF9DF] text-[#171717] rounded-tr-none border-[#FFD31A]/10" 
                        : "bg-white text-[#171717] rounded-tl-none border-[#E5E7EB]"
                    )}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1.5 mt-1.5",
                        msg.sender === 'agent' ? "text-[#F2C600]" : "text-[#667085]/40"
                      )}>
                        <span className="text-[9px] font-bold">{msg.time}</span>
                        {msg.sender === 'agent' && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 5. CARDS INTERATIVOS */}
                <div className="flex justify-start">
                  <div className="bg-white text-[#171717] rounded-2xl p-5 shadow-xl shadow-[#171717]/5 max-w-[320px] overflow-hidden border border-[#E5E7EB] relative group hover:-translate-y-0.5 transition-transform">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFD31A]" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[10px] font-bold uppercase text-[#315DA8] tracking-widest bg-[#EAF2FF] px-2.5 py-1 rounded-md border border-[#EAF2FF]">Negociação de Valor</div>
                    </div>
                    <div className="font-bold text-base mb-1 tracking-tight">Viagem Terra Santa 2026</div>
                    <p className="text-[11px] text-[#667085] mb-4 leading-relaxed">Pacote completo com guia especializado e hospedagem premium.</p>
                    <div className="flex items-center gap-3 mb-5 p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#667085] uppercase tracking-widest">Mensalidade</span>
                        <span className="text-sm text-[#E5484D] font-bold line-through">R$ 341,28</span>
                      </div>
                      <div className="w-px h-8 bg-[#E5E7EB]" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-[#24B667] uppercase tracking-widest">Oferta</span>
                        <span className="text-xl font-bold text-[#24B667] tracking-tighter">R$ 273,02</span>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-[#171717] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                      ACEITAR PROPOSTA
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. CAMPO DE DIGITAÇÃO */}
              <div className="p-4 bg-white border-t border-[#E5E7EB] z-10">
                {agentStatus === 'offline' ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center">
                        <User className="w-8 h-8 text-[#667085]" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="font-bold text-[18px]">Você está Offline</h3>
                        <p className="text-[14px] text-[#667085]">Conecte-se para começar a receber mensagens</p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setAgentStatus('busy')} className="px-6 py-2.5 border border-[#E5E7EB] text-[13px] font-semibold rounded-lg hover:bg-[#FAFAFA] transition-colors">Ficar Ocupado</button>
                        <button onClick={() => setAgentStatus('online')} className="px-6 py-2.5 bg-[#FFD31A] text-[#171717] text-[13px] font-bold rounded-lg hover:bg-[#F2C600] transition-colors">Ficar Online</button>
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
                        className="w-full bg-[#FAFAFA] border border-[#E5E7EB] p-3.5 pr-14 rounded-xl text-[13px] text-[#171717] placeholder:text-[#667085]/50 focus:outline-none focus:ring-1 focus:ring-[#FFD31A] transition-all resize-none" 
                        placeholder="Digite uma mensagem — use ‘/’ para atalhos" 
                      />
                      <button className="absolute right-2 top-2 w-9 h-9 bg-[#FFD31A] text-[#171717] rounded-lg flex items-center justify-center hover:bg-[#F2C600] transition-all">
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
                  <h3 className="font-bold text-[20px] text-[#171717]">Você está Online</h3>
                  <p className="text-[14px] text-[#667085] leading-relaxed">
                    Escolha uma conversa em andamento ou inicie uma nova conversa agora mesmo. Enquanto estiver online, você receberá novos atendimentos normalmente.
                  </p>
               </div>
               <button className="px-8 py-3 bg-white border-2 border-[#FFD31A] text-[#171717] text-[14px] font-bold rounded-xl hover:bg-[#FFFBE8] transition-colors shadow-sm">
                 Iniciar nova conversa
               </button>
            </div>
          )}
        </div>

        {/* 9. BARRA VERTICAL DE AÇÕES (52px) */}
        <div className="w-[52px] border-l border-[#E5E7EB] flex flex-col items-center py-6 gap-4 bg-white shrink-0 z-10">
          {[
            { icon: CheckCircle, label: "Finalizar" },
            { icon: Shuffle, label: "Transferir" },
            { icon: PeopleIcon, label: "Dados" },
            { icon: Folder, label: "Arquivos" },
            { icon: HistoryIcon, label: "Histórico" },
            { icon: Calendar, label: "Agendar" },
            { icon: Zap, label: "Gatilhos" },
            { icon: Copy, label: "Copiar" },
            { icon: Printer, label: "Imprimir" },
          ].map((action, i) => (
            <button key={i} className={cn(
                "p-2.5 rounded-lg transition-all group relative border border-transparent",
                i === 2 ? "bg-[#FFFBE8] border-[#FFD31A]/30 text-[#171717]" : "text-[#667085] hover:bg-[#FAFAFA] hover:text-[#171717]"
            )} title={action.label}>
              <action.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar-fina::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-fina::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-fina::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar-fina::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
