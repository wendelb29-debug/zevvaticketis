import { createFileRoute, redirect } from "@tanstack/react-router";
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
  Workflow
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
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("atendimento");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  
  // Mock data for initial UI
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

  const [holidays, setHolidays] = useState([
    { id: "1", name: "Natal", date: "2024-12-25" },
    { id: "2", name: "Ano Novo", date: "2025-01-01" },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-manrope font-extrabold text-navy">Configurações do Sistema</h1>
        <p className="text-navy/60 font-inter">Gerencie as regras de atendimento, equipe e recursos da plataforma.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-line p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-coral data-[state=active]:text-white rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <MessageSquare className="w-4 h-4" />
            Atendimento
          </TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-coral data-[state=active]:text-white rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Users className="w-4 h-4" />
            Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-coral data-[state=active]:text-white rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-bold transition-all">
            <Settings className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Navigation for Settings Section */}
            <Card className="md:col-span-1 border-line">
              <CardContent className="p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-coral bg-coral/5">
                  <Workflow className="w-4 h-4" />
                  Distribuição de Tickets
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-navy hover:bg-surface">
                  <Users className="w-4 h-4" />
                  Departamentos
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-navy hover:bg-surface">
                  <Tag className="w-4 h-4" />
                  Tags e Classificações
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-navy hover:bg-surface">
                  <Clock className="w-4 h-4" />
                  Inatividade e SLA
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-bold text-navy hover:bg-surface">
                  <Calendar className="w-4 h-4" />
                  Horário e Feriados
                </Button>
              </CardContent>
            </Card>

            {/* Main Settings Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Ticket Distribution */}
              <Card className="border-line overflow-hidden">
                <CardHeader className="bg-surface/50 border-b border-line">
                  <CardTitle className="text-lg font-manrope font-bold text-navy">Distribuição de Tickets</CardTitle>
                  <CardDescription>Configure como os novos atendimentos são atribuídos.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-line rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-navy">Distribuição Automática</Label>
                      <p className="text-xs text-navy/60">Atribui automaticamente novos tickets aos agentes disponíveis.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-navy">Capacidade Máxima por Agente</Label>
                    <Input type="number" defaultValue="5" className="border-line focus:ring-coral" />
                    <p className="text-xs text-navy/60">Número máximo de atendimentos simultâneos por agente.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Departments CRUD */}
              <Card className="border-line overflow-hidden">
                <CardHeader className="bg-surface/50 border-b border-line flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-manrope font-bold text-navy">Departamentos</CardTitle>
                    <CardDescription>Gerencie as áreas de atendimento.</CardDescription>
                  </div>
                  <Button onClick={() => setIsDeptModalOpen(true)} size="sm" className="bg-coral hover:bg-coral/90 text-white gap-2 font-bold rounded-lg">
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
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals placeholders */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-line">
          <DialogHeader>
            <DialogTitle className="text-xl font-manrope font-extrabold text-navy">Criar Departamento</DialogTitle>
            <DialogDescription>Adicione um novo departamento para organizar seus atendimentos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-navy">Nome do Departamento</Label>
              <Input id="name" placeholder="Ex: Suporte Premium" className="border-line focus:ring-coral" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeptModalOpen(false)} className="border-line font-bold">Cancelar</Button>
            <Button className="bg-coral hover:bg-coral/90 text-white font-bold">Criar Departamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}