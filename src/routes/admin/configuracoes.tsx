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
  Info,
  ChevronDown
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
                <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6 font-bold">
                  <Plus className="w-4 h-4" /> Criar departamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-8 py-6 bg-[#FDF8EB] border-b border-[#D9A94D]/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-[#D9A94D]/20">
                      <Layers className="w-5 h-5 text-[#D9A94D]" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-navy">Configurações básicas</DialogTitle>
                      <p className="text-sm text-navy/40 font-medium mt-0.5">Configure o nome e informações básicas do departamento</p>
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 bg-white">
                  <div className="p-8 space-y-10">
                    {/* Nome Section */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-navy flex items-center gap-1">
                        Nome <span className="text-coral">*</span>
                      </Label>
                      <div className="relative group">
                        <Input 
                          placeholder="Benefícios Ativos" 
                          className="rounded-xl border-line h-12 bg-surface-2 px-4 focus-visible:ring-coral/20 focus-visible:border-coral transition-all" 
                        />
                        <Pencil className="w-4 h-4 text-navy/20 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-navy/40 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Atendentes Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#D9A94D]" />
                            <Label className="text-sm font-bold text-navy">Atendentes vinculados</Label>
                          </div>
                        </div>
                        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                          <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                            <Search className="w-4 h-4 text-navy/30" />
                            <input className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-navy/20" placeholder="Buscar..." />
                            <RefreshCcw className="w-3.5 h-3.5 text-navy/20" />
                          </div>
                          <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                              {[
                                { name: "Alice Vieira", email: "alicevieiraii214@gmail.com" },
                                { name: "Bárbara Carvalho", email: "barbara864carvalho@gmail.com" },
                                { name: "Carolina Silva", email: "carol.12godinho@gmail.com" },
                                { name: "Daiane Silva", email: "cobransasavecar@savecarbrasil.com.br" },
                                { name: "Eduardo Lima", email: "edulima27.eh@gmail.com" }
                              ].map(user => (
                                <div key={user.email} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                  <Checkbox id={user.email} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                  <div className="flex flex-col min-w-0">
                                    <Label htmlFor={user.email} className="text-[11px] font-bold text-navy truncate cursor-pointer group-hover:text-coral transition-colors">
                                      {user.name}
                                    </Label>
                                    <span className="text-[10px] text-navy/30 truncate">{user.email}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Classificações Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#D9A94D]" />
                            <Label className="text-sm font-bold text-navy">Classificações vinculadas</Label>
                          </div>
                          <Button variant="link" className="text-[10px] text-[#D9A94D] h-auto p-0 font-bold">+ Criar classificação</Button>
                        </div>
                        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                          <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                            <Search className="w-4 h-4 text-navy/30" />
                            <input className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-navy/20" placeholder="Buscar..." />
                          </div>
                          <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                              {["Concluído"].map(item => (
                                <div key={item} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                  <Checkbox id={`class-${item}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                  <Label htmlFor={`class-${item}`} className="text-[11px] font-bold text-navy cursor-pointer">{item}</Label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#D9A94D]" />
                            <Label className="text-sm font-bold text-navy">Tags vinculadas</Label>
                          </div>
                          <Button variant="link" className="text-[10px] text-[#D9A94D] h-auto p-0 font-bold">+ Criar tag</Button>
                        </div>
                        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                          <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                            <Search className="w-4 h-4 text-navy/30" />
                            <input className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-navy/20" placeholder="Buscar..." />
                          </div>
                          <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                              {[
                                { name: "Analisar", active: true },
                                { name: "Boleto", active: false },
                                { name: "Cotação", active: true },
                                { name: "Em Negociação", active: true },
                                { name: "Insatisfeito", active: true }
                              ].map(tag => (
                                <div key={tag.name} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                  <Checkbox 
                                    id={`tag-${tag.name}`} 
                                    defaultChecked={tag.active}
                                    className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" 
                                  />
                                  <Label htmlFor={`tag-${tag.name}`} className="text-[11px] font-bold text-navy cursor-pointer">{tag.name}</Label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Templates Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#D9A94D]" />
                          <Label className="text-sm font-bold text-navy">Templates vinculados</Label>
                        </div>
                        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                          <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                            <Search className="w-4 h-4 text-navy/30" />
                            <input className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-navy/20" placeholder="Buscar..." />
                          </div>
                          <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                              {[
                                { name: "Boa Tarde, Reativar", active: false },
                                { name: "Bom Dia, Reativar", active: false },
                                { name: "Disparo_Ativo_16_Energia_Com_Selo", active: true },
                                { name: "Finalizar Ativo", active: false },
                                { name: "Laura, Voltando Associado", active: false }
                              ].map(temp => (
                                <div key={temp.name} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                  <Checkbox 
                                    id={`temp-${temp.name}`} 
                                    defaultChecked={temp.active}
                                    className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" 
                                  />
                                  <Label htmlFor={`temp-${temp.name}`} className="text-[11px] font-bold text-navy cursor-pointer truncate">{temp.name}</Label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Restriction */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="w-4 h-4 text-[#D9A94D]" />
                          <Label className="text-sm font-bold text-navy">Restringir recebimento de transferências</Label>
                        </div>
                        <p className="text-[10px] leading-relaxed text-navy/40 font-medium max-w-md">
                          Se nenhum for selecionado, este departamento é público e recebe transferências de qualquer departamento. Selecionando um ou mais, somente atendimentos que estão nesses departamentos poderão ser transferidos para cá.
                        </p>
                        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[200px] flex flex-col max-w-sm">
                          <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                            <Search className="w-4 h-4 text-navy/30" />
                            <input className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-navy/20" placeholder="Buscar..." />
                          </div>
                          <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                              {["2 Via Boleto", "Adm", "Atendimento", "Cadastro", "Carta de Ressalva"].map(dept => (
                                <div key={dept} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors group">
                                  <Checkbox id={`restrict-${dept}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                  <Label htmlFor={`restrict-${dept}`} className="text-[11px] font-bold text-navy cursor-pointer">{dept}</Label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="px-8 py-2 bg-white flex items-center justify-center border-t border-line/50 shrink-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-navy/20">
                    <ChevronDown className="w-3 h-3" /> Role para ver mais
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-surface-2 flex items-center justify-end w-full shrink-0">
                  <Button className="bg-[#D9A94D] text-white hover:bg-[#D9A94D]/90 font-bold px-10 h-12 rounded-xl shadow-lg shadow-[#D9A94D]/20 transition-all active:scale-95">
                    Salvar Departamento
                  </Button>
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
                  <TableRow key={idx} className="border-line group hover:bg-surface-2 transition-colors">
                    <TableCell className="px-6 py-5 font-bold text-navy text-sm">{depto.name}</TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {depto.agents.map((agent, aIdx) => (
                          <Badge key={aIdx} variant="outline" className="bg-white border-line text-[10px] py-1 px-3 font-bold text-navy/60 rounded-xl">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-navy/40">
                        {depto.config}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center text-navy/40 text-[11px] font-bold">{depto.created}</TableCell>
                    <TableCell className="px-6 py-5 text-center text-navy/40 text-[11px] font-bold">{depto.updated}</TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-navy/20 hover:text-[#D9A94D] hover:bg-[#FFF8E6] transition-all rounded-lg border border-transparent hover:border-[#D9A94D]/20">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          {/* Reuse the same content for editing - In a real app we'd pass the depto data */}
                          <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="px-8 py-6 bg-[#FDF8EB] border-b border-[#D9A94D]/10 shrink-0">
                              <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-[#D9A94D]/20">
                                  <Layers className="w-5 h-5 text-[#D9A94D]" />
                                </div>
                                <div>
                                  <DialogTitle className="text-xl font-bold text-navy">Configurações básicas</DialogTitle>
                                  <p className="text-sm text-navy/40 font-medium mt-0.5">Configure o nome e informações básicas do departamento</p>
                                </div>
                              </div>
                            </DialogHeader>

                            <ScrollArea className="flex-1 bg-white">
                              <div className="p-8 space-y-10">
                                <div className="space-y-3">
                                  <Label className="text-sm font-bold text-navy flex items-center gap-1">
                                    Nome <span className="text-coral">*</span>
                                  </Label>
                                  <div className="relative group">
                                    <Input 
                                      defaultValue={depto.name}
                                      className="rounded-xl border-line h-12 bg-surface-2 px-4 focus-visible:ring-coral/20 focus-visible:border-coral transition-all font-bold" 
                                    />
                                    <Pencil className="w-4 h-4 text-navy/20 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-navy/40 transition-colors" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                  {/* Sections reproduced here for the Edit modal... */}
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-[#D9A94D]" />
                                      <Label className="text-sm font-bold text-navy">Atendentes vinculados</Label>
                                    </div>
                                    <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                                      <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                                        <Search className="w-4 h-4 text-navy/30" />
                                        <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                                      </div>
                                      <ScrollArea className="flex-1 p-2">
                                        <div className="space-y-1">
                                          {[
                                            { name: "Alice Vieira", email: "alicevieiraii214@gmail.com" },
                                            { name: "Bárbara Carvalho", email: "barbara864carvalho@gmail.com" },
                                            { name: "Carolina Silva", email: "carol.12godinho@gmail.com" },
                                            { name: "Daiane Silva", email: "cobransasavecar@savecarbrasil.com.br" },
                                            { name: "Eduardo Lima", email: "edulima27.eh@gmail.com" }
                                          ].map(user => (
                                            <div key={user.email} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                              <Checkbox id={`edit-${depto.name}-${user.email}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                              <div className="flex flex-col min-w-0">
                                                <Label htmlFor={`edit-${depto.name}-${user.email}`} className="text-[11px] font-bold text-navy truncate cursor-pointer group-hover:text-[#D9A94D] transition-colors">
                                                  {user.name}
                                                </Label>
                                                <span className="text-[10px] text-navy/30 truncate">{user.email}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#D9A94D]" />
                                        <Label className="text-sm font-bold text-navy">Classificações vinculadas</Label>
                                      </div>
                                      <Button variant="link" className="text-[10px] text-[#D9A94D] h-auto p-0 font-bold">+ Criar classificação</Button>
                                    </div>
                                    <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                                      <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                                        <Search className="w-4 h-4 text-navy/30" />
                                        <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                                      </div>
                                      <ScrollArea className="flex-1 p-2">
                                        <div className="p-2.5 flex items-center gap-3 hover:bg-surface-2 rounded-lg transition-colors group">
                                          <Checkbox id={`edit-class-${depto.name}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                          <Label htmlFor={`edit-class-${depto.name}`} className="text-[11px] font-bold text-navy cursor-pointer">Concluído</Label>
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-[#D9A94D]" />
                                        <Label className="text-sm font-bold text-navy">Tags vinculadas</Label>
                                      </div>
                                      <Button variant="link" className="text-[10px] text-[#D9A94D] h-auto p-0 font-bold">+ Criar tag</Button>
                                    </div>
                                    <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                                      <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                                        <Search className="w-4 h-4 text-navy/30" />
                                        <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                                      </div>
                                      <ScrollArea className="flex-1 p-2">
                                        <div className="space-y-1">
                                          {["Analisar", "Boleto", "Cotação", "Em Negociação", "Insatisfeito"].map(tag => (
                                            <div key={tag} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                              <Checkbox 
                                                id={`edit-tag-${depto.name}-${tag}`} 
                                                className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" 
                                                defaultChecked={idx === 0 && (tag === "Analisar" || tag === "Cotação" || tag === "Em Negociação" || tag === "Insatisfeito")}
                                              />
                                              <Label htmlFor={`edit-tag-${depto.name}-${tag}`} className="text-[11px] font-bold text-navy cursor-pointer">{tag}</Label>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-[#D9A94D]" />
                                      <Label className="text-sm font-bold text-navy">Templates vinculados</Label>
                                    </div>
                                    <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[320px] flex flex-col">
                                      <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                                        <Search className="w-4 h-4 text-navy/30" />
                                        <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                                      </div>
                                      <ScrollArea className="flex-1 p-2">
                                        <div className="space-y-1">
                                          {["Boa Tarde, Reativar", "Bom Dia, Reativar", "Disparo_Ativo_16_Energia_Com_Selo", "Finalizar Ativo"].map(temp => (
                                            <div key={temp} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                                              <Checkbox 
                                                id={`edit-temp-${depto.name}-${temp}`} 
                                                className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" 
                                                defaultChecked={idx === 0 && temp === "Disparo_Ativo_16_Energia_Com_Selo"}
                                              />
                                              <Label htmlFor={`edit-temp-${depto.name}-${temp}`} className="text-[11px] font-bold text-navy cursor-pointer truncate">{temp}</Label>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <RefreshCcw className="w-4 h-4 text-[#D9A94D]" />
                                    <Label className="text-sm font-bold text-navy">Restringir recebimento de transferências</Label>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-navy/40 font-medium max-w-md">
                                    Se nenhum for selecionado, este departamento é público e recebe transferências de qualquer departamento.
                                  </p>
                                  <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm h-[200px] flex flex-col max-w-sm">
                                    <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                                      <Search className="w-4 h-4 text-navy/30" />
                                      <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                                    </div>
                                    <ScrollArea className="flex-1 p-2">
                                      <div className="space-y-1">
                                        {["2 Via Boleto", "Adm", "Atendimento", "Cadastro", "Carta de Ressalva"].map(d => (
                                          <div key={d} className="flex items-center gap-3 p-2 hover:bg-surface-2 rounded-lg transition-colors group">
                                            <Checkbox id={`edit-restrict-${depto.name}-${d}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                                            <Label htmlFor={`edit-restrict-${depto.name}-${d}`} className="text-[11px] font-bold text-navy cursor-pointer">{d}</Label>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>

                            <div className="px-8 py-2 bg-white flex items-center justify-center border-t border-line/50 shrink-0">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-navy/20">
                                <ChevronDown className="w-3 h-3" /> Role para ver mais
                              </div>
                            </div>

                            <DialogFooter className="px-8 py-6 border-t bg-surface-2 flex items-center justify-end w-full shrink-0">
                              <Button className="bg-[#D9A94D] text-white hover:bg-[#D9A94D]/90 font-bold px-10 h-12 rounded-xl shadow-lg shadow-[#D9A94D]/20 transition-all active:scale-95">
                                Salvar Departamento
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-navy/20 hover:text-coral hover:bg-coral/5 transition-all rounded-lg border border-transparent hover:border-coral/20">
                          <Trash2 className="w-4 h-4" />
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
            description="Defina as regras de distribuição de protocolos para suas tags" 
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">Gerenciar tags</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6 font-bold">
                  <Plus className="w-4 h-4" /> Criar tag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="px-6 py-5 border-b shrink-0">
                  <DialogTitle className="text-xl font-bold text-navy">Criar tag</DialogTitle>
                  <p className="text-sm text-navy/40 font-medium">Crie tags para organizar e distribuir os atendimentos</p>
                </DialogHeader>
                <div className="p-6 space-y-6">
                  <div className="flex items-end gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy">Cor:</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-red-600 shadow-sm border border-line" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#D9A94D] hover:bg-[#FFF8E6] rounded-lg">
                          <Palette className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs font-bold text-navy">Nome <span className="text-coral">*</span></Label>
                      <div className="relative">
                        <Input placeholder="Insira o nome" className="rounded-xl border-line h-11 bg-surface-2 pr-12 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-navy/20 font-bold">0 / 255</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-navy">Departamentos vinculados</Label>
                    <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-sm h-[240px] flex flex-col">
                      <div className="p-3 bg-surface-2 border-b border-line flex items-center gap-2">
                        <Search className="w-4 h-4 text-navy/30" />
                        <input className="bg-transparent border-none outline-none text-xs flex-1" placeholder="Buscar..." />
                        <RefreshCcw className="w-3.5 h-3.5 text-navy/20" />
                      </div>
                      <ScrollArea className="flex-1 p-2">
                        <div className="space-y-1">
                          {["2 Via Boleto", "Adm", "Atendimento", "Benefícios Ativos", "Cadastro"].map(dept => (
                            <div key={dept} className="flex items-center gap-3 p-2.5 hover:bg-surface-2 rounded-lg transition-colors group">
                              <Checkbox id={`tag-dept-${dept}`} className="data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                              <Label htmlFor={`tag-dept-${dept}`} className="text-xs font-bold text-navy cursor-pointer">{dept}</Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
                <DialogFooter className="px-6 py-5 border-t bg-surface-2 flex items-center justify-between sm:justify-between w-full">
                  <Button variant="ghost" className="text-navy/40 font-bold hover:bg-transparent">Cancelar</Button>
                  <Button className="bg-transparent text-navy/10 font-bold hover:bg-transparent" disabled>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Pesquisar</Label>
              <Input placeholder="10 registros" className="rounded-xl border-line h-11 bg-white pl-4 text-sm font-medium" />
            </div>
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Departamentos</Label>
              <Select defaultValue="todas">
                <SelectTrigger className="h-11 rounded-xl border-line bg-white text-sm font-medium">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
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
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Departamentos vinculados</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30 w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Portabilidade", color: "#4A6BF3", depts: ["Adm"] },
                  { name: "Resgate", color: "#F34A4A", depts: ["Adm", "Benefícios Ativos"] },
                  { name: "Cotação", color: "#4AF384", depts: ["Adm", "Benefícios Ativos"] },
                  { name: "Em Negociação", color: "#F3A94A", depts: ["Adm", "Benefícios Ativos"] },
                  { name: "Venda", color: "#4AF3D9", depts: ["Adm", "Benefícios Ativos"] },
                  { name: "Analisar", color: "#F34A4A", depts: ["Adm", "Disparo Kenia", "Contas A Receber", "Sdr", "Retenção", "Carta de Ressalva", "Cadastro", "Eventos", "Atendimento", "Benefícios Ativos"] },
                ].map((tag, idx) => (
                  <TableRow key={idx} className="border-line group hover:bg-surface-2 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" style={{ color: tag.color }} />
                        <span className="font-bold text-navy text-sm">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {tag.depts.map((d, dIdx) => (
                          <Badge key={dIdx} variant="outline" className="bg-white border-line text-[10px] py-1 px-3 font-bold text-navy/60 rounded-xl">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-navy/20 hover:text-[#D9A94D] transition-all">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-navy/20 hover:text-coral transition-all">
                          <Trash2 className="w-4 h-4" />
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
      { id: "sla", icon: Clock, title: "Inatividade e SLA", desc: "Configure regras de inatividade e SLA do atendente" },
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
        <AccordionTrigger className="px-6 py-5 hover:no-underline group text-left">
          <div className="flex items-center gap-3 text-left">
            <item.icon className="w-5 h-5 text-coral" />
            <ConfigItemHeader title={item.title} description={item.desc} />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
          <div className="space-y-12 pt-6">

            {/* Parâmetros de inatividade do cliente */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Parâmetros de inatividade do cliente</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6 font-bold">
                      <Plus className="w-4 h-4" /> Configurar inatividade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    <DialogHeader className="px-8 py-6 border-b shrink-0">
                      <DialogTitle className="text-xl font-bold text-navy">Criar Regra de Inatividade</DialogTitle>
                      <p className="text-sm text-navy/40 font-medium">Configure uma nova regra para gerenciar a inatividade do cliente</p>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                      <div className="p-8 space-y-8">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-navy">Nome da regra</Label>
                          <div className="relative">
                            <Input placeholder="Digite um nome para identificar esta regra (opcional)" className="rounded-xl border-line h-11 bg-surface-2 pr-12 text-sm" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-navy/20 font-bold">0 / 255</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-xs font-bold text-navy">Escopo de departamentos</Label>
                          <div className="flex items-center gap-2">
                            <Button className="bg-[#D9A94D] text-white hover:bg-[#D9A94D]/90 rounded-xl h-9 px-4 text-xs font-bold">Todos os departamentos (Global)</Button>
                            <Button variant="ghost" className="text-navy/40 hover:bg-surface-2 rounded-xl h-9 px-4 text-xs font-bold">Departamentos específicos</Button>
                          </div>
                          <p className="text-[10px] text-navy/30 font-bold">Esta regra será aplicada a todos os departamentos</p>
                        </div>

                        <div className="space-y-4">
                          {[
                            { title: "Vigência da regra", desc: "Defina a partir de qual data os atendimentos poderão ser impactados por esta regra. Se desativado, conversas anteriores em atendimento também serão impactadas.", active: false },
                            { title: "Considerar horário comercial do departamento", desc: "Ligado: o tempo de inatividade conta apenas dentro do horário de atendimento do departamento (pula noite/fim de semana/feriado). Desligado: conta em tempo corrido (24/7).", active: true },
                            { title: "Enviar Mensagens", desc: "Configure mensagens automáticas para enviar ao cliente antes do encerramento", active: false },
                            { title: "Encerrar Atendimento", desc: "Encerra automaticamente o atendimento após o tempo de inatividade", active: false }
                          ].map((config, cIdx) => (
                            <div key={cIdx} className="flex items-start justify-between p-5 bg-white border border-line rounded-2xl shadow-sm group hover:border-[#D9A94D]/20 transition-all">
                              <div className="space-y-1 pr-8">
                                <h4 className="text-sm font-bold text-navy">{config.title}</h4>
                                <p className="text-[11px] leading-relaxed text-navy/30 font-medium">{config.desc}</p>
                              </div>
                              <Switch defaultChecked={config.active} className="data-[state=checked]:bg-[#D9A94D]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                    <DialogFooter className="px-8 py-6 border-t bg-surface-2 flex items-center justify-between sm:justify-between w-full">
                      <Button variant="ghost" className="text-navy/40 font-bold hover:bg-transparent">Cancelar</Button>
                      <Button className="bg-transparent text-navy/10 font-bold hover:bg-transparent" disabled>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Pesquisar</Label>
                  <Input placeholder="Pesquisar por nome ou departamento..." className="rounded-xl border-line h-11 bg-white pl-4 text-sm font-medium" />
                </div>
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Departamentos</Label>
                  <Select defaultValue="todas">
                    <SelectTrigger className="h-11 rounded-xl border-line bg-white text-sm font-medium">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-surface-2 rounded-2xl py-12 text-center border border-dashed border-line">
                <p className="text-xs text-navy/30 font-bold uppercase tracking-widest">Nenhum resultado para exibir</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-navy/30 px-2 pt-2">
                <span>Mostrando de 0 até 10 de 0 registros</span>
                <div className="flex items-center gap-4">
                  <span>Página 1 de 1</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg border-line text-[#D9A94D] bg-[#FFF8E6] font-bold">1</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Parâmetros de SLA do Atendente */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Parâmetros de SLA do Atendente</h3>
                <Button className="bg-[#FFF8E6] text-[#D9A94D] hover:bg-[#FFF8E6]/80 border border-[#D9A94D]/20 gap-2 rounded-xl h-11 px-6 font-bold">
                  <Plus className="w-4 h-4" /> Configurar SLA
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Pesquisar</Label>
                  <Input placeholder="Pesquisar por nome ou departamento..." className="rounded-xl border-line h-11 bg-white pl-4 text-sm font-medium" />
                </div>
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-navy/30 px-1">Departamentos</Label>
                  <Select defaultValue="todas">
                    <SelectTrigger className="h-11 rounded-xl border-line bg-white text-sm font-medium">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-surface-2 rounded-2xl py-12 text-center border border-dashed border-line">
                <p className="text-xs text-navy/30 font-bold uppercase tracking-widest">Nenhum resultado para exibir</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-navy/30 px-2 pt-2">
                <span>Mostrando de 0 até 10 de 0 registros</span>
                <div className="flex items-center gap-4">
                  <span>Página 1 de 1</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg border-line text-[#D9A94D] bg-[#FFF8E6] font-bold">1</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="feriados" className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
      <AccordionTrigger className="px-6 py-5 hover:no-underline group text-left">
        <div className="flex items-center gap-3 text-left">
          <CalendarDays className="w-5 h-5 text-coral" />
          <ConfigItemHeader 
            title="Feriados e Datas Especiais" 
            description="Cadastre feriados nacionais, regionais ou datas com horário reduzido" 
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t border-line/50">
        <div className="space-y-6 pt-6">
          <div className="bg-[#EBF3FF] p-4 rounded-xl flex items-center gap-3 border border-[#EBF3FF] shadow-sm">
            <div className="bg-[#3B82F6] p-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs font-bold text-[#3B82F6]">
              Os horários abaixo seguem o fuso horário do projeto: America/Sao Paulo.
            </p>
          </div>

          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#D9A94D] text-white hover:bg-[#D9A94D]/90 gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#D9A94D]/20">
                  <Plus className="w-4 h-4" /> Adicionar feriado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="px-8 py-6 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-xl font-bold text-navy">Adicionar feriado</DialogTitle>
                      <p className="text-sm text-navy/40 font-medium">Cadastre um feriado nacional, regional ou outra data especial.</p>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="bg-[#EBF3FF] mx-8 mt-6 p-3 rounded-xl flex items-center gap-3 border border-[#EBF3FF]">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                  <p className="text-[11px] font-bold text-[#3B82F6]">
                    Os horários abaixo seguem o fuso horário do projeto: America/Sao Paulo.
                  </p>
                </div>

                <ScrollArea className="max-h-[70vh]">
                  <div className="p-8 space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy flex items-center gap-1">
                        Aplica a <Info className="w-3 h-3 text-navy/30" />
                      </Label>
                      <Select defaultValue="global">
                        <SelectTrigger className="h-12 rounded-xl border-line bg-surface-2 text-sm font-medium">
                          <SelectValue placeholder="Todos os departamentos (global)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Todos os departamentos (global)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy">
                        Nome do feriado <span className="text-coral">*</span>
                      </Label>
                      <div className="relative">
                        <Input placeholder="Ex.: Natal, Aniversário da empresa" className="rounded-xl border-line h-12 bg-surface-2 pr-12 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-navy/20 font-bold">0 / 255</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy">
                        Data <span className="text-coral">*</span>
                      </Label>
                      <div className="relative">
                        <Input type="text" placeholder="dd/mm/aaaa" className="rounded-xl border-line h-12 bg-surface-2 pr-12 text-sm" />
                        <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/20" />
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-navy/20 font-bold mr-2">0 / 255</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox id="repetir" className="rounded border-line" />
                        <Label htmlFor="repetir" className="text-xs font-bold text-navy cursor-pointer">Repetir todo ano</Label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-navy">
                        Como o atendimento funciona neste dia? <span className="text-coral">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-0 border border-line rounded-xl overflow-hidden h-11">
                        <Button className="rounded-none bg-[#FFF8E6] text-navy hover:bg-[#FFF8E6] border-r border-line text-xs font-bold shadow-none h-full">Dia inteiro fechado</Button>
                        <Button variant="ghost" className="rounded-none text-navy/40 text-xs font-bold hover:bg-surface-2 h-full">Horário reduzido</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy flex items-center gap-1">
                        Mensagem automática <Info className="w-3 h-3 text-navy/30" />
                      </Label>
                      <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div className="p-2 border-b border-line flex items-center gap-3 bg-surface-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 font-serif font-bold text-navy/60">B</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 italic text-navy/60">I</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 line-through text-navy/60">S</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60">{"< >"}</Button>
                          <div className="ml-auto flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60 text-lg">☺</Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-navy/60">⟲</Button>
                          </div>
                        </div>
                        <textarea 
                          className="w-full min-h-[120px] p-4 text-sm outline-none resize-none placeholder:text-navy/20" 
                          placeholder="Digite a mensagem que será enviada..."
                        />
                        <div className="p-2 border-t border-line flex items-center justify-between bg-surface-1">
                          <Zap className="w-4 h-4 text-[#D9A94D] cursor-pointer" />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-navy/20 font-bold">0 / 2000</span>
                            <div className="w-4 h-4 border border-line rounded-sm flex items-center justify-center cursor-pointer">
                              <Search className="w-2 h-2 text-navy/20" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-navy/30 font-bold pt-1">💡 Suporta variáveis dinâmicas — passe o mouse no ícone para ver exemplos.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs font-bold text-navy">Quando enviar esta mensagem?</Label>
                        <p className="text-[10px] leading-relaxed text-navy/30 font-bold">Selecione em quais momentos o aviso é enviado ao cliente. Sem nenhuma opção marcada, o feriado fica "silencioso" — nenhuma mensagem é enviada e ele serve apenas para excluir o dia das métricas de tempo útil de atendimento.</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Checkbox id="inicio" className="rounded border-line" />
                          <div className="flex items-center gap-1">
                            <Label htmlFor="inicio" className="text-xs font-bold text-navy cursor-pointer">Logo no início da conversa</Label>
                            <Info className="w-3 h-3 text-navy/30" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="transfer" defaultChecked className="rounded border-line data-[state=checked]:bg-[#D9A94D] data-[state=checked]:border-[#D9A94D]" />
                          <div className="flex items-center gap-1">
                            <Label htmlFor="transfer" className="text-xs font-bold text-navy cursor-pointer">Ao transferir para um atendente humano</Label>
                            <Info className="w-3 h-3 text-navy/30" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="px-8 py-6 border-t bg-surface-2 flex items-center justify-end w-full">
                  <Button className="bg-[#D9A94D] text-white hover:bg-[#D9A94D]/90 font-bold px-10 h-12 rounded-xl shadow-lg shadow-[#D9A94D]/20 transition-all active:scale-95">
                    Salvar feriado
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-surface-2">
                <TableRow className="hover:bg-transparent border-line">
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Nome</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Departamento</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Data</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Cobertura</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Recorrente</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Mensagem automática</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Criado por</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-navy/30">Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-surface-2 p-3 rounded-2xl border border-line">
                        <RefreshCcw className="w-8 h-8 text-navy/10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-navy">Nenhum registro encontrado</p>
                        <p className="text-[11px] text-navy/30 font-medium">Tente ajustar os filtros ou adicionar novos registros</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
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
