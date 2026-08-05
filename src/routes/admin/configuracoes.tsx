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
  Globe
} from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfigPage,
});

const AtendimentoAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    {[
      { id: "geral", icon: Smartphone, title: "Configurações Gerais de Atendimento" },
      { id: "deptos", icon: Layers, title: "Gerenciar Departamentos" },
      { id: "classificacoes", icon: Briefcase, title: "Gerenciar Classificações" },
      { id: "tags", icon: Tag, title: "Gerenciar Tags" },
      { id: "gatilhos", icon: Zap, title: "Gatilhos de Atendimento" },
      { id: "sla", icon: Clock, title: "Inatividade e SLA" },
      { id: "feriados", icon: CalendarDays, title: "Feriados e Datas Especiais" }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-4 shadow-sm">
        <AccordionTrigger className="hover:no-underline font-bold text-navy flex items-center justify-between">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-coral" />
            {item.title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 text-navy/60">
          Configurações detalhadas para {item.title}...
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

const EquipeAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    {[
      { id: "equipe", icon: Users, title: "Gerenciar Equipe" },
      { id: "permissoes", icon: ShieldCheck, title: "Gerenciar Permissões" },
      { id: "templates", icon: Mail, title: "Templates de Mensagens" },
      { id: "atalhos", icon: Zap, title: "Mensagens Rápidas/Atalhos" },
      { id: "acesso", icon: Clock, title: "Horário de Acesso Customizado" },
      { id: "figurinhas", icon: Layers, title: "Gerenciar Figurinhas" },
      { id: "pausas", icon: Clock, title: "Gerenciar Pausas" }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-4 shadow-sm">
        <AccordionTrigger className="hover:no-underline font-bold text-navy flex items-center justify-between">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-coral" />
            {item.title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 text-navy/60">
          Configurações detalhadas para {item.title}...
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

const SistemaAccordion = () => (
  <Accordion type="single" collapsible className="space-y-4">
    {[
      { id: "aparencia", icon: Palette, title: "Personalizar Aparência" },
      { id: "campos", icon: Database, title: "Gerenciar Campos Customizados" },
      { id: "env", icon: Settings, title: "Variáveis de Ambiente" },
      { id: "projeto", icon: Layers, title: "Variáveis de Projeto" },
      { id: "ip", icon: Lock, title: "Restrição de Acesso por IP" }
    ].map((item) => (
      <AccordionItem key={item.id} value={item.id} className="bg-white rounded-2xl border border-line p-4 shadow-sm">
        <AccordionTrigger className="hover:no-underline font-bold text-navy flex items-center justify-between">
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 text-coral" />
            {item.title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 text-navy/60">
          Configurações detalhadas para {item.title}...
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

function ConfigPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 font-inter">
      <div>
        <h1 className="text-3xl font-manrope font-extrabold text-navy mb-2">Configurações do Projeto</h1>
        <p className="text-navy/60">Gerencie a estrutura administrativa, comportamentos e identidade do sistema.</p>
      </div>

      <Tabs defaultValue="atendimento" className="w-full">
        <TabsList className="bg-white border border-line rounded-xl p-1 w-full justify-start h-auto gap-2">
          <TabsTrigger value="atendimento" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 rounded-lg font-bold transition-all">
            <Headset className="w-4 h-4 mr-2" /> Atendimento
          </TabsTrigger>
          <TabsTrigger value="equipe" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 rounded-lg font-bold transition-all">
            <Users className="w-4 h-4 mr-2" /> Equipe e Recursos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-coral data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 rounded-lg font-bold transition-all">
            <Settings className="w-4 h-4 mr-2" /> Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-4 pt-6">
          <AtendimentoAccordion />
        </TabsContent>

        <TabsContent value="equipe" className="pt-6">
          <EquipeAccordion />
        </TabsContent>

        <TabsContent value="sistema" className="pt-6">
          <SistemaAccordion />
        </TabsContent>
      </Tabs>
    </div>
  );
}
