import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Users, Settings, Shield, Clock, Tag, MessageSquare, Workflow, Plus, 
  Edit2, Trash2, X, Zap, Ticket, Calendar, Globe, Bell, 
  Layers, Lock, Database, Smartphone, Sliders, Search, ListChecks, History, PieChart, 
  CreditCard, ShieldCheck, Mail, AlertTriangle, Scale, Hammer, Box
} from "lucide-react";

import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { AuditoriaPanel } from "@/components/admin/AuditoriaPanel";
import { WhatsAppIntegration } from "@/components/admin/WhatsAppIntegration";
import { useQuery } from "@tanstack/react-query";
import { PermissionsRolesManager } from "@/components/admin/PermissionsRolesManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


export const Route = createFileRoute("/admin/configuracoes")({
  component: AuthGuard,
});

function AuthGuard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data: member } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .maybeSingle();
        
        if (member) setActiveTenantId(member.tenant_id);
      }
      
      setLoading(false);
      if (!session) navigate({ to: "/" });
    }
    
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) navigate({ to: "/" });
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return null;
  return <SettingsPage session={session} activeTenantId={activeTenantId} />;
}

type Dept = { id: string; name: string; members: number; status: "ativo" | "inativo"; department_id: string };
type DeptFull = Dept & { agents: string[]; restrictions: string[] };

type QueueStatus = {
  id: string;
  name: string;
  in_service: number;
  pending: number;
  completed: number;
};



function OptionRadio({
  label, hint, selected, onSelect,
}: { label: string; hint?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={hint}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
          : "border-border bg-background hover:border-primary/40"
      )}
    >
      <span className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
        selected ? "border-primary" : "border-muted-fg"
      )}>
        {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function DistribuicaoConversas({ departments }: { departments: Dept[] }) {
  const [modoEntrega, setModoEntrega] = useState("automatica");
  const [tipoDistribuicao, setTipoDistribuicao] = useState("circular");
  const [porCiclo, setPorCiclo] = useState("10");
  const [ultimoAtendente, setUltimoAtendente] = useState(true);
  const [tentativas, setTentativas] = useState("1");
  const [limitarReceptivos, setLimitarReceptivos] = useState(true);
  const [maxReceptivos, setMaxReceptivos] = useState("10");
  const [limitarAtivos, setLimitarAtivos] = useState(false);
  const [maxAtivos, setMaxAtivos] = useState("0");
  const [porFila, setPorFila] = useState(true);
  const [filaLimites, setFilaLimites] = useState<Record<string, string>>(
    Object.fromEntries(departments.map((d) => [d.id, "5"]))
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/50 p-5 space-y-5">
        <div className="flex items-start gap-3">
          <Workflow className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-bold">Distribuição de conversas</p>
            <p className="text-xs text-muted-foreground">Como as conversas são entregues e distribuídas entre os agentes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Modo de entrega de conversas</Label>
            <OptionRadio label="Forçar aceitação automática" selected={modoEntrega === "automatica"} onSelect={() => setModoEntrega("automatica")} />
            <OptionRadio label="Permitir aceite/recusa" selected={modoEntrega === "aceite"} onSelect={() => setModoEntrega("aceite")} />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Tipo de distribuição por usuário</Label>
            <OptionRadio label="Circular" selected={tipoDistribuicao === "circular"} onSelect={() => setTipoDistribuicao("circular")} />
            <OptionRadio label="Igualitária" selected={tipoDistribuicao === "igualitaria"} onSelect={() => setTipoDistribuicao("igualitaria")} />
            <OptionRadio label="Por disponibilidade" selected={tipoDistribuicao === "disponibilidade"} onSelect={() => setTipoDistribuicao("disponibilidade")} />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Conversas por ciclo de distribuição</Label>
            <Input type="number" value={porCiclo} onChange={(e) => setPorCiclo(e.target.value)} className="bg-background border-border" />
            <p className="text-xs text-muted-foreground">Máximo de conversas que um agente pode receber a cada ciclo. Evita sobrecarga quando há muitas conversas acumuladas no departamento.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Último atendente</Label>
              <Switch checked={ultimoAtendente} onCheckedChange={setUltimoAtendente} />
            </div>
            {ultimoAtendente && (
              <>
                <Input type="number" value={tentativas} onChange={(e) => setTentativas(e.target.value)} className="bg-background border-border" />
                <p className="text-xs text-muted-foreground">Número de tentativas antes de distribuir normalmente.</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-background p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">Limitar conversas receptivas</p>
                <p className="text-xs text-muted-foreground">Limite de conversas que o agente pode receber por vez, distribuídas automaticamente.</p>
              </div>
              <Switch checked={limitarReceptivos} onCheckedChange={setLimitarReceptivos} />
            </div>
            {limitarReceptivos && (
              <div className="rounded-xl border border-border p-4 space-y-2">
                <Label className="font-bold">Máximo por agente <span className="text-primary">*</span></Label>
                <Input type="number" value={maxReceptivos} onChange={(e) => setMaxReceptivos(e.target.value)} className="bg-background border-border max-w-[220px]" />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">Limitar conversas ativas</p>
                <p className="text-xs text-muted-foreground">Número máximo de conversas ativas (iniciadas pelo agente) por agente.</p>
              </div>
              <Switch checked={limitarAtivos} onCheckedChange={setLimitarAtivos} />
            </div>
            {limitarAtivos && (
              <div className="rounded-xl border border-border p-4 space-y-2">
                <Label className="font-bold">Máximo por agente (0 = ilimitado) <span className="text-primary">*</span></Label>
                <Input type="number" value={maxAtivos} onChange={(e) => setMaxAtivos(e.target.value)} className="bg-background border-border max-w-[220px]" />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold">Separar limites por fila de departamento</p>
              <p className="text-xs text-muted-foreground">Define um limite de conversas simultâneas específico para cada fila.</p>
            </div>
            <Switch checked={porFila} onCheckedChange={setPorFila} />
          </div>
          {porFila && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {departments.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.members} agentes na fila</p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={filaLimites[d.id] ?? "0"}
                    onChange={(e) => setFilaLimites((p) => ({ ...p, [d.id]: e.target.value }))}
                    className="bg-background border-border w-24"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Configurações de distribuição salvas")} className="bg-primary text-primary-foreground font-bold">
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuditoriaTab() {
  return <AuditoriaPanel />;
}


function SettingsPage({ session, activeTenantId }: { session: any, activeTenantId: string | null }) {
  const search = useSearch({ from: "/admin/configuracoes" }) as any;
  const [activeTab, setActiveTab] = useState(search?.tab || "atendimento");

  useEffect(() => {
    if (search?.tab) {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptAgents, setDeptAgents] = useState<string[]>([]);
  const [deptRestrictions, setDeptRestrictions] = useState<string[]>([]);
  const [agentSearch, setAgentSearch] = useState("");
  const [restrictSearch, setRestrictSearch] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#E8604A");

  const [agents] = useState([
    { id: "u1", name: "Alice Vieira", email: "alicevieirai214@gmail.com" },
    { id: "u2", name: "Bárbara Carvalho", email: "barbara864carvalho@gmail.com" },
    { id: "u3", name: "Carolina Silva", email: "carol.12godinho@gmail.com" },
    { id: "u4", name: "Daiane Silva", email: "daiane@zevva.com" },
    { id: "u5", name: "Eduardo Lima", email: "edulima27.eh@gmail.com" },
    { id: "u6", name: "Mayck Souza", email: "mayck@zevva.com" },
  ]);

  const [departments, setDepartments] = useState<DeptFull[]>([
    { id: "1", name: "Suporte", members: 5, agents: ["u1", "u3"], restrictions: [], status: "ativo", department_id: "1" },
    { id: "2", name: "Comercial", members: 3, agents: ["u6"], restrictions: [], status: "ativo", department_id: "2" },
  ]);

  const [queueStatus] = useState<QueueStatus[]>([
    { id: "1", name: "Suporte", in_service: 12, pending: 5, completed: 45 },
    { id: "2", name: "Comercial", in_service: 8, pending: 2, completed: 30 },
  ]);

  const [notificarMudancasFila, setNotificarMudancasFila] = useState(true);
  const [notificarCanal, setNotificarCanal] = useState("whatsapp");
  const [templateNotificacao, setTemplateNotificacao] = useState("Olá {agente}, houve uma mudança na fila {fila}. Status anterior: {status_anterior} -> Novo status: {status_atual} em {data_mudanca}");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("Alice Vieira");
  const [notificacoesHistory, setNotificacoesHistory] = useState([
    { id: "TRY-7782", target: "Alice Vieira", canal: "WhatsApp", data: "2026-08-06 14:20", evento: "Mudança de Status: Suporte", status: "enviado", motivo: "", fila: "Suporte", resposta: "Meta API: Message delivered" },
    { id: "TRY-7783", target: "Mayck Souza", canal: "E-mail", data: "2026-08-06 15:10", evento: "Novo Agente: Comercial", status: "falhou", motivo: "Servidor SMTP indisponível", fila: "Comercial", resposta: "550 5.1.1 The email account that you tried to reach does not exist" },
    { id: "TRY-7784", target: "Carolina Silva", canal: "WhatsApp", data: "2026-08-06 15:45", evento: "Mudança de Fila: Suporte", status: "em processamento", motivo: "", fila: "Suporte", resposta: "Pending callback from Meta" },
  ]);

  const [historyFilter, setHistoryFilter] = useState({
    search: "",
    status: "todos",
    canal: "todos",
    fila: "todos"
  });






  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(agentSearch.toLowerCase())
  );
  const filteredRestrictDepts = departments.filter(
    (d) => d.id !== editingDeptId && d.name.toLowerCase().includes(restrictSearch.toLowerCase())
  );

  const resetDeptForm = () => {
    setDeptName("");
    setEditingDeptId(null);
    setDeptAgents([]);
    setDeptRestrictions([]);
    setAgentSearch("");
    setRestrictSearch("");
  };

  const openNewDept = () => {
    resetDeptForm();
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: DeptFull) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptAgents(dept.agents);
    setDeptRestrictions(dept.restrictions);
    setAgentSearch("");
    setRestrictSearch("");
    setIsDeptModalOpen(true);
  };

  const removeDept = (id: string) => {
    setDepartments((prev) =>
      prev
        .filter((d) => d.id !== id)
        .map((d) => ({ ...d, restrictions: d.restrictions.filter((r) => r !== id) }))
    );
    toast.success("Departamento removido.");
  };

  const saveDept = () => {
    if (!deptName.trim()) return;
    const action = editingDeptId ? "QUEUE_UPDATE" : "QUEUE_CREATE";
    
    if (editingDeptId) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDeptId
            ? { ...d, name: deptName.trim(), agents: deptAgents, restrictions: deptRestrictions, members: deptAgents.length }
            : d
        )
      );
      toast.success("Fila de atendimento atualizada!");
    } else {
      const newId = crypto.randomUUID();
      const newQueue = {
        id: newId,
        name: deptName.trim(),
        members: deptAgents.length,
        agents: deptAgents,
        restrictions: deptRestrictions,
        status: "ativo" as const,
        department_id: newId
      };
      setDepartments((prev) => [...prev, newQueue]);
      toast.success("Fila de atendimento criada!");
    }

    // Registro na Auditoria para rastreabilidade de alterações nas filas
    console.log(`Auditoria: ${action} - Fila: ${deptName.trim()} - Usuário: ${session?.user?.email}`);
    
    setIsDeptModalOpen(false);
    resetDeptForm();
  };



  const [tags] = useState([
    { id: "1", name: "Urgente", color: "#ef4444" },
    { id: "2", name: "Feedback", color: "#10b981" },
  ]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-12 font-inter text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-foreground">Configurações do Projeto</h1>
        <p className="text-muted-foreground">Administre as operações, equipe e o núcleo do sistema Zevva.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border p-1 rounded-xl w-full justify-start overflow-x-auto h-auto shadow-sm mb-6">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <MessageSquare className="w-4 h-4" /> Atendimento
          </TabsTrigger>
          <TabsTrigger value="ADMIN" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Users className="w-4 h-4" /> Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Lock className="w-4 h-4" /> Permissões e Cargos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Settings className="w-4 h-4" /> Sistema
          </TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all border border-navy/20">
            <Globe className="w-4 h-4" /> Global Platform
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <History className="w-4 h-4" /> Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-4 focus-visible:outline-none outline-none">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="status-filas" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <PieChart className="w-5 h-5 text-primary" />
                  Status das Filas (Tempo Real)
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {queueStatus.map((status) => (
                    <Card key={status.id} className="border-border bg-background/50">
                      <CardHeader className="p-4 pb-2 border-b border-border/10">
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                          {status.name}
                          <Badge variant="outline" className="text-[10px] bg-primary/5">AO VIVO</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Em atendimento</p>
                          <p className="text-lg font-extrabold text-primary">{status.in_service}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Pendentes</p>
                          <p className="text-lg font-extrabold text-error">{status.pending}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Completas</p>
                          <p className="text-lg font-extrabold text-emerald-500">{status.completed}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="filas" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" />
                  Filas de Atendimento
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Crie, edite e gerencie as filas de atendimento vinculadas a departamentos. 
                  Apenas usuários vinculados à fila e ao departamento poderão realizar o atendimento e visualizar o fluxo.
                </p>
                <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={notificarMudancasFila} 
                        onCheckedChange={setNotificarMudancasFila} 
                        id="notify-queue-changes"
                      />
                      <div>
                        <Label htmlFor="notify-queue-changes" className="text-sm font-bold cursor-pointer">
                          Notificar mudanças de fila
                        </Label>
                        <p className="text-[11px] text-muted-foreground">Notifica agentes ou departamentos sobre alterações no fluxo.</p>
                      </div>
                    </div>
                    {notificarMudancasFila && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsTestModalOpen(true)} className="h-8 text-[10px] font-bold border-primary/20 hover:bg-primary/10">
                          <Zap className="w-3.5 h-3.5 mr-1" /> PRÉ-TESTE
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(true)} className="h-8 text-[10px] font-bold border-primary/20 hover:bg-primary/10">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> TEMPLATE
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(true)} className="h-8 text-[10px] font-bold border-primary/20 hover:bg-primary/10">
                          <History className="w-3.5 h-3.5 mr-1" /> HISTÓRICO
                        </Button>
                      </div>
                    )}
                  </div>

                  {notificarMudancasFila && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Canal de Notificação</Label>
                        <div className="flex gap-2">
                          {["whatsapp", "email", "interno"].map((canal) => (
                            <button
                              key={canal}
                              onClick={() => setNotificarCanal(canal)}
                              className={cn(
                                "flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                notificarCanal === canal 
                                  ? "bg-primary text-primary-foreground border-primary" 
                                  : "bg-background border-border text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              {canal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <Card key={dept.id} className={cn("border-border bg-background/50 transition-all hover:border-primary/30", dept.status === 'inativo' && "opacity-60")}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center justify-between font-bold">
                          {dept.name}
                          <div className="flex gap-1">
                            <Badge variant={dept.status === 'ativo' ? "default" : "secondary"} className="text-[10px] h-4">
                              {dept.status === 'ativo' ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-4">{dept.members} Agentes</Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-1">Vinculada ao departamento: {dept.name}</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => openEditDept(dept)}
                            className="h-7 px-3 text-[10px] font-extrabold tracking-wider"
                          >
                            GERENCIAR
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, status: d.status === 'ativo' ? 'inativo' : 'ativo' } : d));
                              toast.info(`Fila ${dept.status === 'ativo' ? 'desativada' : 'ativada'}`);
                            }}
                            className="h-7 px-3 text-[10px] font-extrabold tracking-wider"
                          >
                            {dept.status === 'ativo' ? 'DESATIVAR' : 'ATIVAR'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeDept(dept.id)}
                            className="h-7 px-3 text-[10px] font-extrabold tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            EXCLUIR
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="geral" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Workflow className="w-5 h-5 text-primary" />
                  Distribuição de Conversas
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                <DistribuicaoConversas departments={departments} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="departamentos" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  Gerenciar Departamentos
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="flex justify-end mb-4">
                  <Button onClick={openNewDept} size="sm" className="bg-primary text-primary-foreground gap-2 font-bold">
                    <Plus className="w-4 h-4" /> Criar departamento
                  </Button>
                </div>
                <div className="space-y-2">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between gap-4 p-4 bg-background border border-border rounded-xl group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {dept.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold">{dept.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dept.agents.length === 0 && (
                              <span className="text-xs text-muted-foreground">Nenhum atendente atribuído</span>
                            )}
                            {dept.agents.slice(0, 3).map((id) => (
                              <span key={id} className="px-2 py-0.5 rounded-full border border-border text-xs font-bold">
                                {agents.find((a) => a.id === id)?.name ?? id}
                              </span>
                            ))}
                            {dept.agents.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full border border-border text-xs font-bold">
                                +{dept.agents.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          dept.restrictions.length > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}>
                          {dept.restrictions.length > 0 ? "Transferências restritas" : "Global"}
                        </span>
                        <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => openEditDept(dept)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-error" onClick={() => removeDept(dept.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>

            </AccordionItem>

            <AccordionItem value="tags" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  Gerenciar Tags e Classificações
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsTagModalOpen(true)} size="sm" className="bg-primary text-primary-foreground gap-2 font-bold">
                    <Plus className="w-4 h-4" /> Nova Tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background group">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-bold">{tag.name}</span>
                      <button className="text-muted-foreground hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gatilhos" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  Gatilhos de Atendimento
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground">Configure ações automáticas baseadas em eventos do chat.</p>
                <Button variant="outline" className="w-full border-dashed border-2 hover:bg-accent hover:border-primary transition-all">
                  <Plus className="w-4 h-4 mr-2" /> Criar Novo Gatilho
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sla" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  Inatividade e SLA
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Tempo de Inatividade (min)</Label>
                    <Input type="number" defaultValue={15} className="bg-background border-border" />
                    <p className="text-xs text-muted-foreground">Minutos para marcar ticket como inativo.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Alerta de SLA (min)</Label>
                    <Input type="number" defaultValue={10} className="bg-background border-border" />
                    <p className="text-xs text-muted-foreground">Tempo máximo para resposta inicial.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="font-bold">Encerramento Automático</Label>
                    <p className="text-xs text-muted-foreground">Fechar tickets inativos após o prazo.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="ADMIN" className="space-y-4 focus-visible:outline-none outline-none">
          <TeamManagement tenantId={activeTenantId || undefined} />
          <Accordion type="single" collapsible className="w-full space-y-4">

            <AccordionItem value="permissoes" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" /> Permissões e Cargos
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-foreground">Defina o que cada perfil pode visualizar e editar.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="filas" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" /> Filas de Atendimento
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-foreground">Organize o fluxo de entrada de mensagens.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4 focus-visible:outline-none outline-none">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="parametros" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" /> Parâmetros Gerais
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-foreground">Configurações de infraestrutura e dados do sistema.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="integracoes" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" /> Integrações e APIs
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <WhatsAppIntegration />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pref" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-primary" /> Preferências Globais
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-foreground">Ajustes finos de interface e comportamento da plataforma.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4 focus-visible:outline-none outline-none">
          <AuditoriaTab />
        </TabsContent>
      </Tabs>

      {/* Dept Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={(o) => { setIsDeptModalOpen(o); if (!o) resetDeptForm(); }}>
        <DialogContent className="sm:max-w-[560px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">
              {editingDeptId ? "Editar departamento" : "Criar departamento"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Crie departamentos para organizar e distribuir os atendimentos.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Nome <span className="text-error">*</span></Label>
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Insira o nome"
                className="border-border bg-background focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Atendentes</Label>
              <p className="text-xs text-muted-foreground">
                Os atendimentos deste departamento serão distribuídos apenas para os usuários selecionados.
              </p>
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    title="Selecionar todos"
                    onClick={() =>
                      setDeptAgents(
                        deptAgents.length === filteredAgents.length ? [] : filteredAgents.map((a) => a.id)
                      )
                    }
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ListChecks className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-44 overflow-y-auto divide-y divide-border">
                  {filteredAgents.map((a) => (
                    <label key={a.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/5">
                      <input
                        type="checkbox"
                        className="accent-[var(--color-primary)] w-4 h-4"
                        checked={deptAgents.includes(a.id)}
                        onChange={() =>
                          setDeptAgents((prev) =>
                            prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                          )
                        }
                      />
                      <span className="text-sm font-bold">
                        {a.name} <span className="text-muted-foreground font-normal">({a.email})</span>
                      </span>
                    </label>
                  ))}
                  {filteredAgents.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Restringir recebimento de transferências</Label>
              <p className="text-xs text-muted-foreground">
                Selecione os departamentos que NÃO poderão transferir conversas para este departamento.
              </p>
              <div className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    value={restrictSearch}
                    onChange={(e) => setRestrictSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    title="Selecionar todos"
                    onClick={() =>
                      setDeptRestrictions(
                        deptRestrictions.length === filteredRestrictDepts.length
                          ? []
                          : filteredRestrictDepts.map((d) => d.id)
                      )
                    }
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ListChecks className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-border">
                  {filteredRestrictDepts.map((d) => (
                    <label key={d.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-primary/5">
                      <input
                        type="checkbox"
                        className="accent-[var(--color-primary)] w-4 h-4"
                        checked={deptRestrictions.includes(d.id)}
                        onChange={() =>
                          setDeptRestrictions((prev) =>
                            prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                          )
                        }
                      />
                      <span className="text-sm font-bold">{d.name}</span>
                    </label>
                  ))}
                  {filteredRestrictDepts.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground">Nenhum departamento disponível.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-accent/10 border-t border-border gap-2">
            <Button variant="outline" onClick={() => { setIsDeptModalOpen(false); resetDeptForm(); }} className="border-border font-bold">Cancelar</Button>
            <Button disabled={!deptName.trim()} onClick={saveDept} className="bg-primary text-primary-foreground font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Tag Modal */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Nova Tag</DialogTitle>
            <DialogDescription className="text-muted-foreground">Crie classificações visuais para o chat.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Nome da Tag</Label>
              <Input 
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Ex: Prioridade Alta" 
                className="border-border bg-background focus:ring-primary" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold">Cor</Label>
              <div className="flex gap-2">
                {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#E8604A"].map(color => (
                  <button
                    key={color}
                    onClick={() => setTagColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                      tagColor === color ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-accent/10 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setIsTagModalOpen(false)} className="border-border font-bold">Cancelar</Button>
            <Button onClick={() => { setIsTagModalOpen(false); toast.success("Tag salva!"); }} className="bg-primary text-primary-foreground font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Notificação Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Template de Notificação</DialogTitle>
            <DialogDescription className="text-muted-foreground">Padronize o texto das notificações de mudanças de fila.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Conteúdo da Mensagem</Label>
              <textarea 
                value={templateNotificacao}
                onChange={(e) => setTemplateNotificacao(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:ring-primary outline-none"
                placeholder="Ex: Olá {agente}, houve uma mudança..."
              />
              <p className="text-[10px] text-muted-foreground italic">
                Variáveis: {"{agente}"}, {"{fila}"}, {"{status_anterior}"}, {"{status_atual}"}, {"{data_mudanca}"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-accent/10 p-4 space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pré-visualização</Label>
              <div className="bg-background rounded-lg p-3 text-xs border border-border shadow-inner">
                {templateNotificacao
                  .replace("{agente}", "Alice Vieira")
                  .replace("{fila}", "Suporte")
                  .replace("{status_anterior}", "Ativo")
                  .replace("{status_atual}", "Em pausa")
                  .replace("{data_mudanca}", "06/08/2026 14:20")
                }
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-accent/10 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)} className="border-border font-bold">Cancelar</Button>
            <Button onClick={() => { setIsTemplateModalOpen(false); toast.success("Template salvo!"); }} className="bg-primary text-primary-foreground font-bold">Salvar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Pré-teste */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Enviar Notificação de Teste</DialogTitle>
            <DialogDescription className="text-muted-foreground">Valide o template atual enviando uma notificação real com dados de exemplo.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Destinatário de Exemplo</Label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              >
                {agents.map(a => (
                  <option key={a.id} value={a.name}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-accent/10 p-4 space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Como o {notificarCanal} será enviado:</Label>
              <div className="bg-background rounded-lg p-3 text-xs border border-border shadow-inner whitespace-pre-wrap leading-relaxed">
                {templateNotificacao
                  .replace("{agente}", testRecipient)
                  .replace("{fila}", "Suporte")
                  .replace("{status_anterior}", "Ativo")
                  .replace("{status_atual}", "Em pausa")
                  .replace("{data_mudanca}", new Date().toLocaleString("pt-BR"))
                }
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-accent/10 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)} className="border-border font-bold">Cancelar</Button>
            <Button 
              onClick={() => { 
                setIsTestModalOpen(false); 
                toast.success(`Notificação de teste enviada via ${notificarCanal.toUpperCase()}!`);
                const newLog = {
                  id: `TRY-${Math.floor(1000 + Math.random() * 9000)}`,
                  target: testRecipient,
                  canal: notificarCanal.charAt(0).toUpperCase() + notificarCanal.slice(1),
                  data: new Date().toLocaleString("pt-BR").slice(0, 16),
                  evento: "Teste de Template",
                  status: "enviado",
                  motivo: "",
                  fila: "Suporte",
                  resposta: "Simulado: Sucesso no envio de teste"
                };
                setNotificacoesHistory(prev => [newLog, ...prev]);
              }} 
              className="bg-primary text-primary-foreground font-bold gap-2"
            >
              <Smartphone className="w-4 h-4" /> Enviar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico Notificações Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[900px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Histórico de Notificações</DialogTitle>
            <DialogDescription className="text-muted-foreground">Consulte os registros de notificações enviadas com filtros avançados e detalhes técnicos.</DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-accent/5 border-b border-border">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Taxa de Sucesso</span>
                <span className="text-xl font-manrope font-extrabold text-primary">
                  {Math.round((notificacoesHistory.filter(h => h.status === 'enviado').length / Math.max(1, notificacoesHistory.length)) * 100)}%
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Falhas (Geral)</span>
                <span className="text-xl font-manrope font-extrabold text-destructive">
                  {notificacoesHistory.filter(h => h.status === 'falhou').length}
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Maior Gargalo</span>
                <span className="text-xs font-bold text-foreground">
                  {(() => {
                    const counts: Record<string, number> = {};
                    notificacoesHistory.filter(h => h.status === 'falhou').forEach(h => {
                      counts[h.fila] = (counts[h.fila] || 0) + 1;
                    });
                    const max = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
                    return max ? `${max[0]} (${max[1]})` : "Nenhum";
                  })()}
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Melhor Canal</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                   <Zap className="w-3 h-3" /> WhatsApp
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-border bg-background/50 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="ID ou Destinatário..." 
                  value={historyFilter.search}
                  onChange={(e) => setHistoryFilter(p => ({ ...p, search: e.target.value }))}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Status</Label>
              <select 
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={historyFilter.status}
                onChange={(e) => setHistoryFilter(p => ({ ...p, status: e.target.value }))}
              >
                <option value="todos">Todos os Status</option>
                <option value="enviado">Enviado</option>
                <option value="falhou">Falhou</option>
                <option value="em processamento">Processando</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Canal</Label>
              <select 
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={historyFilter.canal}
                onChange={(e) => setHistoryFilter(p => ({ ...p, canal: e.target.value }))}
              >
                <option value="todos">Todos Canais</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="interno">Interno</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fila</Label>
              <select 
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={historyFilter.fila}
                onChange={(e) => setHistoryFilter(p => ({ ...p, fila: e.target.value }))}
              >
                <option value="todos">Todas as Filas</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-0 max-h-[500px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-accent/50 text-[10px] uppercase font-bold text-muted-foreground sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-center">Ações</th>
                  <th className="px-6 py-3">ID Tentativa</th>
                  <th className="px-6 py-3">Horário</th>
                  <th className="px-6 py-3">Destinatário</th>
                  <th className="px-6 py-3">Status Final</th>
                  <th className="px-6 py-3">Fila / Canal</th>
                  <th className="px-6 py-3">Resposta do Provedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notificacoesHistory
                  .filter(log => {
                    const matchSearch = (log.id?.toLowerCase().includes(historyFilter.search.toLowerCase()) || 
                                      log.target?.toLowerCase().includes(historyFilter.search.toLowerCase()));
                    const matchStatus = historyFilter.status === "todos" || log.status === historyFilter.status;
                    const matchCanal = historyFilter.canal === "todos" || log.canal.toLowerCase() === historyFilter.canal;
                    const matchFila = historyFilter.fila === "todos" || log.fila === historyFilter.fila;
                    return matchSearch && matchStatus && matchCanal && matchFila;
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-4 text-center">
                        {log.status === 'falhou' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Reenviar Notificação"
                            onClick={() => {
                              toast.loading("Reenviando notificação...", { id: log.id });
                              setTimeout(() => {
                                setNotificacoesHistory(prev => prev.map(h => 
                                  h.id === log.id 
                                    ? { ...h, status: 'enviado', motivo: '', resposta: `Reenvio manual OK: ${new Date().toLocaleString("pt-BR")}` }
                                    : h
                                ));
                                toast.success("Notificação reenviada com sucesso!", { id: log.id });
                              }, 1500);
                            }}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{log.id}</td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">{log.data}</td>
                      <td className="px-6 py-4 font-bold">{log.target}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={
                              log.status === 'enviado' ? 'default' : 
                              log.status === 'falhou' ? 'destructive' : 'secondary'
                            } 
                            className="text-[9px] font-bold w-fit"
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                          {log.motivo && <span className="text-[10px] text-destructive leading-tight font-medium">{log.motivo}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{log.fila}</span>
                          <span className="text-[10px] text-muted-foreground">{log.canal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate text-[10px] text-muted-foreground italic bg-accent/10 p-1 rounded" title={log.resposta}>
                          {log.resposta}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="p-6 bg-accent/10 border-t border-border">
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)} className="border-border font-bold w-full">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <TabsContent value="permissoes" className="space-y-4 focus-visible:outline-none outline-none">
        {activeTenantId && <PermissionsRolesManager tenantId={activeTenantId} />}
      </TabsContent>


    </div>
  );
}

// Simple fallback for icons if missing
const SlidingScale = Sliders;
