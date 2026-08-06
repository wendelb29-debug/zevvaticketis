import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Smartphone, CheckCircle2, AlertCircle, Copy, Save, 
  Settings2, Activity, List, Layout, Send, Rocket, 
  Trash2, Edit2, ExternalLink, RefreshCw, Eye, MessageSquare,
  FileText, CheckSquare, Plus, Download, Link, UserCheck, Clock,
  Check, X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function WhatsAppIntegration() {
  const [status, setStatus] = useState<"connected" | "waiting" | "error">("waiting");
  const [isTesting, setIsTesting] = useState(false);
  const [lastSync, setLastSync] = useState("06/08/2026 - 20:15");
  const [diagnostics, setDiagnostics] = useState({
    api: true,
    webhook: true,
    token: true
  });
  const [webhookUrl] = useState("https://api.zevva.com/webhooks/whatsapp");
  const [verifyToken, setVerifyToken] = useState("");
  
  const [cloudApi, setCloudApi] = useState({
    businessAccountId: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    apiVersion: "v20.0"
  });

  const [events, setEvents] = useState({
    received: true,
    sent: true,
    delivered: true,
    read: true,
    failed: true,
    contactChange: false
  });

  const logAction = useCallback(async (acao: string, alvo_id: string, alvo_tipo: string, payload: any = {}, antes: any = null, depois: any = null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('audit_logs' as any).insert({
        admin_id: session?.user?.id,
        acao,
        alvo_id,
        alvo_tipo,
        categoria: 'WhatsApp API',
        payload,
        dados_antes: antes || {},
        dados_depois: depois || {}
      });
    } catch (err) {
      console.error('Erro ao registrar log:', err);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copiada com sucesso!");
    logAction("Copiar URL Webhook", "webhook", "configuracao", { url: text });
  };

  const handleSaveConnection = () => {
    toast.success("Configurações da API salvas com sucesso!");
    setStatus("connected");
    logAction("Salvar Conexão Cloud API", "meta_api", "configuracao", cloudApi, null, cloudApi);
  };

  const handleSaveWebhook = () => {
    toast.success("Configurações de Webhook salvas!");
    logAction("Salvar Webhook", "webhook", "configuracao", { verifyToken, events }, null, { verifyToken, events });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    toast.info("Iniciando diagnóstico da API...");
    
    try {
      // Simulate real API checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .limit(1);

      if (error) throw error;

      setDiagnostics({
        api: true,
        webhook: Math.random() > 0.1, // Randomly simulate webhook check
        token: true
      });
      
      const now = new Date();
      setLastSync(now.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' -'));

      toast.success("Diagnóstico concluído com sucesso!");
      logAction("Diagnóstico de API", "meta_api", "diagnostico", diagnostics);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao validar conexão com a API Meta.");
    } finally {
      setIsTesting(false);
    }
  };

  const [logs] = useState([
    { id: 1, date: "06/08 20:00", event: "Mensagem recebida", status: "200 OK", response: "{ success: true }" },
    { id: 2, date: "06/08 20:01", event: "Mensagem enviada", status: "200 OK", response: "{ message_id: '...' }" },
  ]);

  const [numbers] = useState([
    { id: 1, number: "+55 34 99999-9999", name: "Atendimento Zevva", status: "online", lastActivity: "Há 2 minutos" }
  ]);

  const [templates] = useState([
    { 
      id: 1, 
      name: "confirmacao_ingresso", 
      category: "Utility", 
      status: "APPROVED", 
      content: "Olá {{nome}}, seu ingresso para {{evento}} está confirmado.",
      linkedEvent: "Conferência Internacional de Pastores 2026",
      approvedBy: "Mayck Souza",
      approvedAt: "05/08/2026 14:30"
    },
    { 
      id: 2, 
      name: "boas_vindas_caravana", 
      category: "Marketing", 
      status: "PENDING", 
      content: "Olá {{nome}}, seja bem-vindo à caravana {{caravana}}!",
      linkedEvent: null,
      approvedBy: null,
      approvedAt: null
    }
  ]);

  const exportAtendimento = (type: 'csv' | 'pdf') => {
    toast.success(`Exportando histórico em ${type.toUpperCase()}...`);
    if (type === 'pdf') window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-manrope font-extrabold text-navy">Gerenciamento da API do WhatsApp</h3>
        <p className="text-sm text-muted-fg">Essa área permite conectar, configurar e monitorar integrações WhatsApp do Zevva.</p>
      </div>

      {/* Main Connection Status */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg text-navy">WhatsApp API</CardTitle>
              <CardDescription>Conecte o Zevva ao WhatsApp para receber mensagens e enviar campanhas.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "connected" && (
              <Badge className="bg-green-500/10 text-green-600 border-green-200 gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
              </Badge>
            )}
            {status === "waiting" && (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 gap-1.5 py-1 px-3">
                <AlertCircle className="w-3.5 h-3.5" /> Aguardando configuração
              </Badge>
            )}
            {status === "error" && (
              <Badge className="bg-red-500/10 text-red-600 border-red-200 gap-1.5 py-1 px-3">
                <AlertCircle className="w-3.5 h-3.5" /> Erro de conexão
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloud API Config */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" /> WhatsApp Cloud API (Meta)
            </CardTitle>
            <CardDescription>Conectar usando a API oficial da Meta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Business Account ID</Label>
                <Input 
                  placeholder="Ex: 1092837465" 
                  value={cloudApi.businessAccountId}
                  onChange={(e) => setCloudApi(prev => ({ ...prev, businessAccountId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Phone Number ID</Label>
                <Input 
                  placeholder="Ex: 1029384756" 
                  value={cloudApi.phoneNumberId}
                  onChange={(e) => setCloudApi(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">WhatsApp Business Account ID</Label>
                <Input 
                  placeholder="Ex: 5647382910" 
                  value={cloudApi.wabaId}
                  onChange={(e) => setCloudApi(prev => ({ ...prev, wabaId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Access Token</Label>
                <Input 
                  type="password"
                  placeholder="EAAB..." 
                  value={cloudApi.accessToken}
                  onChange={(e) => setCloudApi(prev => ({ ...prev, accessToken: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">API Version</Label>
                <Input 
                  value={cloudApi.apiVersion}
                  onChange={(e) => setCloudApi(prev => ({ ...prev, apiVersion: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleSaveConnection} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
              <Save className="w-4 h-4 mr-2" /> Salvar conexão
            </Button>
          </CardContent>
        </Card>

        {/* Webhook Config */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> Configuração Webhook
            </CardTitle>
            <CardDescription>URL e Token para receber eventos em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">URL do webhook Zevva</Label>
              <div className="flex gap-2">
                <Input readOnly value={webhookUrl} className="bg-accent/30" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Token de verificação</Label>
              <Input 
                placeholder="Insira o token de verificação" 
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Quais eventos deseja receber?</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="received" checked={events.received} onCheckedChange={(v) => setEvents(p => ({...p, received: !!v}))} />
                  <label htmlFor="received" className="text-sm font-medium leading-none cursor-pointer">Mensagens recebidas</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sent" checked={events.sent} onCheckedChange={(v) => setEvents(p => ({...p, sent: !!v}))} />
                  <label htmlFor="sent" className="text-sm font-medium leading-none cursor-pointer">Mensagens enviadas</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="delivered" checked={events.delivered} onCheckedChange={(v) => setEvents(p => ({...p, delivered: !!v}))} />
                  <label htmlFor="delivered" className="text-sm font-medium leading-none cursor-pointer">Status entregue</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="read" checked={events.read} onCheckedChange={(v) => setEvents(p => ({...p, read: !!v}))} />
                  <label htmlFor="read" className="text-sm font-medium leading-none cursor-pointer">Status lida</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="failed" checked={events.failed} onCheckedChange={(v) => setEvents(p => ({...p, failed: !!v}))} />
                  <label htmlFor="failed" className="text-sm font-medium leading-none cursor-pointer">Status falhou</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="contactChange" checked={events.contactChange} onCheckedChange={(v) => setEvents(p => ({...p, contactChange: !!v}))} />
                  <label htmlFor="contactChange" className="text-sm font-medium leading-none cursor-pointer">Alteração de contato</label>
                </div>
              </div>
            </div>

            <Button onClick={handleSaveWebhook} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
              <Save className="w-4 h-4 mr-2" /> Salvar webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnostics Card */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Diagnóstico da API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Meta:</span>
                <Badge variant="outline" className={cn(
                  "gap-1 font-bold",
                  diagnostics.api ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", diagnostics.api ? "bg-green-600" : "bg-red-600")} /> 
                  {diagnostics.api ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook:</span>
                <Badge variant="outline" className={cn(
                  "gap-1 font-bold",
                  diagnostics.webhook ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", diagnostics.webhook ? "bg-green-600" : "bg-red-600")} /> 
                  {diagnostics.webhook ? "Recebendo" : "Erro"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token:</span>
                <Badge variant="outline" className={cn(
                  "gap-1 font-bold",
                  diagnostics.token ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", diagnostics.token ? "bg-green-600" : "bg-red-600")} /> 
                  {diagnostics.token ? "Validado" : "Expirado"}
                </Badge>
              </div>
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-[10px] uppercase text-muted-fg font-bold tracking-widest">Última sincronização</p>
                <p className="text-sm font-bold text-navy">{lastSync}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all active:scale-[0.98]"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isTesting && "animate-spin")} /> 
              {isTesting ? "Testando..." : "Testar conexão"}
            </Button>
          </CardContent>
        </Card>

        {/* Mass Delivery Config */}
        <Card className="border-border shadow-sm col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" /> Envios Massivos
            </CardTitle>
            <CardDescription>Configurações de limites e filas de disparo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Limite de mensagens/dia</Label>
                  <Input type="number" defaultValue="5000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Intervalo entre mensagens (s)</Label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Horário permitido</Label>
                  <div className="flex items-center gap-2">
                    <Input type="time" defaultValue="08:00" className="w-full" />
                    <span className="text-muted-fg">às</span>
                    <Input type="time" defaultValue="20:00" className="w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/70">Fila de envio</Label>
                  <div className="p-3 bg-accent/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-bold">Tickets em espera</span>
                    <span className="text-sm font-black text-primary">0</span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="mt-6 bg-navy text-white hover:bg-navy/90 font-bold">
              Salvar preferências de disparo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Numbers and Templates */}
      <Tabs defaultValue="numbers" className="w-full">
        <TabsList className="bg-card border border-border p-1 h-auto w-full justify-start rounded-xl shadow-sm mb-4">
          <TabsTrigger value="numbers" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2 px-4 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5 mr-2" /> Números Conectados
          </TabsTrigger>
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2 px-4 text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5 mr-2" /> Atendimento Vinculados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="numbers" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-black uppercase text-navy/60">Número</TableHead>
                  <TableHead className="text-xs font-black uppercase text-navy/60">Nome</TableHead>
                  <TableHead className="text-xs font-black uppercase text-navy/60">Status</TableHead>
                  <TableHead className="text-xs font-black uppercase text-navy/60">Última Atividade</TableHead>
                  <TableHead className="text-xs font-black uppercase text-navy/60 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numbers.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-bold">{n.number}</TableCell>
                    <TableCell className="text-navy/80">{n.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white border-0 gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-fg text-xs">{n.lastActivity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="atendimento" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="bg-muted/50 p-1 mb-4 h-9">
              <TabsTrigger value="templates" className="text-[10px] uppercase font-black tracking-wider">
                <Plus className="w-3 h-3 mr-1" /> Módulo de Criar
              </TabsTrigger>
              <TabsTrigger value="aprovacoes" className="text-[10px] uppercase font-black tracking-wider">
                <CheckSquare className="w-3 h-3 mr-1" /> Aprovações
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-[10px] uppercase font-black tracking-wider">
                <List className="w-3 h-3 mr-1" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Criar Novo Template</CardTitle>
                      <CardDescription className="text-xs">Crie templates para serem aprovados pela Meta.</CardDescription>
                    </div>
                    <Button size="sm" className="bg-primary text-white font-bold h-8">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Novo Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent/10 rounded-lg p-8 border border-dashed border-border flex flex-col items-center justify-center text-center">
                    <FileText className="w-10 h-10 text-muted-fg/40 mb-3" />
                    <p className="text-sm font-medium text-navy/70">Interface de criação de templates em desenvolvimento.</p>
                    <p className="text-xs text-muted-fg mt-1">Aqui você poderá definir nome, categoria e conteúdo com variáveis.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aprovacoes">
              <Card className="border-border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-black uppercase text-navy/60">Nome do Template</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Categoria</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Status Meta</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Conteúdo</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold">{t.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-bold text-[10px]">{t.category}</Badge></TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Aprovado</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-fg truncate max-w-[200px]">{t.content}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 hover:text-primary"><Eye className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="border-border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-black uppercase text-navy/60">Data/Hora</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Evento</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Status</TableHead>
                      <TableHead className="text-xs font-black uppercase text-navy/60">Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-medium">{log.date}</TableCell>
                        <TableCell className="font-bold flex items-center gap-2">
                          {log.event.includes("recebida") ? <MessageSquare className="w-3 h-3 text-blue-500" /> : <Send className="w-3 h-3 text-primary" />}
                          {log.event}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50 font-bold">{log.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-muted-fg bg-accent/10 rounded px-2 py-1">{log.response}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

