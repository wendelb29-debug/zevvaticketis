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
  Check,
  Rocket,
  Zap,
  MousePointer2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface NewCampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function NewCampaignWizard({ open, onOpenChange }: NewCampaignWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [channelType, setChannelType] = useState("gupshup");
  const [channel, setChannel] = useState("savecar");
  const [publicType, setPublicType] = useState("arquivo");
  const [contentType, setContentType] = useState("mensagem");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);

  // Configurações de envio states
  const [sendingSpeed, setSendingSpeed] = useState("medio");
  const [contactsPerBatch, setContactsPerBatch] = useState(50);
  const [intervalBetweenBatches, setIntervalBetweenBatches] = useState(10);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [isScheduled, setIsScheduled] = useState(false);

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const canGoNext = step === 1 ? campaignName.trim().length > 0 : true;

  const steps = [
    { number: 1, label: "Dados", sublabel: "Definição dos dados do envio" },
    { number: 2, label: "Público Alvo", sublabel: "Seleção de público para o envio" },
    { number: 3, label: "Correspondência", sublabel: "Mapeamento de colunas" },
    { number: 4, label: "Conteúdo", sublabel: "Definição do conteúdo a ser enviado" },
    { number: 5, label: "Configurações", sublabel: "Configurações adicionais para o envio" },
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
                <div key={s.number} className="flex items-center gap-2 relative">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors border",
                    step === s.number ? "bg-primary text-white border-primary" : 
                    step > s.number ? "bg-primary/10 text-primary border-primary" : "bg-background text-muted-fg border-border"
                  )}>
                    {step > s.number ? <Check className="w-3 h-3" /> : s.number}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider hidden xl:inline",
                    step === s.number ? "text-primary" : "text-foreground"
                  )}>{s.label}</span>
                  {s.number < 5 && (
                    <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-border" />
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
                disabled={!canGoNext || step === 5}
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
                  <div className="h-full flex flex-col space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-xs font-bold text-navy uppercase tracking-widest">DDI padrão</Label>
                        <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-3 shadow-sm">
                           <span className="text-2xl">🇧🇷</span>
                           <span className="text-sm font-bold text-navy">Brasil (+55)</span>
                           <ChevronDown className="w-4 h-4 ml-auto text-muted-fg" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-xs font-bold text-navy uppercase tracking-widest">Ações</Label>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-dashed border-primary/40 text-primary hover:bg-primary/5 h-14 rounded-xl font-bold"
                            onClick={() => {
                              setUploadedFile(null);
                              setCsvPreview([]);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Limpar Arquivo
                          </Button>
                        </div>
                      </div>
                    </div>

                    {!uploadedFile ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full max-w-xl aspect-[16/7] border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group shadow-sm relative">
                          <input 
                            type="file" 
                            accept=".csv, .xlsx" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadedFile(file);
                                // Mock preview data
                                setCsvPreview([
                                  ["telefone", "urlLink", "body1", "body2"],
                                  ["(34)9966-01526", "https://mundialeassociacoes.s...", "JOSE VALTER DA SILVA SANT...", "OQB9980"],
                                  ["(34)9970-91428", "https://mundialeassociacoes.s...", "VANDERLEI ANTONIO ROSA", "HLZ4A76"],
                                  ["(34)99928-3379", "https://mundialeassociacoes.s...", "DAIANE OLIVEIRA CONSTANTI...", "BES5F59"],
                                  ["(34)99813-2720", "https://mundialeassociacoes.s...", "JAQUELINE MARIA DE ASSIS SI...", "PVH5993"],
                                  ["(31)9926-85919", "https://mundialeassociacoes.s...", "CLEVERSON DE SOUZA COSTA", "SHN7B75"],
                                  ["(34)9965-75904", "https://mundialeassociacoes.s...", "VICTOR HUGO MOTTA MOREIRA", "PXO8303"]
                                ]);
                              }
                            }}
                          />
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Plus className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-lg font-manrope font-extrabold text-navy">Importar arquivo</p>
                            <p className="text-sm text-muted-fg font-medium">Nessa parte poder arrastar pra cá o arquivo ou clicar pra abrir somente arquivos CSV ou XLSX do computador</p>
                            <div className="flex gap-2 justify-center mt-4">
                               <span className="px-2 py-1 bg-accent text-[10px] font-extrabold text-muted-fg rounded">CSV</span>
                               <span className="px-2 py-1 bg-accent text-[10px] font-extrabold text-muted-fg rounded">XLSX</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border bg-accent/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-navy">{uploadedFile.name}</p>
                              <p className="text-[10px] text-muted-fg">{(uploadedFile.size / 1024).toFixed(1)} KB • {csvPreview.length - 1} contatos encontrados</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                            <Check className="w-3 h-3 mr-1" /> Arquivo Carregado
                          </div>
                        </div>
                        
                        <div className="p-4 border-b border-border bg-amber-500/5 flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <p className="text-xs font-medium text-amber-700">Confirme se os cabeçalhos das colunas estão corretos antes de prosseguir.</p>
                        </div>

                        <ScrollArea className="flex-1">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-accent/30 z-10">
                              <tr>
                                <th className="p-4 border-b border-border text-[10px] font-extrabold text-muted-fg uppercase tracking-widest w-12 text-center">#</th>
                                {csvPreview[0]?.map((header, i) => (
                                  <th key={i} className="p-4 border-b border-border text-[10px] font-extrabold text-navy uppercase tracking-widest">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                                  <td className="p-4 text-center">
                                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center mx-auto">
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                  </td>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="p-4 text-sm font-medium text-navy truncate max-w-[200px]">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}


                {publicType === "publico" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-manrope font-extrabold text-navy">Filtre sua base Zevva</h3>
                        <p className="text-sm text-muted-fg mt-1">Defina as condições para segmentar seu público</p>
                      </div>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-bold">
                        <Filter className="w-4 h-4 mr-2" /> Adicionar Filtro
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-navy">Contatos Selecionados <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] ml-2">0</span></p>
                      </div>
                      <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-accent/50">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-fg uppercase tracking-widest">Nome</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-fg uppercase tracking-widest">Telefone</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-fg uppercase tracking-widest">Tags</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={3} className="px-6 py-16 text-center text-muted-fg italic text-sm">
                                Use os filtros acima para listar contatos da sua base.
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
                      <h3 className="text-lg font-manrope font-extrabold text-navy">Entrada Manual</h3>
                      <p className="text-sm text-muted-fg mt-1">Adicione os contatos que receberão as mensagens.</p>
                    </div>

                    <div className="bg-primary/5 border border-dashed border-primary/30 p-4 rounded-xl flex gap-3">
                       <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                       <p className="text-xs text-navy font-medium">Você pode colar uma lista no formato <strong>Nome, Telefone</strong>. Colunas extras serão tratadas como variáveis personalizadas.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-white border border-border rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-navy uppercase tracking-widest">
                          <span className="text-primary">{"{ }"}</span> Variáveis Dinâmicas
                        </div>
                        <div className="flex gap-3">
                           <Input placeholder="Ex: empresa, cpf..." className="bg-accent/30 border-border h-11 text-sm rounded-xl" />
                           <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-bold">
                             <Plus className="w-4 h-4 mr-2" /> Variável
                           </Button>
                        </div>
                        <p className="text-[10px] text-muted-fg italic font-medium">As variáveis ficam disponíveis no criador de conteúdo.</p>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr_48px] gap-4 items-end">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-extrabold text-navy uppercase tracking-widest">Nome completo</Label>
                          <Input placeholder="Nome do contato" className="bg-accent/30 border-border h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-extrabold text-navy uppercase tracking-widest">Whatsapp / Telefone</Label>
                          <div className="flex">
                            <div className="bg-accent/50 border border-r-0 border-border h-12 px-4 flex items-center gap-2 rounded-l-xl">
                              <span className="text-xl">🇧🇷</span>
                              <span className="text-xs font-bold text-navy">+55</span>
                            </div>
                            <Input placeholder="(00) 00000-0000" className="bg-accent/30 border-border h-12 rounded-l-none rounded-r-xl" />
                          </div>
                        </div>
                        <div>
                           <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-fg/40 hover:text-error hover:bg-error/10 rounded-xl">
                             <Trash2 className="w-5 h-5" />
                           </Button>
                        </div>
                      </div>

                      <Button variant="ghost" className="w-full border border-dashed border-primary/30 text-primary hover:bg-primary/5 h-12 rounded-xl font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Adicionar nova linha

                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div>
                <h2 className="text-xl font-manrope font-extrabold text-navy uppercase tracking-tight">Corresponder colunas</h2>
                <p className="text-sm text-muted-fg mt-1">Relacione as colunas da planilha aos campos obrigatórios e variáveis do template.</p>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <p className="text-xs font-medium text-navy">
                  Exibindo as 3 primeiras linhas do arquivo para você estabelecer o vínculo visual entre as colunas e os campos. 
                  É obrigatório ter pelo menos uma coluna mapeada como <span className="font-bold">Telefone</span>.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-accent/30">
                    <tr>
                      {csvPreview[0]?.map((header, i) => (
                        <th key={i} className="p-6 border-b border-border bg-accent/20">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-navy uppercase tracking-widest">{header}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-fg hover:text-error">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <Select defaultValue={i === 0 ? "nome" : i === 2 ? "telefone" : "variavel"}>
                              <SelectTrigger className="bg-white border-border h-11 rounded-xl">
                                <SelectValue placeholder="Selecione o campo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nome">Nome</SelectItem>
                                <SelectItem value="telefone">Telefone</SelectItem>
                                <SelectItem value="departamento">Departamento</SelectItem>
                                <SelectItem value="variavel">Variável de fluxo</SelectItem>
                                <SelectItem value="descartar">Descartar</SelectItem>
                              </SelectContent>
                            </Select>
                            {(i === 0 || i === 2) ? (
                              <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg border border-green-500/20 text-[10px] font-bold flex items-center gap-1.5">
                                <Check className="w-3 h-3" /> Mapeado
                              </div>
                            ) : (
                              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 text-[10px] font-bold">
                                Variável de fluxo: {header.toLowerCase()}
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(1, 4).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-6 text-sm font-medium text-navy/70 italic truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-navy uppercase tracking-tight">Conteúdo</h2>
                  <p className="text-sm text-muted-fg mt-1">Definição do conteúdo a ser enviado</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold text-navy uppercase tracking-widest">Tipo de conteúdo</Label>
                  <div className="space-y-3">
                    {[
                      { id: "mensagem", label: "Criar mensagem", desc: "Selecione o template a enviar e configure as variáveis e ações de botões, se necessário", icon: MessageSquare, badge: "NEW" },
                      { id: "departamento", label: "Enviar por departamento", desc: "A execução é feita pelos usuários que estiverem mapeados com este departamento", icon: Users },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setContentType(item.id)}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group",
                          contentType === item.id 
                            ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                            : "bg-background border-border hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          contentType === item.id ? "bg-primary text-white" : "bg-accent text-muted-fg group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-bold", contentType === item.id ? "text-primary" : "text-navy")}>{item.label}</p>
                            {item.badge && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded font-black">{item.badge}</span>}
                          </div>
                          <p className="text-[10px] text-muted-fg font-medium leading-tight mt-0.5">{item.desc}</p>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          contentType === item.id ? "border-primary bg-primary" : "border-border"
                        )}>
                          {contentType === item.id && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-accent/20 rounded-2xl p-8 border border-border">
                {contentType === "mensagem" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                    <div className="space-y-6">
                      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-3 border-b border-border bg-accent/30 flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary">
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary">
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            {["nome", "departamento", "evento"].map(v => (
                              <Button key={v} variant="outline" size="sm" className="h-6 px-2 text-[10px] font-extrabold uppercase border-primary/20 text-primary hover:bg-primary/5">
                                {"{{"}{v}{"}}"}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <textarea 
                          placeholder="Escreva sua mensagem aqui..."
                          className="w-full min-h-[250px] p-6 text-navy focus:outline-none resize-none leading-relaxed"
                        />
                        <div className="p-4 border-t border-border bg-accent/10 flex justify-between items-center">
                          <p className="text-[10px] text-muted-fg font-bold uppercase tracking-widest">Aproximadamente 120 caracteres</p>
                          <Button variant="outline" size="sm" className="border-border text-navy hover:bg-accent font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Botão CTA
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-4 shadow-sm relative overflow-hidden border border-border flex flex-col h-[400px]">
                      <div className="bg-[#075E54] p-3 flex items-center gap-3 -mx-4 -mt-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                        <div className="flex-1">
                          <div className="w-24 h-2 bg-white/30 rounded" />
                          <div className="w-16 h-1 bg-white/20 rounded mt-1" />
                        </div>
                      </div>
                      <div className="space-y-4 flex-1 bg-[#E5DDD5] -mx-4 p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl p-3 shadow-sm max-w-[85%] relative">
                          <p className="text-xs text-navy">Olá {"{{"}nome{"}}"}! 👋</p>
                          <div className="mt-2 aspect-video bg-accent/50 rounded-lg flex items-center justify-center border border-dashed border-border">
                             <ImageIcon className="w-6 h-6 text-muted-fg/20" />
                          </div>
                          <p className="text-xs text-navy mt-2 leading-relaxed">Prepare-se para o melhor evento do ano!</p>
                          <span className="text-[8px] text-muted-fg absolute bottom-1 right-2 uppercase font-bold">14:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-manrope font-extrabold text-navy">Selecione o Departamento</h3>
                      <p className="text-sm text-muted-fg mt-1">Escolha o departamento que será responsável por este disparo.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-navy uppercase tracking-widest">Departamento <span className="text-primary">*</span></Label>
                        <Select>
                          <SelectTrigger className="bg-white border-border h-12 rounded-xl">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="suporte">Suporte</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-primary/5 border border-dashed border-primary/30 rounded-xl flex gap-3">
                        <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-xs text-navy font-medium leading-relaxed">
                          Ao selecionar um departamento, as respostas deste disparo serão direcionadas automaticamente para os usuários que estiverem mapeados com este departamento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-manrope font-extrabold text-navy uppercase tracking-tight">Configurações</h2>
                  <p className="text-sm text-muted-fg">Configurações adicionais para o envio</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-sm">
                  <span className="text-muted-fg">Hoje este envio dispara </span>
                  <span className="font-bold text-primary">50 contatos por vez</span>
                  <span className="text-muted-fg">, com pausa de </span>
                  <span className="font-bold text-primary">10 min entre lotes</span>
                  <span className="text-muted-fg"> — cerca de </span>
                  <span className="font-bold text-primary">300 mensagens por hora</span>
                  <span className="text-muted-fg">, somente das </span>
                  <span className="font-bold text-primary">00:00 às 23:59</span>
                  <span className="text-muted-fg">.</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-navy uppercase tracking-widest">Com que rapidez enviar?</Label>
                  <p className="text-[10px] text-muted-fg">Quanto mais rápido, maior a chance das mensagens serem marcadas como spam.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { id: "lento", label: "Lento", speed: "10 contatos a cada 15 min", total: "≈40 por hora", desc: "Ideal para campanhas longas. Nesta opção a chance de banimento é baixa.", risk: "Risco baixo", icon: "🐢" },
                    { id: "medio", label: "Médio (Recomendado)", speed: "50 contatos a cada 10 min", total: "≈300 por hora", desc: "Ideal para as campanhas. Velocidade razoável e risco de banimento baixo.", risk: "Risco baixo", recommended: true, icon: "🐢" },
                    { id: "rapido", label: "Rápido", speed: "100 contatos a cada 5 min", total: "≈1200 por hora", desc: "Entrega mais rápida. Pode causar problemas de banimento.", risk: "Pode causar bloqueio", icon: "🐇" },
                    { id: "manual", label: "Manual", speed: "Você define - sob medida", total: "", desc: "Defina manualmente a velocidade de envio de mensagens da sua campanha.", risk: "Personalizado", icon: "✋" }
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSendingSpeed(item.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-3 relative group",
                        sendingSpeed === item.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{item.icon}</span>
                        {sendingSpeed === item.id && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-sm font-bold", sendingSpeed === item.id ? "text-primary" : "text-navy")}>{item.label}</p>
                        <p className="text-[10px] font-bold text-navy/70">{item.speed} · {item.total}</p>
                      </div>
                      <div className="h-[2px] w-full bg-accent relative overflow-hidden rounded-full">
                        <div className={cn(
                          "absolute top-0 left-0 h-full bg-primary transition-all duration-500",
                          item.id === "lento" ? "w-1/4" : item.id === "medio" ? "w-2/4" : item.id === "rapido" ? "w-full" : "w-0"
                        )} />
                      </div>
                      <p className="text-[10px] text-muted-fg leading-tight">{item.desc}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider",
                          item.id === "rapido" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                        )}>{item.risk}</span>
                        {item.recommended && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Recomendado</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-lg"><Users className="w-4 h-4 text-navy" /></div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-navy">Envio em lotes</h4>
                      <p className="text-[10px] text-muted-fg leading-tight">O sistema manda um grupo de contatos, faz uma pausa e continua. Isso deixa o envio mais natural.</p>
                    </div>
                  </div>

                  <div className="bg-accent/30 rounded-xl p-4 flex gap-4 overflow-x-auto no-scrollbar">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="min-w-[140px] bg-white border border-border rounded-lg p-3 text-center space-y-1.5">
                        <p className="text-[10px] font-black text-primary uppercase">Lote {i}</p>
                        <p className="text-xs font-bold text-navy">50 contatos</p>
                        <div className="flex items-center justify-center gap-1.5 pt-1.5 border-t border-accent">
                          <Clock className="w-3 h-3 text-muted-fg" />
                          <span className="text-[10px] font-bold text-muted-fg">10 min</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy uppercase tracking-widest">Contatos por lote</Label>
                      <Input 
                        type="number" 
                        value={contactsPerBatch}
                        onChange={(e) => setContactsPerBatch(Number(e.target.value))}
                        className="bg-accent/30 border-border h-11 rounded-xl font-bold text-navy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-navy uppercase tracking-widest">Intervalo entre lotes (em minutos)</Label>
                      <Input 
                        type="number" 
                        value={intervalBetweenBatches}
                        onChange={(e) => setIntervalBetweenBatches(Number(e.target.value))}
                        className="bg-accent/30 border-border h-11 rounded-xl font-bold text-navy"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/5 text-primary p-3 rounded-xl flex items-center gap-3 border border-primary/10">
                    <Clock className="w-4 h-4" />
                    <p className="text-[10px] font-bold">Os horários abaixo seguem o fuso horário do projeto: America/Sao Paulo.</p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-accent p-2 rounded-lg"><Calendar className="w-4 h-4 text-navy" /></div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-navy">Agendar data e hora de início?</h4>
                        <p className="text-[10px] text-muted-fg leading-tight">Define quando a campanha deve começar a enviar. Se não selecionado, começa imediatamente.</p>
                      </div>
                    </div>
                    <Switch checked={isScheduled} onCheckedChange={setIsScheduled} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-border p-6 space-y-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent p-2 rounded-lg"><Clock className="w-4 h-4 text-navy" /></div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-navy">Horário permitido</h4>
                      <p className="text-[10px] text-muted-fg leading-tight">Fora dessa faixa o envio pausa e volta sozinho no dia seguinte.</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center py-4">
                    <div className="relative h-6 w-full mb-8">
                      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-primary rounded-full" />
                      {[0, 6, 12, 18, 24].map(h => (
                        <div key={h} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1" style={{ left: `${(h / 24) * 100}%` }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary border-2 border-white shadow-sm" />
                          <span className="text-[10px] font-bold text-muted-fg mt-4">{h}h</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 justify-center mt-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-navy uppercase tracking-widest">Começa às</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-24 bg-accent/30 border-border h-11 rounded-xl font-bold text-navy text-center"
                          />
                          <Clock className="w-4 h-4 text-muted-fg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-navy uppercase tracking-widest">Para às</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-24 bg-accent/30 border-border h-11 rounded-xl font-bold text-navy text-center"
                          />
                          <Clock className="w-4 h-4 text-muted-fg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold h-14 rounded-2xl shadow-xl shadow-primary/30 text-lg uppercase tracking-tight mt-auto"
                    onClick={() => {
                      // Final logic
                      onOpenChange(false);
                    }}
                  >
                    <Rocket className="w-5 h-5 mr-3" /> Iniciar Envio Agora
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

