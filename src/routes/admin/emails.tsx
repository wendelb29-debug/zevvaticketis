import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGmailStatus,
  startGmailConnect,
  listGmailMessages,
  sendGmailMessage,
  disconnectGmailAccount,
} from '@/lib/gmail/gmail.functions';
import {
  Mail, Inbox, Send, Star, Search, RefreshCw, LogOut, ShieldCheck,
  PenSquare, Loader2, AlertCircle, FileWarning,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/admin/emails')({
  component: AdminEmailsPage,
  head: () => ({
    meta: [
      { title: 'E-mails — Zevva Admin' },
      { name: 'description', content: 'Conecte sua conta Gmail pessoal e gerencie seus e-mails dentro do Zevva Admin.' },
      { property: 'og:title', content: 'E-mails — Zevva Admin' },
      { property: 'og:description', content: 'Caixa de entrada individual e privada por usuário no Zevva Admin.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
});

const FOLDERS = [
  { id: 'INBOX', label: 'Caixa de entrada', icon: Inbox },
  { id: 'SENT', label: 'Enviados', icon: Send },
  { id: 'STARRED', label: 'Favoritos', icon: Star },
  { id: 'SPAM', label: 'Spam', icon: FileWarning },
];

function waitForOAuthCompletion(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== 'google_mail' ||
        (type !== 'appUserConnectorOAuthComplete' && type !== 'appUserConnectorOAuthFailed')
      ) return;
      cleanup();
      if (type === 'appUserConnectorOAuthComplete') { resolve(); return; }
      popup.close();
      reject(new Error('A conexão com o Google falhou.'));
    };
    window.addEventListener('message', onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error('Janela fechada antes de concluir a autorização.'));
    }, 500);
  });
}

function AdminEmailsPage() {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState('INBOX');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['gmail', 'status'],
    queryFn: () => getGmailStatus(),
  });
  const connected = statusQuery.data?.connected === true;

  const messagesQuery = useQuery({
    queryKey: ['gmail', 'messages', folder, search],
    queryFn: () => listGmailMessages({ data: { labelId: folder, q: search || undefined, maxResults: 20 } }),
    enabled: connected,
  });

  const connect = async () => {
    setConnecting(true);
    const popup = window.open('', 'zevva-gmail-oauth', 'width=600,height=720');
    if (!popup) {
      setConnecting(false);
      toast.error('Pop-up bloqueado. Libere pop-ups e tente novamente.');
      return;
    }
    try {
      const { authorizationUrl } = await startGmailConnect();
      const completion = waitForOAuthCompletion(popup);
      popup.location.href = authorizationUrl;
      await completion;
      await queryClient.invalidateQueries({ queryKey: ['gmail'] });
      toast.success('Gmail conectado com sucesso!');
    } catch (e: any) {
      popup.close();
      console.error("[Gmail OAuth]", e);
      toast.error('Não foi possível conectar seu Gmail. Verifique as permissões da conta Google.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectGmailAccount(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gmail'] });
      setSelectedId(null);
      toast.success('Conta desconectada.');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Falha ao desconectar.'),
  });

  if (statusQuery.isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Conecte seu Gmail</h1>
          <p className="mt-3 text-sm text-muted-foreground-foreground">
            Cada usuário conecta a própria conta Google. Suas mensagens são privadas — nenhum
            outro usuário do Zevva tem acesso à sua caixa de entrada.
          </p>
          <Button className="mt-8 w-full" size="lg" onClick={connect} disabled={connecting}>
            {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Conectar com o Google
          </Button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Autorização OAuth 2.0 segura — você pode desconectar quando quiser.
          </p>
        </div>
      </div>
    );
  }

  const messages = messagesQuery.data ?? [];
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 p-4">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col rounded-xl border border-border bg-card p-3">
        <Button className="mb-4 w-full" onClick={() => setComposeOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" /> Escrever
        </Button>
        <nav className="space-y-1">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFolder(f.id); setSelectedId(null); }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                folder === f.id
                  ? 'border border-primary/40 font-semibold text-foreground'
                  : 'text-muted-foreground-foreground hover:bg-primary/5',
              )}
            >
              <f.icon className="h-4 w-4" /> {f.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-3">
          <p className="truncate text-xs font-medium text-foreground">{statusQuery.data?.email ?? 'Conta conectada'}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-destructive hover:text-destructive"
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" /> Desconectar conta
          </Button>
        </div>
      </aside>

      {/* List */}
      <section className="flex w-[26rem] shrink-0 flex-col rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar e-mails"
              className="pl-9"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => messagesQuery.refetch()}>
            <RefreshCw className={cn('h-4 w-4', messagesQuery.isFetching && 'animate-spin')} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messagesQuery.isLoading && (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          )}
          {messagesQuery.isError && (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-destructive">
              <AlertCircle className="h-5 w-5" />
              {(messagesQuery.error as Error)?.message}
            </div>
          )}
          {!messagesQuery.isLoading && messages.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground-foreground">Nenhuma mensagem aqui.</p>
          )}
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={cn(
                'block w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-primary/5',
                selectedId === m.id && 'bg-primary/5',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn('truncate text-sm', m.unread ? 'font-bold text-foreground' : 'text-foreground')}>
                  {m.from}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground-foreground">
                  {m.date ? new Date(m.date).toLocaleDateString('pt-BR') : ''}
                </span>
              </div>
              <p className="truncate text-sm text-foreground">{m.subject}</p>
              <p className="truncate text-xs text-muted-foreground-foreground">{m.snippet}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Reader */}
      <section className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-6">
        {selected ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{selected.subject}</h2>
            <div className="text-sm text-muted-foreground-foreground">
              <p><span className="font-medium text-foreground">De:</span> {selected.from}</p>
              <p><span className="font-medium text-foreground">Para:</span> {selected.to}</p>
              <p>{selected.date}</p>
            </div>
            <p className="whitespace-pre-wrap border-t border-border pt-4 text-sm text-foreground">
              {selected.snippet}
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground-foreground">
            <Mail className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Selecione um e-mail para ler</p>
          </div>
        )}
      </section>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  );
}

function ComposeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const sendMutation = useMutation({
    mutationFn: () => sendGmailMessage({ data: { to, subject, body } }),
    onSuccess: () => {
      toast.success('E-mail enviado.');
      setTo(''); setSubject(''); setBody('');
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Falha ao enviar e-mail.'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo e-mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Para" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea rows={10} placeholder="Escreva sua mensagem…" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => sendMutation.mutate()} disabled={!to || sendMutation.isPending}>
            {sendMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
