import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhatsAppContacts, sendWhatsAppMessage } from '@/lib/whatsapp/whatsapp.functions';
import { Search, Send, User, Check, CheckCheck, Phone, Plus, Bell, ChevronDown, MoreVertical, CheckCircle, Shuffle, Users as PeopleIcon, Folder, Clock, Calendar, Zap, Copy, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const Route = createFileRoute('/admin/chat')({
  component: AdminChatPage,
});

function AdminChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col h-screen bg-[#1a1d29] text-white overflow-hidden">
      {/* Fixed Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#2d3247] bg-[#1a1d29]">
        <div className="flex items-center gap-6">
          <div className="font-extrabold text-xl tracking-tighter">ez.<span className="text-[#d9a94d]">chat</span></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3247] rounded-full text-xs font-bold">
            <User className="w-3 h-3" /> Atendimentos
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gray-600" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1d29]" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Coluna 1: Lista de Conversas (410px) */}
        <div className="w-[410px] border-r border-[#2d3247] flex flex-col bg-[#1a1d29]">
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-xs font-bold bg-[#d9a94d] text-navy rounded-full">Em Atendimento</button>
              <button className="flex-1 py-2 text-xs font-bold bg-[#2d3247] text-gray-400 rounded-full">Em Espera</button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="w-full pl-9 pr-4 py-2 bg-[#2d3247] rounded-full text-xs" placeholder="Buscar atendimentos..." />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#d9a94d] rounded-full flex items-center justify-center text-navy font-bold">+</button>
            </div>
          </div>
          {/* List would go here */}
        </div>

        {/* Coluna 2: Thread da Conversa */}
        <div className="flex-1 flex flex-col bg-[#161924]">
          <div className="h-16 border-b border-[#2d3247] flex items-center px-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-coral/20" />
              <div>
                <div className="font-bold">João Silva</div>
                <div className="text-[10px] text-gray-400">Protocolo: #123456</div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Messages would go here */}
          </div>
          <div className="p-4 border-t border-[#2d3247]">
            <input className="w-full bg-[#2d3247] p-3 rounded-xl text-sm" placeholder="Digite sua mensagem..." />
          </div>
        </div>

        {/* Coluna 3: Toolbar de Ações */}
        <div className="w-16 border-l border-[#2d3247] flex flex-col items-center py-6 gap-6">
          <CheckCircle className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Shuffle className="w-5 h-5 text-gray-400 cursor-pointer" />
          <PeopleIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Folder className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Clock className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Calendar className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Zap className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Copy className="w-5 h-5 text-gray-400 cursor-pointer" />
          <Printer className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
