import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhatsAppContacts, sendWhatsAppMessage } from '@/lib/whatsapp/whatsapp.functions';
import { Search, Send, User, Check, CheckCheck, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Route = createFileRoute('/admin/chat')({
  component: AdminChatPage,
});

function AdminChatPage() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['whatsapp_contacts'],
    queryFn: () => getWhatsAppContacts(),
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['whatsapp_messages', selectedContactId],
    queryFn: async () => {
      if (!selectedContactId) return [];
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('contact_id', selectedContactId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedContactId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedContact || !messageText.trim()) return;
      return sendWhatsAppMessage({
        data: {
          contactId: selectedContact.id,
          phone: selectedContact.phone,
          text: messageText
        }
      });
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['whatsapp_messages', selectedContactId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp_contacts'] });
    }
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['whatsapp_messages'] });
          queryClient.invalidateQueries({ queryKey: ['whatsapp_contacts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden border border-line shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-line flex flex-col bg-surface-2/30">
          <div className="p-4 border-b border-line bg-white">
            <h1 className="text-xl font-manrope font-extrabold text-navy mb-4">Chat WhatsApp</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
              <input
                type="text"
                placeholder="Buscar contatos..."
                className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border-none text-sm focus:ring-2 focus:ring-coral/20 font-inter"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingContacts ? (
              <div className="p-8 text-center text-sm text-navy/40">Carregando contatos...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-sm text-navy/40">Nenhum contato encontrado.</div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 border-b border-line/50 transition-colors hover:bg-white",
                    selectedContactId === contact.id ? "bg-white border-l-4 border-l-coral" : ""
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-coral" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-extrabold text-navy truncate">{contact.name || contact.phone}</h3>
                      {contact.last_interaction_at && (
                        <span className="text-[10px] text-navy/40">
                          {format(new Date(contact.last_interaction_at), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-navy/60 truncate font-inter">
                      {contact.whatsapp_messages?.[0]?.content || contact.phone}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="h-16 px-6 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-coral" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-navy">{selectedContact.name || selectedContact.phone}</h2>
                    <p className="text-xs text-navy/40 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedContact.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-2/20 custom-scrollbar">
                {loadingMessages ? (
                  <div className="text-center text-sm text-navy/40">Carregando mensagens...</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full",
                        msg.direction === 'outbound' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-inter shadow-sm",
                          msg.direction === 'outbound' 
                            ? "bg-coral text-white rounded-tr-none" 
                            : "bg-white border border-line text-navy rounded-tl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-1 mt-1 text-[10px]",
                          msg.direction === 'outbound' ? "text-white/70" : "text-navy/40"
                        )}>
                          {format(new Date(msg.created_at!), 'HH:mm')}
                          {msg.direction === 'outbound' && (
                            msg.status === 'delivered' || msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-line">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageMutation.mutate();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 bg-surface rounded-2xl border-none text-sm focus:ring-2 focus:ring-coral/20 font-inter"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    type="submit"
                    className="w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-navy/40">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-extrabold text-navy">Selecione um contato</h3>
              <p className="max-w-xs text-sm font-inter">Escolha um contato da lista à esquerda para iniciar ou continuar uma conversa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
