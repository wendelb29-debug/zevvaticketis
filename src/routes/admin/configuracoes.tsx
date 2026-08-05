import { createFileRoute } from "@tanstack/react-router";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Headset, 
  Users, 
  Settings, 
  Smartphone,
  Briefcase,
  Layers,
  Tag,
  Zap,
  Clock,
  CalendarDays,
  ShieldCheck,
  Mail,
  Palette,
  Database,
  Lock,
  Plus,
  Search,
  RefreshCcw,
  Pencil,
  Trash2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfigPage,
});

// Helper for labels and descriptions
const ConfigItemHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col text-left">
    <span className="font-bold text-navy text-sm">{title}</span>
    <span className="text-navy/40 text-xs font-normal">{description}</span>
  </div>
);

const AtendimentoAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    <AccordionItem value="geral" className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
      <AccordionTrigger className="px-6 py-5 hover:no-underline group">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-coral" />
          <ConfigItemHeader 
            title="Configurações Gerais de Atendimento" 
            description="Distribuição, recursos do chat, regras de transferência e mensagens automáticas." 
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
        <div className="space-y-8">
          {/* Distribuição Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-navy/30">Distribuição de Tickets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-navy">Modo de Entrega</Label>
                <RadioGroup defaultValue="manual" className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2 bg-surface-2 p-3 rounded-xl border border-line/50">
                    <RadioGroupItem value="auto" id="auto" className="text-coral border-coral" />
                    <Label htmlFor="auto" className="text-xs font-medium cursor-pointer">Forçar aceitação automática</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-surface-2 p-3 rounded-xl border border-line/50">
                    <RadioGroupItem value="manual" id="manual" className="text-coral border-coral" />
                    <Label htmlFor="manual" className="text-xs font-medium cursor-pointer">Permitir aceite/recusa</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold text-navy">Tipo de Distribuição</Label>
                <RadioGroup defaultValue="circular" className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2 bg-surface-2 p-3 rounded-xl border border-line/50">
                    <RadioGroupItem value="circular" id="circular" className="text-coral border-coral" />
                    <Label htmlFor="circular" className="text-xs font-medium cursor-pointer">Circular</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-surface-2 p-3 rounded-xl border border-line/50">
                    <RadioGroupItem value="equal" id="equal" className="text-coral border-coral" />
                    <Label htmlFor="equal" className="text-xs font-medium cursor-pointer">Igualitária</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Recursos Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-navy/30">Recursos do Chat</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Nome do atendente visível", "Áudio", "Emojis", "Figurinhas", "Envio de arquivos", "Exportar PDF"
              ].map((feature) => (
                <div key={feature} className="flex items-center justify-between p-3 bg-surface-2 rounded-xl border border-line/50">
                  <Label className="text-xs font-bold text-navy">{feature}</Label>
                  <Switch className="data-[state=checked]:bg-coral" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="deptos" className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
      <AccordionTrigger className="px-6 py-5 hover:no-underline group text-left">
        <div className="flex items-center gap-3 text-left">
          <Layers className="w-5 h-5 text-coral" />
          <ConfigItemHeader 
            title="Gerenciar Departamentos" 
            description="Defina as regras de distribuição de protocolos para seu departamento" 
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Gerenciar departamentos</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6">
                  <Plus className="w-4 h-4" /> Criar departamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle className="text-xl font-bold">Criar departamento</DialogTitle>
                  <p className="text-sm text-navy/40">Crie departamentos para organizar e distribuir os atendimentos</p>
                </DialogHeader>
                <ScrollArea className="flex-1 px-6 py-6">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Nome <span className="text-coral">*</span></Label>
                      <Input placeholder="Insira o nome" className="rounded-xl border-line" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold">Atendentes</Label>
                        <Info className="w-3.5 h-3.5 text-navy/30" />
                      </div>
                      <div className="border border-line rounded-xl overflow-hidden">
                        <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                          <Search className="w-4 h-4 text-navy/30" />
                          <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {[
                            { name: "Eduardo Lima", email: "edulima27.eh@gmail.com" },
                            { name: "Elaine Ramos", email: "elainereaparecidaramossouza@gmail.com" },
                            { name: "Elias Silva", email: "eliascomercialsavecar@gmail.com" },
                            { name: "Evely Azevedo Rocha", email: "evelyrocha.savecar@gmail.com" }
                          ].map(user => (
                            <div key={user.email} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors">
                              <Checkbox id={user.email} />
                              <Label htmlFor={user.email} className="text-xs font-medium cursor-pointer">
                                {user.name} <span className="text-navy/40">({user.email})</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold">Tags</Label>
                        <Info className="w-3.5 h-3.5 text-navy/30" />
                      </div>
                      <div className="border border-line rounded-xl overflow-hidden">
                        <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                          <Search className="w-4 h-4 text-navy/30" />
                          <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {["Analisar", "Boleto", "Cotação", "Em Negociação", "Insatisfeito"].map(tag => (
                            <div key={tag} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors">
                              <Checkbox id={`tag-${tag}`} />
                              <Label htmlFor={`tag-${tag}`} className="text-xs font-medium cursor-pointer">{tag}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pb-4">
                      <Label className="text-sm font-bold">Templates</Label>
                      <div className="border border-line rounded-xl overflow-hidden">
                        <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                          <Search className="w-4 h-4 text-navy/30" />
                          <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {["Boa Tarde, Reativar", "Bom Dia, Reativar", "Disparo_Ativo_16_Energia_Com_Selo", "Finalizar Ativo"].map(temp => (
                            <div key={temp} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors">
                              <Checkbox id={`temp-${temp}`} />
                              <Label htmlFor={`temp-${temp}`} className="text-xs font-medium cursor-pointer">{temp}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="px-6 py-4 border-t bg-surface-2 flex items-center justify-between sm:justify-between w-full">
                  <Button variant="ghost" className="text-navy/60 font-bold hover:bg-transparent">Cancelar</Button>
                  <Button className="bg-transparent text-navy/20 font-bold hover:bg-transparent" disabled>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Pesquisar</Label>
              <div className="relative">
                <Input placeholder="11 registros" className="rounded-xl border-line h-11 bg-white pl-4 text-sm font-medium" />
              </div>
            </div>
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Atendentes</Label>
              <Select defaultValue="todos">
                <SelectTrigger className="h-11 rounded-xl border-line bg-white text-sm font-medium">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-end gap-3 pb-0.5">
              <Button variant="ghost" size="icon" className="text-navy/30 hover:text-coral h-11 w-11 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy/40">Mostrar</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-20 h-11 rounded-xl border-line bg-white text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border border-line rounded-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-surface-2">
                <TableRow className="hover:bg-transparent border-line">
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Nome</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Atendentes</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 text-center">Configurações</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 text-center">Criado em</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 text-center">Atualizado em</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Benefícios Ativos", agents: ["Wendel", "Gabriel Vitor", "Kamilla"], config: "Global", created: "30/07/26 10:14", updated: "30/07/26 10:14" },
                  { name: "2 Via Boleto", agents: [], config: "Global", created: "02/04/26 17:31", updated: "02/04/26 17:31" },
                  { name: "Adm", agents: ["Maria Júlia", "Bárbara", "Karolaynne", "Haline", "Stephanie", "+ 7"], config: "Global", created: "12/03/26 12:38", updated: "12/03/26 12:38" },
                  { name: "Disparo Kenia", agents: [], config: "Global", created: "04/03/26 13:39", updated: "04/03/26 13:39" },
                  { name: "Contas A Receber", agents: ["Jaqueline", "Kitielle", "Natália", "Leticia", "Laura", "Sara", "Vitoria"], config: "Global", created: "08/10/25 11:28", updated: "25/02/26 13:43" },
                  { name: "Sdr", agents: ["Thayane", "Daiane", "Mayck"], config: "Personalizado", created: "08/10/25 11:28", updated: "11/12/25 15:31" },
                ].map((depto, idx) => (
                  <TableRow key={idx} className="border-line group hover:bg-surface-2/50 transition-colors">
                    <TableCell className="px-6 py-5 font-bold text-navy text-sm">{depto.name}</TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {depto.agents.map((agent, aIdx) => (
                          <Badge key={aIdx} variant="outline" className="bg-white border-line text-[10px] py-0.5 font-medium text-navy/60 rounded-lg">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        depto.config === "Global" ? "text-navy/40" : "bg-[#EDF2FF] text-[#4A6BF3]"
                      )}>
                        {depto.config}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center text-navy/40 text-xs font-medium">{depto.created}</TableCell>
                    <TableCell className="px-6 py-5 text-center text-navy/40 text-xs font-medium">{depto.updated}</TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/30 hover:text-navy transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/30 hover:text-coral transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="tags" className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
      <AccordionTrigger className="px-6 py-5 hover:no-underline group text-left">
        <div className="flex items-center gap-3 text-left">
          <Tag className="w-5 h-5 text-coral" />
          <ConfigItemHeader 
            title="Gerenciar Tags" 
            description="Etiquetas globais e por departamento." 
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Gerenciar tags</h3>
            <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6">
              <Plus className="w-4 h-4" /> Criar tag
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Pesquisar</Label>
              <Input placeholder="Buscar por nome..." className="rounded-xl border-line h-11 bg-white pl-4 text-sm font-medium" />
            </div>
            <div className="ml-auto flex items-end gap-3 pb-0.5">
              <Button variant="ghost" size="icon" className="text-navy/30 hover:text-coral h-11 w-11 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy/40">Mostrar</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-20 h-11 rounded-xl border-line bg-white text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="border border-line rounded-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-surface-2">
                <TableRow className="hover:bg-transparent border-line">
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Nome</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Departamento</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 text-center">Criado em</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Analisar", color: "#4A6BF3", dept: "Global", created: "30/07/26 10:14" },
                  { name: "Boleto", color: "#F34A4A", dept: "Global", created: "02/04/26 17:31" },
                  { name: "Cotação", color: "#4AF384", dept: "Sdr", created: "12/03/26 12:38" },
                  { name: "Em Negociação", color: "#F3A94A", dept: "Global", created: "04/03/26 13:39" },
                ].map((tag, idx) => (
                  <TableRow key={idx} className="border-line group hover:bg-surface-2/50 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span className="font-bold text-navy text-sm">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className="text-xs font-medium text-navy/60">{tag.dept}</span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center text-navy/40 text-xs font-medium">{tag.created}</TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/30 hover:text-navy transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/30 hover:text-coral transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    {[
      { id: "classificacoes", icon: Briefcase, title: "Gerenciar Classificações", desc: "Categorização vinculada a departamentos." },
      { id: "gatilhos", icon: Zap, title: "Gatilhos de Atendimento", desc: "Automações baseadas em fluxos." },
      { id: "sla", icon: Clock, title: "Inatividade e SLA", desc: "Tempos de resposta e prazos por setor." },
      { id: "feriados", icon: CalendarDays, title: "Feriados e Datas Especiais", desc: "Mensagens para datas não úteis." }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
        <AccordionTrigger className="px-6 py-5 hover:no-underline group text-left">
          <div className="flex items-center gap-3 text-left">
            <item.icon className="w-5 h-5 text-coral" />
            <ConfigItemHeader title={item.title} description={item.desc} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
          <div className="py-10 text-center">
            <p className="text-xs text-navy/40 font-medium">Módulo de {item.title} será implementado aqui.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

const EquipeAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    {[
      { id: "equipe", icon: Users, title: "Gerenciar Equipe", desc: "Tabela de usuários, e-mails e permissões." },
      { id: "permissoes", icon: ShieldCheck, title: "Gerenciar Permissões", desc: "Criação de papéis e controle granular." },
      { id: "templates", icon: Mail, title: "Templates de Mensagens", desc: "Vínculo de templates aprovados WABA." },
      { id: "atalhos", icon: Zap, title: "Mensagens Rápidas/Atalhos", desc: "Atalhos com formatação rica e variáveis." },
      { id: "acesso", icon: Clock, title: "Horário de Acesso Customizado", desc: "Restrição de login por horário e dia." },
      { id: "figurinhas", icon: Layers, title: "Gerenciar Figurinhas", desc: "Upload e gestão de pacotes por depto." },
      { id: "pausas", icon: Clock, title: "Gerenciar Pausas", desc: "Tipos de pausas e mensagens automáticas." }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
        <AccordionTrigger className="px-6 py-5 hover:no-underline group">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-coral" />
            <ConfigItemHeader title={item.title} description={item.desc} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50 text-navy/60">
           Configurações detalhadas para {item.title}...
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

const SistemaAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    {[
      { id: "aparencia", icon: Palette, title: "Personalizar Aparência", desc: "Cores, avatares e pré-visualização ao vivo." },
      { id: "campos", icon: Database, title: "Gerenciar Campos Customizados", desc: "CPF, CNPJ e outros campos para contatos." },
      { id: "env", icon: Settings, title: "Variáveis de Ambiente", desc: "Pares chave/valor mascarados." },
      { id: "projeto", icon: Layers, title: "Variáveis de Projeto", desc: "Interpolação em fluxos de automação." },
      { id: "ip", icon: Lock, title: "Restrição de Acesso por IP", desc: "Lista autorizada para painel e API." }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
        <AccordionTrigger className="px-6 py-5 hover:no-underline group">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-coral" />
            <ConfigItemHeader title={item.title} description={item.desc} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50 text-navy/60">
          Configurações detalhadas para {item.title}...
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

function ConfigPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 font-inter animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-manrope font-extrabold text-navy tracking-tight">Configurações do Projeto</h1>
        <p className="text-navy/40 text-sm font-medium">Configure as diretrizes de atendimento, gestão de pessoas e parâmetros técnicos da plataforma.</p>
      </div>

      <Tabs defaultValue="atendimento" className="w-full">
        <TabsList className="bg-white border border-line rounded-2xl p-1.5 w-full justify-start h-auto gap-1 shadow-sm">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-coral/20 px-6 py-3 rounded-xl font-extrabold text-sm transition-all text-navy/60">
            <Headset className="w-4 h-4 mr-2" /> Atendimento
          </TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-coral/20 px-6 py-3 rounded-xl font-extrabold text-sm transition-all text-navy/60">
            <Users className="w-4 h-4 mr-2" /> Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-coral/20 px-6 py-3 rounded-xl font-extrabold text-sm transition-all text-navy/60">
            <Settings className="w-4 h-4 mr-2" /> Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-4 pt-8 outline-none">
          <AtendimentoAccordion />
        </TabsContent>

        <TabsContent value="equipe" className="space-y-4 pt-8 outline-none">
          <EquipeAccordion />
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4 pt-8 outline-none">
          <SistemaAccordion />
        </TabsContent>
      </Tabs>
    </div>
  );
}
