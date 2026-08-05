import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  Shield, 
  Bell, 
  Clock, 
  Tag, 
  MessageSquare, 
  Globe,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  Zap,
  Ticket,
  Workflow,
  PlusCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      if (!session) {
        navigate({ to: "/" });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate({ to: "/" });
      }
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
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  
  // State for forms
  const [deptName, setDeptName] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#E8604A");
  
  // Mock data
  const [departments, setDepartments] = useState([
    { id: "1", name: "Suporte", members: 5, status: "active" },
    { id: "2", name: "Comercial", members: 3, status: "active" },
    { id: "3", name: "Financeiro", members: 2, status: "active" },
  ]);

  const [tags, setTags] = useState([
    { id: "1", name: "Urgente", color: "#ef4444" },
    { id: "2", name: "Dúvida", color: "#3b82f6" },
    { id: "3", name: "Feedback", color: "#10b981" },
  ]);

  const handleCreateDept = () => {
    if (!deptName) return;
    setDepartments([...departments, { id: Date.now().toString(), name: deptName, members: 0, status: "active" }]);
    setDeptName("");
    setIsDeptModalOpen(false);
    toast.success("Departamento criado com sucesso");
  };

  const handleCreateTag = () => {
    if (!tagName) return;
    setTags([...tags, { id: Date.now().toString(), name: tagName, color: tagColor }]);
    setTagName("");
    setIsTagModalOpen(false);
    toast.success("Tag criada com sucesso");
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
    toast.info("Tag removida");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-inter text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-foreground">Configurações do Sistema</h1>
        <p className="text-muted-fg">Gerencie as regras de atendimento, equipe e recursos da plataforma.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <MessageSquare className="w-4 h-4" />
            Atendimento
          </TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Users className="w-4 h-4" />
            Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Settings className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-border bg-card h-fit sticky top-24">
              <CardContent className="p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-primary bg-primary/5">
                  <Workflow className="w-4 h-4" />
                  Regras Gerais
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-foreground hover:bg-accent">
                  <Users className="w-4 h-4" />
                  Departamentos
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-foreground hover:bg-accent">
                  <Tag className="w-4 h-4" />
                  Tags e Classificações
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-foreground hover:bg-accent">
                  <Clock className="w-4 h-4" />
                  Inatividade e SLA
                </Button>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card className="border-border bg-card overflow-hidden shadow-sm">
                <CardHeader className="bg-accent/50 border-b border-border">
                  <CardTitle className="text-lg font-manrope font-bold text-foreground">Distribuição de Tickets</CardTitle>
                  <CardDescription className="text-muted-fg">Configure como os novos atendimentos são atribuídos.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-foreground">Distribuição Automática</Label>
                      <p className="text-xs text-muted-fg">Atribui automaticamente novos tickets aos agentes disponíveis.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-navy">Capacidade Máxima</Label>
                      <Input type="number" defaultValue="5" className="border-line focus:ring-coral" />
                      <p className="text-xs text-navy/60">Tickets simultâneos por agente.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-navy">Limite de Espera</Label>
                      <Input type="number" defaultValue="15" className="border-line focus:ring-coral" />
                      <p className="text-xs text-navy/60">Minutos antes de alerta de SLA.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-line overflow-hidden shadow-sm">
                <CardHeader className="bg-surface/50 border-b border-line flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-manrope font-bold text-navy">Departamentos</CardTitle>
                    <CardDescription>Gerencie as áreas de atendimento.</CardDescription>
                  </div>
                  <Button onClick={() => setIsDeptModalOpen(true)} size="sm" className="bg-coral hover:bg-coral/90 text-white gap-2 font-bold rounded-lg shadow-md shadow-coral/20">
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-line">
                    {departments.map(dept => (
                      <div key={dept.id} className="p-4 flex items-center justify-between hover:bg-surface transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-coral" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">{dept.name}</p>
                            <p className="text-xs text-navy/60">{dept.members} membros</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 hover:text-navy">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-line overflow-hidden shadow-sm">
                <CardHeader className="bg-surface/50 border-b border-line flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-manrope font-bold text-navy">Tags e Classificações</CardTitle>
                    <CardDescription>Organize atendimentos com etiquetas coloridas.</CardDescription>
                  </div>
                  <Button onClick={() => setIsTagModalOpen(true)} size="sm" className="bg-coral hover:bg-coral/90 text-white gap-2 font-bold rounded-lg shadow-md shadow-coral/20">
                    <Plus className="w-4 h-4" />
                    Nova Tag
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <div 
                        key={tag.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-white group hover:border-coral transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm font-bold text-navy">{tag.name}</span>
                        <button 
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-navy/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dept Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-line p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-surface/50 border-b border-line">
            <DialogTitle className="text-xl font-manrope font-extrabold text-navy">Criar Departamento</DialogTitle>
            <DialogDescription>Adicione um novo departamento para organizar seus atendimentos.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name" className="text-sm font-bold text-navy">Nome do Departamento</Label>
              <Input 
                id="dept-name" 
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Ex: Suporte Premium" 
                className="border-line focus:ring-coral" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-surface/30 border-t border-line">
            <Button variant="outline" onClick={() => setIsDeptModalOpen(false)} className="border-line font-bold">Cancelar</Button>
            <Button onClick={handleCreateDept} className="bg-coral hover:bg-coral/90 text-white font-bold">Criar Departamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Modal */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-line p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-surface/50 border-b border-line">
            <DialogTitle className="text-xl font-manrope font-extrabold text-navy">Nova Tag</DialogTitle>
            <DialogDescription>Crie classificações para seus atendimentos.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name" className="text-sm font-bold text-navy">Nome da Tag</Label>
              <Input 
                id="tag-name" 
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Ex: Reclamação" 
                className="border-line focus:ring-coral" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-navy">Cor de Identificação</Label>
              <div className="flex gap-2">
                {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#E8604A"].map(color => (
                  <button
                    key={color}
                    onClick={() => setTagColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                      tagColor === color ? "border-navy" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-surface/30 border-t border-line">
            <Button variant="outline" onClick={() => setIsTagModalOpen(false)} className="border-line font-bold">Cancelar</Button>
            <Button onClick={handleCreateTag} className="bg-coral hover:bg-coral/90 text-white font-bold">Salvar Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}