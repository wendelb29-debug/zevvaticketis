import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  ChevronRight,
  ShieldCheck,
  Mail,
  Smartphone
} from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfigPage,
});

function ConfigPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 font-inter">
      <div>
        <h1 className="text-3xl font-manrope font-extrabold text-navy mb-2">Configurações do Projeto</h1>
        <p className="text-navy/60">Configure o comportamento do sistema, equipe e automações.</p>
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
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="geral" className="bg-white rounded-2xl border border-line p-4 shadow-sm">
              <AccordionTrigger className="hover:no-underline font-bold text-navy flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-coral" />
                  Configurações Gerais
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 text-navy/60">
                Conteúdo de configurações gerais de atendimento...
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="equipe" className="pt-6">
          <p className="text-navy/60">Configurações de equipe...</p>
        </TabsContent>

        <TabsContent value="sistema" className="pt-6">
          <p className="text-navy/60">Configurações de sistema...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
