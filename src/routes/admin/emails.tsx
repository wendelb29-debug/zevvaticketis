import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getEmailIntegrations, 
  getIndividualEmailMessages, 
  startGmailOAuth, 
  disconnectGmail,
  sendIndividualEmail 
} from '@/lib/email/email.functions';
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
  X,
  LogOut,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin/emails')({
  component: AdminEmailsPage,
});

function AdminEmailsPage() {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const { data: integrations = [], isLoading: loadingIntegrations } = useQuery({
    queryKey: ['email_integrations'],
    queryFn: () => getEmailIntegrations(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['email_messages_individual', selectedIntegrationId, activeFolder, searchTerm],
    queryFn: () => getIndividualEmailMessages({ 
      data: { 
        integrationId: selectedIntegrationId!, 
        folder: activeFolder,
        search: searchTerm
      } 
    }),
    enabled: !!selectedIntegrationId,
  });

  const connectMutation = useMutation({
    mutationFn: () => startGmailOAuth(),
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => disconnectGmail({ data: { integrationId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_integrations'] });
      setSelectedIntegrationId(null);
      toast.success("Gmail desconectado com sucesso");
    }
  });

  const sendMutation = useMutation({
    mutationFn: (data: { to: string, subject: string, content: string }) => 
      sendIndividualEmail({ 
        data: { 
          integrationId: selectedIntegrationId!, 
          ...data 
        } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_messages_individual'] });
      setIsComposeOpen(false);
      toast.success("E-mail enviado com sucesso");
    }
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId);
  const activeIntegration = integrations.find(i => i.id === selectedIntegrationId);

  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox },
    { id: 'sent', label: 'Enviados', icon: Send },
    { id: 'important', label: 'Importante', icon: Star },
    { id: 'spam', label: 'Spam', icon: AlertCircle },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
    { id: 'archive', label: 'Arquivo', icon: Archive },
  ];

  if (loadingIntegrations) return <div className="p-10 text-center font-inter text-muted-fg animate-pulse">Carregando integrações...</div>;

  // Pantalla inicial si no hay cuenta conectada
  if (integrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 animate-in fade-in duration-700">
        <div className="bg-card p-12 rounded-[40px] border border-border shadow-xl max-w-xl w-full">
          <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-8 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
            <Mail className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-manrope font-extrabold text-foreground mb-4">Conecte seu e-mail</h2>
          <p className="text-muted-fg mb-10 font-inter leading-relaxed text-lg">
            Conecte sua conta Gmail para gerenciar seus e-mails dentro do Zevva de forma individual e segura.
          </p>
          <button
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-primary text-primary-foreground rounded-2xl font-extrabold text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6 rounded-full bg-white p-0.5" alt="Google" />
            Conectar Gmail
          </button>
          <p className="mt-8 text-xs text-muted-fg font-inter">
            Ao conectar, você concede acesso para ler e enviar e-mails através da plataforma.
          </p>
        </div>
      </div>
    );
  }

  // Auto-selecionar a primeira integração se nenhuma estiver selecionada
  if (!selectedIntegrationId && integrations && integrations.length > 0) {
    const firstIntegration = integrations[0];
    if (firstIntegration) {
      setSelectedIntegrationId(firstIntegration.id);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background font-inter animate-in fade-in duration-500">
      <div className="flex flex-1 overflow-hidden gap-6">
        
        {/* Sidebar Esquerda: Navegação e Contas */}
        <div className="w-72 flex flex-col gap-6 h-full overflow-hidden">
          
          {/* Status da Conta Conectada */}
          <div className="bg-card p-5 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Gmail conectado</span>
            </div>
            
            {activeIntegration && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  {activeIntegration.photo_url ? (
                    <img src={activeIntegration.photo_url} className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20" alt="Avatar" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-extrabold text-primary">
                      {activeIntegration?.display_name?.[0] || activeIntegration?.email_address?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="G" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-foreground truncate">{activeIntegration.display_name || 'Usuário Zevva'}</h4>
                  <p className="text-[11px] text-muted-fg truncate">{activeIntegration.email_address}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-border/50">
              <button 
                onClick={() => setSelectedMessageId(null)}
                className="text-[10px] font-extrabold text-muted-fg hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Atualizar
              </button>
              <button 
                onClick={() => activeIntegration && disconnectMutation.mutate(activeIntegration.id)}
                className="text-[10px] font-extrabold text-red-500/70 hover:text-red-500 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Desconectar
              </button>
            </div>
          </div>

          {/* Pastas */}
          <div className="bg-card flex-1 p-4 rounded-3xl border border-border shadow-sm overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mb-6 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Novo e-mail
            </button>

            <div className="space-y-1.5">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedMessageId(null);
                  }}
                  className={cn(
                    "w-full px-4 py-3.5 flex items-center justify-between rounded-2xl text-sm transition-all group",
                    activeFolder === folder.id 
                      ? "bg-primary/5 text-primary font-extrabold border border-primary/10" 
                      : "text-muted-fg font-bold hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <folder.icon className={cn("w-4 h-4", activeFolder === folder.id ? "text-primary" : "text-muted-fg group-hover:text-foreground")} />
                    {folder.label}
                  </div>
                  {activeFolder === folder.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listagem de Mensagens */}
        <div className="w-[420px] bg-card rounded-[32px] border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border bg-accent/10">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar mensagens..."
                className="w-full pl-11 pr-5 py-3.5 bg-background rounded-2xl border border-border/50 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-inter"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full p-10 gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-fg font-extrabold uppercase tracking-widest">Sincronizando...</span>
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-40">
                <Mail className="w-12 h-12 mb-4 text-muted-fg" />
                <p className="text-xs font-extrabold text-muted-fg uppercase tracking-widest">Caixa vazia</p>
              </div>
            ) : (
              messages.map((msg: any) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={cn(
                    "w-full p-5 text-left border-b border-border/50 transition-all hover:bg-primary/[0.02] relative",
                    selectedMessageId === msg.id ? "bg-primary/[0.04] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary" : "",
                    !msg.is_read ? "bg-background" : "opacity-70"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn("text-sm truncate max-w-[70%]", !msg.is_read ? "font-extrabold text-foreground" : "font-bold text-muted-fg")}>
                      {msg.from_name || msg.from_email}
                    </span>
                    <span className="text-[10px] font-extrabold text-muted-fg font-inter whitespace-nowrap">
                      {msg.received_at ? format(new Date(msg.received_at), 'HH:mm', { locale: ptBR }) : ''}
                    </span>
                  </div>
                  <h4 className={cn("text-xs truncate mb-2 leading-relaxed", !msg.is_read ? "font-extrabold text-foreground" : "font-semibold text-foreground/80")}>
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

        {/* Visualização da Mensagem */}
        <div className="flex-1 bg-card rounded-[32px] border border-border shadow-sm flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="h-20 px-8 border-b border-border bg-accent/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-2.5 hover:bg-background rounded-xl text-muted-fg transition-all hover:text-primary"><Star className="w-5 h-5" /></button>
                  <button className="p-2.5 hover:bg-background rounded-xl text-muted-fg transition-all hover:text-primary"><Archive className="w-5 h-5" /></button>
                  <button className="p-2.5 hover:bg-background rounded-xl text-muted-fg transition-all hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-extrabold text-muted-fg uppercase tracking-widest bg-background px-3 py-1.5 rounded-lg border border-border/50">
                    {activeFolder}
                  </span>
                  <button className="p-2.5 hover:bg-background rounded-xl text-muted-fg transition-all"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-3xl font-manrope font-extrabold text-foreground mb-10 leading-tight">
                    {selectedMessage.subject}
                  </h1>

                  <div className="flex items-center gap-5 mb-12 pb-8 border-b border-border/50">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-extrabold text-primary text-xl uppercase shadow-inner">
                      {selectedMessage.from_name?.[0] || selectedMessage.from_email?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-extrabold text-lg text-foreground truncate">{selectedMessage.from_name}</h3>
                        <span className="text-xs text-muted-fg font-inter font-medium">
                          {selectedMessage.received_at ? format(new Date(selectedMessage.received_at), "d 'de' MMMM, HH:mm", { locale: ptBR }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-fg font-inter font-semibold">&lt;{selectedMessage.from_email}&gt;</p>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <p className="text-[10px] text-primary font-extrabold uppercase tracking-widest">Para mim</p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-foreground/90 font-inter leading-loose text-base whitespace-pre-wrap">
                    {selectedMessage.body_text || selectedMessage.snippet}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-accent/10 border-t border-border mt-auto">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <button className="flex-1 py-4 bg-background border border-border rounded-2xl text-sm font-extrabold text-foreground hover:bg-accent hover:translate-y-[-2px] transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
                    <RefreshCw className="w-4 h-4 text-primary" /> Responder
                  </button>
                  <button className="flex-1 py-4 bg-background border border-border rounded-2xl text-sm font-extrabold text-foreground hover:bg-accent hover:translate-y-[-2px] transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
                    <Plus className="w-4 h-4 text-primary" /> Encaminhar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-in fade-in zoom-in duration-500">
              <div className="w-32 h-32 rounded-[40px] bg-accent/20 flex items-center justify-center mb-8 shadow-inner rotate-3">
                <Mail className="w-12 h-12 text-muted-fg/40" />
              </div>
              <h3 className="text-2xl font-manrope font-extrabold text-foreground mb-4">Selecione um e-mail</h3>
              <p className="text-base text-muted-fg max-w-xs font-inter leading-relaxed">
                Clique em uma mensagem na lista para visualizar o conteúdo completo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-card rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border border-t-8 border-t-primary">
            <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-manrope font-extrabold text-foreground">Escrever Mensagem</h2>
              </div>
              <button 
                onClick={() => setIsComposeOpen(false)} 
                className="p-3 hover:bg-accent rounded-2xl transition-all text-muted-fg hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form className="p-10 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              sendMutation.mutate({
                to: formData.get('to') as string,
                subject: formData.get('subject') as string,
                content: formData.get('content') as string,
              });
            }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-primary ml-1 block">De (Sua conta)</label>
                  <div className="w-full px-6 py-4 bg-accent/30 rounded-2xl border border-border/50 text-sm font-bold text-muted-fg flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {activeIntegration?.email_address}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 block">Para</label>
                  <input name="to" type="email" required className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold placeholder:font-normal" placeholder="exemplo@email.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 block">Assunto</label>
                <input name="subject" type="text" required className="w-full px-6 py-4 bg-background rounded-2xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold placeholder:font-normal" placeholder="Assunto da mensagem" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-fg ml-1 block">Mensagem</label>
                <textarea name="content" required className="w-full px-6 py-6 bg-background rounded-2xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium min-h-[250px] leading-relaxed custom-scrollbar" placeholder="Escreva seu conteúdo aqui..."></textarea>
              </div>
              
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                <p className="text-xs text-muted-fg font-inter italic flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" /> Sua mensagem será enviada via Gmail API oficial.
                </p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsComposeOpen(false)} className="px-8 py-4 font-extrabold text-muted-fg hover:text-foreground transition-all">Cancelar</button>
                  <button 
                    type="submit" 
                    disabled={sendMutation.isPending}
                    className="px-12 py-4 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                  >
                    {sendMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Enviar agora
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
