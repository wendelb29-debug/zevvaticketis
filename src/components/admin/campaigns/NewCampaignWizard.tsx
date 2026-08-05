import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, 
  Mail, 
  Users, 
  Search, 
  Smartphone, 
  Image as ImageIcon, 
  FileText, 
  Smile,
  Send,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  Clock,
  HelpCircle,
  Plus,
  Trash2,
  Filter,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewCampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4;

export function NewCampaignWizard({ open, onOpenChange }: NewCampaignWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [channelType, setChannelType] = useState("gupshup");
  const [channel, setChannel] = useState("savecar");
  const [publicType, setPublicType] = useState("arquivo");

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const canGoNext = step === 1 ? campaignName.trim().length > 0 : true;

  const steps = [
    { number: 1, label: "Dados", sublabel: "Definição dos dados do envio" },
    { number: 2, label: "Público Alvo", sublabel: "Seleção de público para o envio" },
    { number: 3, label: "Conteúdo", sublabel: "Definição do conteúdo a ser enviado" },
    { number: 4, label: "Configurações", sublabel: "Configurações adicionais para o envio" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-background border border-border text-foreground rounded-2xl">
        <DialogHeader className="p-0 border-b border-border bg-background">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-manrope font-extrabold text-navy">Nova Campanha</DialogTitle>
              <p className="text-sm text-muted-fg mt-0.5">Configure seu envio</p>
            </div>
            
            <div className="flex items-center gap-12">
              {steps.map((s) => (
                <div key={s.number} className="flex items-center gap-3 relative">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border",
                    step === s.number ? "bg-primary text-white border-primary" : 
                    step > s.number ? "bg-primary/10 text-primary border-primary" : "bg-background text-muted-fg border-border"
                  )}>
                    {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    step === s.number ? "text-primary" : "text-foreground"
                  )}>{s.label}</span>
                  {s.number < 4 && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-border" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="border-primary/20 text-primary hover:bg-accent font-bold px-6"
              >
                Voltar
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canGoNext || step === 4}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20"
              >
                Próximo
              </Button>
            </div>
          </div>
        </DialogHeader>


        <div className="p-8 min-h-[600px] bg-background">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-navy uppercase tracking-tight">Dados da campanha</h2>
                  <p className="text-sm text-muted-fg mt-1">Defina o nome e os canais de envio da sua campanha</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-navy uppercase tracking-widest">Nome da campanha <span className="text-primary">*</span></Label>
                    <Input 
                      placeholder="Ex: Show Ana Carolina - Lembrete" 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="bg-accent/30 border-border text-foreground h-12 rounded-xl focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-navy uppercase tracking-widest">Tipo de canal <span className="text-primary">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setChannelType("gupshup")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2 group",
                          channelType === "gupshup" 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-background border-border hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          channelType === "gupshup" ? "bg-primary text-white" : "bg-accent text-muted-fg group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className={cn("text-xs font-bold", channelType === "gupshup" ? "text-primary" : "text-muted-fg")}>WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => setChannelType("email")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2 group",
                          channelType === "email" 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-background border-border hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          channelType === "email" ? "bg-primary text-white" : "bg-accent text-muted-fg group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className={cn("text-xs font-bold", channelType === "email" ? "text-primary" : "text-muted-fg")}>E-mail</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-navy uppercase tracking-widest">Canal de saída <span className="text-primary">*</span></Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="bg-accent/30 border-border text-foreground h-12 rounded-xl">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="savecar">Zevva Oficial - 34 9867-9585</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>


              <div className="bg-accent/20 rounded-2xl flex items-center justify-center p-12 border border-border">
                <div className="max-w-md w-full text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-3xl">
                      <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/30">
                        {channelType === "email" ? <Mail className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold rounded-full border border-primary/20 uppercase tracking-widest">
                      ✨ Zevva Campaign
                    </div>
                    <h3 className="text-2xl font-manrope font-extrabold text-navy">Crie mensagens profissionais</h3>
                    <p className="text-sm text-muted-fg leading-relaxed">Dispare conteúdo personalizado com variáveis para cada contato de forma simples e rápida.</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-border shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="space-y-4 text-left">
                      <div className="bg-accent/50 text-navy px-4 py-2 rounded-xl text-sm font-bold inline-block border border-border">
                        Olá <span className="text-primary">{"{{"}nome{"}}"}</span>! 👋
                      </div>
                      <div className="bg-accent/20 rounded-xl aspect-[16/9] flex items-center justify-center border border-dashed border-border group-hover:bg-accent/40 transition-colors">
                        <div className="text-center space-y-2">
                          <ImageIcon className="w-8 h-8 text-muted-fg/30 mx-auto" />
                          <p className="text-[10px] text-muted-fg font-extrabold uppercase tracking-widest">Sua Imagem Aqui</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { icon: FileText, label: "Texto" },
                      { icon: ImageIcon, label: "Imagem" },
                      { icon: Smartphone, label: "Botão" },
                      { icon: Users, label: "Variáveis" }
                    ].map((btn) => (
                      <div key={btn.label} className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-extrabold text-navy hover:border-primary/50 cursor-default transition-all shadow-sm">
                        <btn.icon className="w-3.5 h-3.5 text-primary" /> {btn.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-navy uppercase tracking-tight">Público Alvo</h2>
                  <p className="text-sm text-muted-fg mt-1">Selecione o público que receberá as mensagens da sua campanha</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-navy uppercase tracking-widest">Origem dos contatos</Label>
                    
                    <div className="space-y-3">
                      {[
                        { id: "arquivo", label: "Arquivo Importado", desc: "Planilhas .csv ou .xlsx", icon: FileText },
                        { id: "publico", label: "Minha Base Zevva", desc: "Leads e participantes do sistema", icon: Users },
                        { id: "manual", label: "Entrada Manual", desc: "Digitar números manualmente", icon: MessageSquare },
                      ].map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setPublicType(item.id)}
                          className={cn(
                            "p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group",
                            publicType === item.id 
                              ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                              : "bg-background border-border hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            publicType === item.id ? "bg-primary text-white" : "bg-accent text-muted-fg group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm font-bold", publicType === item.id ? "text-primary" : "text-navy")}>{item.label}</p>
                            <p className="text-[10px] text-muted-fg font-medium">{item.desc}</p>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            publicType === item.id ? "border-primary bg-primary" : "border-border"
                          )}>
                            {publicType === item.id && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent/20 rounded-2xl p-8 border border-border">

                {publicType === "arquivo" && (
                  <div className="h-full flex flex-col items-center justify-center space-y-8">
                    <div className="w-full max-w-xl space-y-4">
                      <Label className="text-xs font-bold text-navy uppercase tracking-widest">DDI padrão</Label>
                      <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-3 shadow-sm">
                         <span className="text-2xl">🇧🇷</span>
                         <span className="text-sm font-bold text-navy">Brasil (+55)</span>
                         <ChevronDown className="w-4 h-4 ml-auto text-muted-fg" />
                      </div>
                    </div>

                    <div className="w-full max-w-xl aspect-[16/7] border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-lg font-manrope font-extrabold text-navy">Importar arquivo</p>
                        <p className="text-sm text-muted-fg font-medium">Arraste seu arquivo .csv ou .xlsx ou clique para buscar</p>
                        <div className="flex gap-2 justify-center mt-4">
                           <span className="px-2 py-1 bg-accent text-[10px] font-extrabold text-muted-fg rounded">CSV</span>
                           <span className="px-2 py-1 bg-accent text-[10px] font-extrabold text-muted-fg rounded">XLSX</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {publicType === "publico" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold mb-1">Filtre na sua base de contatos</h3>
                      <p className="text-xs text-white/40">Defina as condições para filtrar os contatos que receberão o disparo</p>
                    </div>

                    <Button variant="outline" className="bg-transparent border-dashed border-[#FFCC00]/50 text-[#FFCC00] hover:bg-[#FFCC00]/5 hover:border-[#FFCC00] h-10 px-4">
                      <Filter className="w-4 h-4 mr-2" /> Filtro
                    </Button>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Lista de Contatos <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px] ml-2">0</span></p>
                      </div>
                      <div className="bg-[#1E1E2D] rounded-xl overflow-hidden border border-white/5">
                        <table className="w-full text-left">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Nome</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Telefone</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={2} className="px-6 py-12 text-center text-white/20 italic text-sm">
                                Adicione ao menos 1 filtro para ver os contatos.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {publicType === "manual" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold mb-1">Para quem quer enviar?</h3>
                      <p className="text-xs text-white/40">Adicione os contatos que receberão as mensagens. Telefone é obrigatório.</p>
                    </div>

                    <div className="bg-[#FFCC00]/5 border border-dashed border-[#FFCC00]/30 p-3 rounded-lg flex gap-3">
                       <HelpCircle className="w-4 h-4 text-[#FFCC00] shrink-0" />
                       <p className="text-[10px] text-[#FFCC00]">Cole uma lista CSV. Com cabeçalho (ex.: Nome, Telefone, CPF), as colunas extras viram variáveis automaticamente.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-[#1E1E2D]/50 border border-white/5 rounded-xl space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          <span className="text-[#FFCC00]">{"{ }"}</span> Variáveis personalizadas
                        </div>
                        <div className="flex gap-2">
                           <Input placeholder="ex.: cpf, empresa..." className="bg-[#1E1E2D] border-white/10 h-10 text-xs" />
                           <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white/60">
                             <Plus className="w-4 h-4 mr-2" /> Variável
                           </Button>
                        </div>
                        <p className="text-[10px] text-white/40 italic">Use no conteúdo como {"{{"}variável{"}}"}. Nome e Telefone já são padrão.</p>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr_40px] gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-white/40 uppercase">Nome</Label>
                          <Input placeholder="Nome do contato" className="bg-[#1E1E2D] border-white/10 h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-white/40 uppercase">Telefone</Label>
                          <div className="flex">
                            <div className="bg-[#1E1E2D] border border-r-0 border-white/10 h-11 px-3 flex items-center gap-2 rounded-l-md">
                              <span>🇧🇷</span>
                              <ChevronDown className="w-3 h-3 text-white/40" />
                              <span className="text-xs font-bold">+55</span>
                            </div>
                            <Input className="bg-[#1E1E2D] border-white/10 h-11 rounded-l-none" />
                          </div>
                        </div>
                        <div className="pt-8">
                           <Button variant="ghost" size="icon" className="text-white/20 hover:text-red-500">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>

                      <Button variant="ghost" className="w-full bg-transparent border border-dashed border-[#FFCC00]/30 text-[#FFCC00] hover:bg-[#FFCC00]/5 h-10">
                        <Plus className="w-4 h-4 mr-2" /> Adicionar nova linha
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="flex items-center justify-center h-full">
               <p className="text-white/40 italic">As etapas de Conteúdo e Configurações serão implementadas em seguida.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
