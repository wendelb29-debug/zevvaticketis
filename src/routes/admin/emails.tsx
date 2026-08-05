import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmailAccounts, getEmailMessages, startGmailOAuth, sendEmail } from '@/lib/email/email.functions';
import { 
  Mail, 
  Inbox, 
  Send, 
  Star, 
  AlertCircle, 
  Trash2, 
  Archive, 
  Search, 
  Plus, 
  RefreshCw,
  ChevronRight,
  User,
  MoreVertical,
  ArrowLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/emails')({
  component: AdminEmailsPage,
});

function AdminEmailsPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['email_accounts'],
    queryFn: () => getEmailAccounts(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['email_messages', selectedAccountId, activeFolder, searchTerm],
    queryFn: () => getEmailMessages({ 
      data: { 
        accountId: selectedAccountId!, 
        folder: activeFolder,
        search: searchTerm
      } 
    }),
    enabled: !!selectedAccountId,
  });

  const connectMutation = useMutation({
    mutationFn: () => startGmailOAuth(),
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox },
    { id: 'sent', label: 'Enviados', icon: Send },
    { id: 'important', label: 'Importante', icon: Star },
    { id: 'spam', label: 'Spam', icon: AlertCircle },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
    { id: 'archive', label: 'Arquivo', icon: Archive },
  ];

  if (loadingAccounts) return <div className="p-10 text-center font-inter text-muted-fg">Carregando contas...</div>;

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-3xl border border-border shadow-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-manrope font-extrabold text-foreground mb-2">Gerenciar e-mails da plataforma</h2>
        <p className="text-muted-fg max-w-md mb-8 font-inter">
          Para gerenciar os e-mails da plataforma Zevva, conecte uma conta oficial do Gmail.
        </p>
        <button
          onClick={() => connectMutation.mutate()}
          className="flex items-center gap-3 px-8 py-4 bg-card border-2 border-border rounded-2xl font-extrabold text-foreground hover:bg-accent transition-all active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Conectar com Gmail
        </button>
      </div>
    );
  }

  // Si no hay cuenta seleccionada, seleccionamos la primera
  if (!selectedAccountId && Array.isArray(accounts) && accounts.length > 0) {
    const firstAccount = accounts[0] as any;
    setSelectedAccountId(firstAccount.id);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Accounts & Folders */}
        <div className="w-64 border-r border-border flex flex-col bg-accent/30">
          <div className="p-4 space-y-4">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Escrever
            </button>

            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedMessageId(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 flex items-center gap-3 rounded-xl text-sm font-extrabold transition-all",
                    activeFolder === folder.id 
                      ? "bg-card text-primary shadow-sm border border-border/50" 
                      : "text-muted-fg hover:bg-card/50 hover:text-foreground"
                  )}
                >
                  <folder.icon className="w-4 h-4" />
                  {folder.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-border bg-card/50">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg mb-3 px-2">Contas</h4>
            {accounts?.map((acc: any) => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={cn(
                  "w-full px-3 py-2 flex items-center gap-2 rounded-lg text-xs font-bold transition-all truncate",
                  selectedAccountId === acc.id ? "bg-primary/10 text-primary" : "text-muted-fg hover:bg-accent"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                {acc.email_address}
              </button>
            ))}
            <button 
              onClick={() => connectMutation.mutate()}
              className="w-full mt-3 px-3 py-2 flex items-center gap-2 rounded-lg text-xs font-extrabold text-muted-fg hover:text-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
              Adicionar conta
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="w-96 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
              <input
                type="text"
                placeholder="Buscar mensagens..."
                className="w-full pl-9 pr-4 py-2 bg-accent rounded-xl border-none text-sm focus:ring-2 focus:ring-primary/20 font-inter text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingMessages ? (
              <div className="p-10 text-center text-xs text-muted-fg font-inter">Buscando mensagens...</div>
            ) : !messages || messages.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted-fg font-inter">Nenhuma mensagem nesta pasta.</div>
            ) : (
              messages.map((msg: any) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={cn(
                    "w-full p-4 text-left border-b border-border/50 transition-all hover:bg-accent/30",
                    selectedMessageId === msg.id ? "bg-accent/50 border-l-4 border-l-primary" : "",
                    !msg.is_read ? "bg-primary/5" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn("text-sm truncate", !msg.is_read ? "font-extrabold text-foreground" : "font-bold text-muted-fg")}>
                      {msg.from_name || msg.from_email}
                    </span>
                    <span className="text-[10px] text-muted-fg font-inter">
                      {msg.received_at ? format(new Date(msg.received_at), 'dd MMM', { locale: ptBR }) : ''}
                    </span>
                  </div>
                  <h4 className={cn("text-xs truncate mb-1", !msg.is_read ? "font-extrabold text-foreground" : "font-medium text-foreground/70")}>
                    {msg.subject || '(Sem assunto)'}
                  </h4>
                  <p className="text-[11px] text-muted-fg line-clamp-2 font-inter leading-relaxed">
                    {msg.snippet}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Reading Panel */}
        <div className="flex-1 flex flex-col bg-accent/10">
          {selectedMessage ? (
            <>
              <div className="h-16 px-6 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-fg"><Star className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-fg"><Archive className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-fg"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-accent rounded-lg text-muted-fg"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-card">
                <div className="max-w-3xl mx-auto text-foreground">
                  <h1 className="text-2xl font-manrope font-extrabold mb-8 leading-tight">
                    {selectedMessage.subject}
                  </h1>

                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-primary uppercase">
                      {selectedMessage.from_name?.[0] || selectedMessage.from_email?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-extrabold">{selectedMessage.from_name}</h3>
                        <span className="text-xs text-muted-fg font-inter">
                          {selectedMessage.received_at ? format(new Date(selectedMessage.received_at), "eeee, d 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-fg font-inter">&lt;{selectedMessage.from_email}&gt;</p>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-foreground/80 font-inter leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.body_text || selectedMessage.snippet}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-accent/30 border-t border-border">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <button className="flex-1 py-3 bg-card border border-border rounded-xl text-sm font-extrabold text-foreground hover:bg-accent transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Responder
                  </button>
                  <button className="flex-1 py-3 bg-card border border-border rounded-xl text-sm font-extrabold text-foreground hover:bg-accent transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Encaminhar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mb-6 shadow-sm">
                <Mail className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-manrope font-extrabold text-foreground mb-2">Nenhuma mensagem selecionada</h3>
              <p className="text-sm text-muted-fg max-w-xs font-inter leading-relaxed">
                Selecione uma mensagem da lista ao lado para ler o conteúdo completo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between bg-accent/50">
              <h2 className="font-manrope font-extrabold text-foreground">Nova Mensagem</h2>
              <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-card rounded-xl transition-all"><X className="w-5 h-5 text-muted-fg" /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              toast.success("Simulação: E-mail enviado com sucesso!");
              setIsComposeOpen(false);
            }}>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 mb-2 block">Para</label>
                <input type="email" required className="w-full px-5 py-4 bg-accent rounded-2xl border-none text-sm font-inter focus:ring-2 focus:ring-primary/20 text-foreground" placeholder="exemplo@email.com" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 mb-2 block">Assunto</label>
                <input type="text" required className="w-full px-5 py-4 bg-accent rounded-2xl border-none text-sm font-inter focus:ring-2 focus:ring-primary/20 text-foreground" placeholder="Digite o assunto" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 mb-2 block">Mensagem</label>
                <textarea required className="w-full px-5 py-4 bg-accent rounded-2xl border-none text-sm font-inter focus:ring-2 focus:ring-primary/20 min-h-[200px] text-foreground" placeholder="Escreva sua mensagem aqui..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsComposeOpen(false)} className="px-6 py-3 font-extrabold text-muted-fg hover:text-foreground transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-3 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
