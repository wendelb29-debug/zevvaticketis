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

    {[
      { id: "deptos", icon: Layers, title: "Gerenciar Departamentos", desc: "CRUD de departamentos e atendentes vinculados." },
      { id: "classificacoes", icon: Briefcase, title: "Gerenciar Classificações", desc: "Categorização vinculada a departamentos." },
      { id: "tags", icon: Tag, title: "Gerenciar Tags", desc: "Etiquetas globais e por departamento." },
      { id: "gatilhos", icon: Zap, title: "Gatilhos de Atendimento", desc: "Automações baseadas em fluxos." },
      { id: "sla", icon: Clock, title: "Inatividade e SLA", desc: "Tempos de resposta e prazos por setor." },
      { id: "feriados", icon: CalendarDays, title: "Feriados e Datas Especiais", desc: "Mensagens para datas não úteis." }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-0 overflow-hidden shadow-sm">
        <AccordionTrigger className="px-6 py-5 hover:no-underline group">
          <div className="flex items-center gap-3">
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
