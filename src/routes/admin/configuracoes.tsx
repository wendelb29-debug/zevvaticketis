import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  Layers, Lock, Database, Smartphone, Sliders
} from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/configuracoes")({
  component: AuthGuard,
});

function AuthGuard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate({ to: "/" });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) navigate({ to: "/" });
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return null;
  return <SettingsPage />;
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("atendimento");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#E8604A");

  const [departments] = useState([
    { id: "1", name: "Suporte", members: 5 },
    { id: "2", name: "Comercial", members: 3 },
  ]);

  const [tags] = useState([
    { id: "1", name: "Urgente", color: "#ef4444" },
    { id: "2", name: "Feedback", color: "#10b981" },
  ]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-12 font-inter text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-foreground">Configurações do Projeto</h1>
        <p className="text-muted-fg">Administre as operações, equipe e o núcleo do sistema Zevva.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border p-1 rounded-xl w-full justify-start overflow-x-auto h-auto shadow-sm mb-6">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <MessageSquare className="w-4 h-4" /> Atendimento
          </TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Users className="w-4 h-4" /> Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Settings className="w-4 h-4" /> Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-4 focus-visible:outline-none outline-none">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="geral" className="border-border bg-card rounded-xl overflow-hidden shadow-sm border">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-primary" />
                  Configurações Gerais de Atendimento
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="font-bold">Distribuição Automática</Label>
                      <p className="text-xs text-muted-fg">Atribui tickets aos agentes disponíveis.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="font-bold">Chat de Boas-vindas</Label>
                      <p className="text-xs text-muted-fg">Ativa mensagem automática inicial.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-bold">Capacidade Máxima por Agente</Label>
                  <Input type="number" defaultValue={5} className="bg-background border-border max-w-[200px]" />
                </div>
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
                  <Button onClick={() => setIsDeptModalOpen(true)} size="sm" className="bg-primary text-white gap-2 font-bold">
                    <Plus className="w-4 h-4" /> Novo Departamento
                  </Button>
                </div>
                <div className="space-y-2">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {dept.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{dept.name}</p>
                          <p className="text-xs text-muted-fg">{dept.members} membros ativos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-error"><Trash2 className="w-4 h-4" /></Button>
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
                  <Button onClick={() => setIsTagModalOpen(true)} size="sm" className="bg-primary text-white gap-2 font-bold">
                    <Plus className="w-4 h-4" /> Nova Tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background group">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-bold">{tag.name}</span>
                      <button className="text-muted-fg hover:text-error transition-colors opacity-0 group-hover:opacity-100">
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
                <p className="text-sm text-muted-fg">Configure ações automáticas baseadas em eventos do chat.</p>
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
                    <p className="text-xs text-muted-fg">Minutos para marcar ticket como inativo.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Alerta de SLA (min)</Label>
                    <Input type="number" defaultValue={10} className="bg-background border-border" />
                    <p className="text-xs text-muted-fg">Tempo máximo para resposta inicial.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="font-bold">Encerramento Automático</Label>
                    <p className="text-xs text-muted-fg">Fechar tickets inativos após o prazo.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="equipe" className="space-y-4 focus-visible:outline-none outline-none">
          <TeamManagement />
          <Accordion type="single" collapsible className="w-full space-y-4">

            <AccordionItem value="usuarios" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" /> Gerenciar Usuários
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-fg">Administre os acessos dos seus agentes e colaboradores.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="permissoes" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" /> Permissões e Cargos
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-fg">Defina o que cada perfil pode visualizar e editar.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="filas" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" /> Filas de Atendimento
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-fg">Organize o fluxo de entrada de mensagens.</p>
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
                 <p className="text-sm text-muted-fg">Configurações de infraestrutura e dados do sistema.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="integracoes" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" /> Integrações e APIs
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-fg">Conecte o Zevva com outras ferramentas de mercado.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pref" className="border-border bg-card rounded-xl border overflow-hidden shadow-sm">
              <AccordionTrigger className="px-6 py-5 font-bold text-lg hover:no-underline hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <SlidingScale className="w-5 h-5 text-primary" /> Preferências Globais
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                 <p className="text-sm text-muted-fg">Ajustes finos de interface e comportamento da plataforma.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Dept Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Criar Departamento</DialogTitle>
            <DialogDescription className="text-muted-fg">Organize sua equipe em áreas especializadas.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">Nome do Departamento</Label>
              <Input 
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Ex: Financeiro" 
                className="border-border bg-background focus:ring-primary" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-accent/10 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setIsDeptModalOpen(false)} className="border-border font-bold">Cancelar</Button>
            <Button onClick={() => { setIsDeptModalOpen(false); toast.success("Departamento criado!"); }} className="bg-primary text-white font-bold">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Modal */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden text-foreground border shadow-2xl">
          <DialogHeader className="p-6 bg-accent/20 border-b border-border">
            <DialogTitle className="text-xl font-manrope font-extrabold">Nova Tag</DialogTitle>
            <DialogDescription className="text-muted-fg">Crie classificações visuais para o chat.</DialogDescription>
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
            <Button onClick={() => { setIsTagModalOpen(false); toast.success("Tag salva!"); }} className="bg-primary text-white font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple fallback for icons if missing
const SlidingScale = Sliders;
