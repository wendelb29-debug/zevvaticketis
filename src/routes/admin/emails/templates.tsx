import * as React from 'react';
import { SignupEmail } from '@/lib/email-templates/signup';
import { RecoveryEmail } from '@/lib/email-templates/recovery';
import { InviteEmail } from '@/lib/email-templates/invite';
import { MagicLinkEmail } from '@/lib/email-templates/magic-link';
import { EmailChangeEmail } from '@/lib/email-templates/email-change';
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication';
import { render } from '@react-email/render';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Monitor, Smartphone, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_PROJECT_URL = "https://zevvaticketis.lovable.app";

const TEMPLATES = [
  {
    id: 'signup',
    name: 'Confirmação de Inscrição',
    subject: 'Confirme seu e-mail para acessar a Zevva',
    component: SignupEmail,
    props: { confirmationUrl: `${SAMPLE_PROJECT_URL}/auth/callback?type=signup` },
    variable: '{{ .ConfirmationURL }}'
  },
  {
    id: 'recovery',
    name: 'Redefinição de Senha',
    subject: 'Redefina sua senha da Zevva',
    component: RecoveryEmail,
    props: { confirmationUrl: `${SAMPLE_PROJECT_URL}/auth/callback?type=recovery` },
    variable: '{{ .ConfirmationURL }}'
  },
  {
    id: 'invite',
    name: 'Convite',
    subject: 'Você recebeu um convite para acessar a Zevva',
    component: InviteEmail,
    props: { 
      confirmationUrl: `${SAMPLE_PROJECT_URL}/auth/callback?type=invite`,
      organizationName: 'Organização Exemplo',
      invitedBy: 'João Silva',
      role: 'Produtor'
    },
    variable: '{{ .ConfirmationURL }}'
  },
  {
    id: 'magiclink',
    name: 'Link Mágico',
    subject: 'Seu acesso seguro à Zevva',
    component: MagicLinkEmail,
    props: { confirmationUrl: `${SAMPLE_PROJECT_URL}/auth/callback?type=magiclink` },
    variable: '{{ .ConfirmationURL }}'
  },
  {
    id: 'email_change',
    name: 'Alteração de E-mail',
    subject: 'Confirme a alteração do seu e-mail na Zevva',
    component: EmailChangeEmail,
    props: { 
      newEmail: 'novo@email.com',
      confirmationUrl: `${SAMPLE_PROJECT_URL}/auth/callback?type=email_change` 
    },
    variable: '{{ .ConfirmationURL }}, {{ .NewEmail }}'
  },
  {
    id: 'reauthentication',
    name: 'Reautenticação',
    subject: 'Código de segurança da Zevva',
    component: ReauthenticationEmail,
    props: { token: '123456' },
    variable: '{{ .Token }}'
  }
];

export default function EmailTemplatesPreview() {
  const [activeTab, setActiveTab] = React.useState('signup');
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [htmls, setHtmls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const generateAll = async () => {
      const results: Record<string, string> = {};
      for (const t of TEMPLATES) {
        results[t.id] = await render(React.createElement(t.component, t.props));
      }
      setHtmls(results);
    };
    generateAll();
  }, []);

  const currentTemplate = TEMPLATES.find(t => t.id === activeTab)!;
  const currentHtml = htmls[activeTab] || '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de E-mail</h1>
          <p className="text-muted-foreground">Pré-visualização e exportação dos e-mails oficiais de autenticação Zevva.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'desktop' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="w-4 h-4 mr-2" /> Desktop
          </Button>
          <Button 
            variant={viewMode === 'mobile' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-2" /> Mobile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Modelos</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col gap-1">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === t.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuração Supabase</CardTitle>
              <CardDescription className="text-xs">
                Copie os campos abaixo para o painel do Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">Assunto</label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 bg-muted p-2 rounded text-xs truncate">{currentTemplate.subject}</code>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(currentTemplate.subject)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">Variáveis</label>
                <div className="mt-1">
                  <code className="bg-muted p-2 rounded text-xs block">{currentTemplate.variable}</code>
                </div>
              </div>
              <Button className="w-full" onClick={() => copyToClipboard(currentHtml)}>
                <Copy className="w-4 h-4 mr-2" /> Copiar HTML
              </Button>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{currentTemplate.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Responsivo
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> CSS Inline
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 bg-gray-100 flex justify-center overflow-auto py-8">
              <div 
                className={`bg-white shadow-xl transition-all duration-300 overflow-hidden ${
                  viewMode === 'mobile' ? 'w-[375px]' : 'w-[600px]'
                }`}
                style={{ height: 'fit-content', minHeight: '600px' }}
              >
                <iframe 
                  srcDoc={currentHtml} 
                  className="w-full h-full border-none" 
                  style={{ minHeight: '800px' }}
                  title="Email Preview"
                />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
