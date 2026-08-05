import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhatsAppContacts, sendWhatsAppMessage } from '@/lib/whatsapp/whatsapp.functions';
import { 
  Search, Send, User, Check, CheckCheck, Phone, Plus, Bell, ChevronDown, 
  MoreVertical, CheckCircle, Shuffle, Users as PeopleIcon, Folder, Clock, 
  History as HistoryIcon,
  Calendar, Zap, Copy, Printer, Eye, Tag, AlertCircle, LayoutList, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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
    <div className="flex flex-col h-screen bg-[#1a1d29] text-white overflow-hidden font-inter">
      {/* Header Fixo */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#2d3247] bg-[#1a1d29] shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tighter italic">ez.<span className="text-[#d9a94d]">chat</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <HistoryIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#24283b] rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-[#2d3247]">
              <PeopleIcon className="w-3 h-3 text-[#d9a94d]" /> Atendimentos
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral rounded-full text-[8px] flex items-center justify-center border-2 border-[#1a1d29]">3</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold">Admin Zevva</div>
              <div className="text-[10px] text-gray-500 uppercase font-black">{agentStatus}</div>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gray-600 border border-[#2d3247]" />
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1d29]",
                agentStatus === 'online' ? "bg-green-500" : agentStatus === 'busy' ? "bg-yellow-500" : "bg-gray-500"
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

        {/* Coluna 2: Thread da Conversa */}
        <div className="flex-1 flex flex-col bg-[#161924] shrink-0">
          <div className="h-24 border-b border-[#2d3247] bg-[#1a1d29] px-6 flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2d3247] flex items-center justify-center font-bold">JS</div>
                <div>
                  <div className="font-extrabold text-sm">João Silva</div>
                  <div className="text-[10px] text-gray-500">+55 34 99999-9999</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-[#2d3247] rounded-lg transition-colors text-gray-400">
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
              <span>Protocolo: 20240804-001</span>
              <span>•</span>
              <span>Zevva Tickets</span>
              <span>•</span>
              <span>WhatsApp</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex w-full", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] p-3 rounded-2xl shadow-lg relative",
                  msg.sender === 'agent' 
                    ? "bg-[#2d3247] text-white rounded-tr-none border border-[#d9a94d]/10" 
                    : "bg-[#24283b] text-white rounded-tl-none"
                )}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <span className="text-[9px] text-gray-500 font-bold">{msg.time}</span>
                    {msg.sender === 'agent' && <CheckCheck className="w-3 h-3 text-[#d9a94d]" />}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Rich Card Example */}
            <div className="flex justify-start">
              <div className="bg-white text-[#14182a] rounded-2xl p-4 shadow-xl max-w-xs overflow-hidden border-l-4 border-[#d9a94d]">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Negociação de Valor</div>
                <div className="font-bold text-lg mb-1">Terra Santa 2026</div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xs text-red-500 line-through">R$ 5.400,00</span>
                  <span className="text-xl font-black text-green-600">R$ 4.900,00</span>
                </div>
                <button className="w-full py-2 bg-[#14182a] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">ACEITAR PROPOSTA</button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#1a1d29] border-t border-[#2d3247]">
            {agentStatus === 'offline' ? (
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl gap-4">
                <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Você só pode enviar mensagens quando seu status for online ou ocupado</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAgentStatus('online')} className="px-3 py-1.5 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-lg hover:bg-green-500/30 transition-colors">Online</button>
                  <button onClick={() => setAgentStatus('busy')} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase rounded-lg hover:bg-yellow-500/30 transition-colors">Ocupado</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input className="w-full bg-[#2d3247] p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-[#d9a94d]/30" placeholder="Digite sua mensagem..." />
                </div>
                <button className="w-11 h-11 bg-[#d9a94d] text-navy rounded-xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Toolbar de Ações (Narrow) */}
        <div className="w-14 border-l border-[#2d3247] flex flex-col items-center py-6 gap-5 bg-[#1a1d29] shrink-0">
          {[
            { icon: CheckCircle, label: "Finalizar" },
            { icon: Shuffle, label: "Transferir" },
            { icon: PeopleIcon, label: "Grupos" },
            { icon: Folder, label: "Arquivos" },
            { icon: Clock, label: "Histórico" },
            { icon: Calendar, label: "Agendar" },
            { icon: Zap, label: "Gatilhos" },
            { icon: Copy, label: "Copiar" },
            { icon: Printer, label: "Imprimir" },
          ].map((action, i) => (
            <button key={i} className="p-2.5 text-gray-500 hover:text-[#d9a94d] hover:bg-[#2d3247] rounded-xl transition-all group relative" title={action.label}>
              <action.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar-fina::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-fina::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-fina::-webkit-scrollbar-thumb {
          background: #2d3247;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
