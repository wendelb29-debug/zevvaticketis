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

  const removeColumn = (index: number) => {
    setCsvPreview(prev => prev.map(row => row.filter((_, i) => i !== index)));
  };

  // Configurações de envio states
  const [sendingSpeed, setSendingSpeed] = useState("medio");
  const [contactsPerBatch, setContactsPerBatch] = useState(50);
  const [intervalBetweenBatches, setIntervalBetweenBatches] = useState(10);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [isScheduled, setIsScheduled] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageImage, setMessageImage] = useState<string | null>(null);
  const [ctaButtons, setCtaButtons] = useState<{ id: string; label: string }[]>([]);

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const canGoNext = 
    step === 1 ? campaignName.trim().length > 0 : 
    step === 2 ? uploadedFile !== null : 
    step === 3 ? csvPreview.length > 0 :
    true;

  const steps = [
    { number: 1, label: "Dados", sublabel: "Definição dos dados do envio" },
    { number: 2, label: "Público Alvo", sublabel: "Seleção de público para o envio" },
    { number: 3, label: "Correspondência", sublabel: "Mapeamento de colunas" },
    { number: 4, label: "Conteúdo", sublabel: "Definição do conteúdo a ser enviado" },
    { number: 5, label: "Configurações", sublabel: "Configurações adicionais para o envio" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-card border border-border text-foreground rounded-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="p-0 border-b border-border bg-card relative">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-manrope font-extrabold text-foreground">Nova Campanha</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Configure seu envio WhatsApp ou E-mail</p>
            </div>
            
            <div className="flex items-center gap-6 xl:gap-12 flex-1 justify-center overflow-x-auto no-scrollbar mx-4 py-2">
              {steps.map((s) => (
                <button 
                  key={s.number} 
                  className={cn(
                    "flex items-center gap-2 relative transition-all duration-300",
                    s.number > step && "opacity-50 cursor-not-allowed",
                    s.number <= step && "cursor-pointer hover:opacity-80"
                  )}
                  onClick={() => {
                    if (s.number < step) {
                      setStep(s.number as Step);
                    } else if (s.number === step) {
                      // Do nothing
                    } else {
                      // Only allow jumping forward if validation passes (canGoNext)
                      // and it's the immediate next step. For simplicity and safety,
                      // we usually only allow clicking previous steps.
                    }
                  }}
                  disabled={s.number > step}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                    step === s.number ? "bg-primary text-primary-foreground border-primary shadow-sm" : 
                    step > s.number ? "bg-card text-primary border-primary" : "bg-card text-foreground border-[#E5E7EB]"
                  )}>
                    {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest hidden xl:inline",
                    step === s.number ? "text-primary" : "text-foreground"
                  )}>{s.label}</span>
                  {s.number < 5 && (
                    <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-[#E5E7EB]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Button 
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="border-[#E5E7EB] text-foreground hover:bg-muted font-bold px-6 h-11 rounded-xl"
              >
                Voltar
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canGoNext || step === 5}
                className="bg-primary hover:bg-[#D95342] text-primary-foreground font-bold px-8 h-11 rounded-xl shadow-lg shadow-[#F06452]/20"
              >
                Continuar
              </Button>
            </div>
          </div>
        </DialogHeader>


        <ScrollArea className="flex-1 bg-card">
          <div className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-foreground uppercase tracking-tight">Dados da campanha</h2>
                  <p className="text-sm text-muted-foreground mt-1">Defina o nome e os canais de envio da sua campanha</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-foreground uppercase tracking-widest">Nome da campanha <span className="text-primary">*</span></Label>
                    <Input 
                      placeholder="Ex: Show Ana Carolina - Lembrete" 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="bg-card border-[#E5E7EB] text-foreground h-12 rounded-xl focus-visible:ring-[#F06452]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black text-foreground uppercase tracking-widest">Escolha o canal <span className="text-primary">*</span></Label>
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => setChannelType("gupshup")}
                        className={cn(
                          "flex items-center p-5 rounded-2xl border-2 transition-all duration-300 gap-4 group text-left",
                          channelType === "gupshup" 
                            ? "bg-primary/10 border-primary shadow-sm" 
                            : "bg-card border-[#E5E7EB] hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          channelType === "gupshup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-bold", channelType === "gupshup" ? "text-primary" : "text-foreground")}>Enviar pelo WhatsApp</p>
                          <p className="text-[11px] text-muted-foreground font-medium">Envie mensagens para clientes e participantes.</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setChannelType("email")}
                        className={cn(
                          "flex items-center p-5 rounded-2xl border-2 transition-all duration-300 gap-4 group text-left",
                          channelType === "email" 
                            ? "bg-primary/10 border-primary shadow-sm" 
                            : "bg-card border-[#E5E7EB] hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          channelType === "email" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <Mail className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-bold", channelType === "email" ? "text-primary" : "text-foreground")}>Enviar por E-mail</p>
                          <p className="text-[11px] text-muted-foreground font-medium">Crie campanhas profissionais.</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-foreground uppercase tracking-widest">Canal de saída <span className="text-primary">*</span></Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="bg-card border-[#E5E7EB] text-foreground h-12 rounded-xl">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-[#E5E7EB]">
                        <SelectItem value="savecar">Zevva Oficial - 34 9867-9585</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>


              <div className="bg-muted rounded-3xl flex items-center justify-center p-12 border border-[#E5E7EB]">
                <div className="max-w-md w-full text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="bg-primary/10 p-5 rounded-[2rem]">
                      <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl shadow-[#F06452]/20">
                        {channelType === "email" ? <Mail className="w-10 h-10" /> : <MessageSquare className="w-10 h-10" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black rounded-full border border-primary/10 uppercase tracking-[0.1em]">
                      Zevva Campaigns
                    </div>
                    <h3 className="text-2xl font-manrope font-extrabold text-foreground">Crie mensagens premium</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Personalize cada disparo e aumente sua conversão com a tecnologia Zevva.</p>
                  </div>
                  
                  <div className="bg-card rounded-2xl p-6 border border-[#E5E7EB] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <div className="space-y-4 text-left">
                      <div className="bg-muted text-foreground px-4 py-2.5 rounded-xl text-sm font-bold inline-block border border-[#E5E7EB]">
                        Olá <span className="text-primary">{"{{"}nome{"}}"}</span>! 👋
                      </div>
                      <div className="bg-muted rounded-xl aspect-[16/9] flex items-center justify-center border border-dashed border-[#E5E7EB] group-hover:bg-muted transition-colors">
                        <div className="text-center space-y-2">
                          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Sua Imagem Aqui</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-foreground uppercase tracking-tight">Público Alvo</h2>
                  <p className="text-sm text-muted-foreground mt-1">Selecione o público que receberá as mensagens da sua campanha</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-foreground uppercase tracking-widest">Origem dos contatos</Label>
                    
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
                            "p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group",
                            publicType === item.id 
                              ? "bg-primary/10 border-primary shadow-sm" 
                              : "bg-card border-[#E5E7EB] hover:border-primary/30"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            publicType === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm font-bold", publicType === item.id ? "text-primary" : "text-foreground")}>{item.label}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            publicType === item.id ? "border-primary bg-primary" : "border-[#E5E7EB]"
                          )}>
                            {publicType === item.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-3xl p-8 border border-[#E5E7EB]">

                {publicType === "arquivo" && (
                  <div className="h-full flex flex-col space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-xs font-black text-foreground uppercase tracking-widest">DDI padrão</Label>
                        <div className="bg-card p-4 rounded-xl border border-[#E5E7EB] flex items-center gap-3 shadow-sm">
                           <span className="text-2xl">🇧🇷</span>
                           <span className="text-sm font-bold text-foreground">Brasil (+55)</span>
                           <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-xs font-black text-foreground uppercase tracking-widest">Ações</Label>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-dashed border-primary/40 text-primary hover:bg-primary/10 h-14 rounded-xl font-bold"
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
                        <div className="w-full max-w-xl aspect-[16/7] border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 bg-card hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer group shadow-sm relative">
                          <input 
                            type="file" 
                            accept=".csv, .xlsx" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadedFile(file);
                                setCsvPreview([
                                  ["telefone", "urlLink", "body1", "body2"],
                                  ["(34)9966-01526", "https://mundialeassociacoes.s...", "JOSE VALTER DA SILVA SANT...", "OQB9980"],
                                  ["(34)9970-91428", "https://mundialeassociacoes.s...", "VANDERLEI ANTONIO ROSA", "HLZ4A76"],
                                  ["(34)99928-3379", "https://mundialeassociacoes.s...", "DAIANE OLIVEIRA CONSTANTI...", "BES5F59"]
                                ]);
                              }
                            }}
                          />
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Plus className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-lg font-manrope font-extrabold text-foreground">Importar arquivo</p>
                            <p className="text-sm text-muted-foreground font-medium">Nessa parte poder arrastar pra cá o arquivo ou clicar pra abrir somente arquivos CSV ou XLSX do computador</p>
                            <div className="flex gap-2 justify-center mt-4">
                               <span className="px-3 py-1 bg-muted text-[10px] font-black text-muted-foreground rounded-lg">CSV</span>
                               <span className="px-3 py-1 bg-muted text-[10px] font-black text-muted-foreground rounded-lg">XLSX</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-card rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[#E5E7EB] bg-muted flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{uploadedFile.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{(uploadedFile.size / 1024).toFixed(1)} KB • {csvPreview.length - 1} contatos encontrados</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-wider">
                            <Check className="w-3 h-3" /> Arquivo Carregado
                          </div>
                        </div>
                        
                        <div className="p-4 border-b border-[#E5E7EB] bg-amber-50 flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <p className="text-xs font-semibold text-amber-700">Confirme se os cabeçalhos das colunas estão corretos antes de prosseguir.</p>
                        </div>

                        <ScrollArea className="flex-1">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-muted z-10">
                              <tr>
                                <th className="p-4 border-b border-[#E5E7EB] text-[10px] font-black text-muted-foreground uppercase tracking-widest w-12 text-center">#</th>
                                {csvPreview[0]?.map((header, i) => (
                                  <th key={i} className="p-4 border-b border-[#E5E7EB] text-[10px] font-black text-foreground uppercase tracking-widest">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-[#E5E7EB] hover:bg-muted/80 transition-colors">
                                  <td className="p-4 text-center">
                                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center mx-auto">
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                  </td>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="p-4 text-sm font-medium text-foreground truncate max-w-[200px]">{cell}</td>
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
                        <h3 className="text-lg font-manrope font-extrabold text-foreground">Filtre sua base Zevva</h3>
                        <p className="text-sm text-muted-foreground-fg mt-1">Defina as condições para segmentar seu público</p>
                      </div>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-bold">
                        <Filter className="w-4 h-4 mr-2" /> Adicionar Filtro
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">Contatos Selecionados <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] ml-2">0</span></p>
                      </div>
                      <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-accent/50">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-foreground-fg uppercase tracking-widest">Nome</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-foreground-fg uppercase tracking-widest">Telefone</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold text-muted-foreground-fg uppercase tracking-widest">Tags</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground-fg italic text-sm">
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
                      <h3 className="text-lg font-manrope font-extrabold text-foreground">Entrada Manual</h3>
                      <p className="text-sm text-muted-foreground-fg mt-1">Adicione os contatos que receberão as mensagens.</p>
                    </div>

                    <div className="bg-primary/5 border border-dashed border-primary/30 p-4 rounded-xl flex gap-3">
                       <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                       <p className="text-xs text-foreground font-medium">Você pode colar uma lista no formato <strong>Nome, Telefone</strong>. Colunas extras serão tratadas como variáveis personalizadas.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-foreground uppercase tracking-widest">
                          <span className="text-primary">{"{ }"}</span> Variáveis Dinâmicas
                        </div>
                        <div className="flex gap-3">
                           <Input placeholder="Ex: empresa, cpf..." className="bg-accent/30 border-border h-11 text-sm rounded-xl" />
                           <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5 h-11 px-6 rounded-xl font-bold">
                             <Plus className="w-4 h-4 mr-2" /> Variável
                           </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground-fg italic font-medium">As variáveis ficam disponíveis no criador de conteúdo.</p>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr_48px] gap-4 items-end">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">Nome completo</Label>
                          <Input placeholder="Nome do contato" className="bg-accent/30 border-border h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">Whatsapp / Telefone</Label>
                          <div className="flex">
                            <div className="bg-accent/50 border border-r-0 border-border h-12 px-4 flex items-center gap-2 rounded-l-xl">
                              <span className="text-xl">🇧🇷</span>
                              <span className="text-xs font-bold text-foreground">+55</span>
                            </div>
                            <Input placeholder="(00) 00000-0000" className="bg-accent/30 border-border h-12 rounded-l-none rounded-r-xl" />
                          </div>
                        </div>
                        <div>
                           <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground-fg/40 hover:text-error hover:bg-error/10 rounded-xl">
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
                <h2 className="text-xl font-manrope font-extrabold text-foreground uppercase tracking-tight">Corresponder colunas</h2>
                <p className="text-sm text-muted-foreground-fg mt-1">Relacione as colunas da planilha aos campos obrigatórios e variáveis do template.</p>
              </div>

              <div className="p-5 bg-muted border border-[#E5E7EB] rounded-2xl flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-primary" />
                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  Exibindo as 3 primeiras linhas do arquivo para você estabelecer o vínculo visual entre as colunas e os campos. 
                  É obrigatório ter pelo menos uma coluna mapeada como <span className="font-bold text-primary">Telefone</span>.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      {csvPreview[0]?.map((header, i) => (
                        <th key={i} className="p-6 border-b border-[#E5E7EB] bg-muted/50">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-foreground uppercase tracking-widest">{header}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                onClick={() => removeColumn(i)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Select defaultValue={i === 0 ? "nome" : i === 2 ? "telefone" : "variavel"}>
                              <SelectTrigger className="bg-card border-[#E5E7EB] h-11 rounded-xl focus:ring-[#F06452]">
                                <SelectValue placeholder="Selecione o campo" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-[#E5E7EB]">
                                <SelectItem value="nome">Nome</SelectItem>
                                <SelectItem value="telefone">Telefone</SelectItem>
                                <SelectItem value="departamento">Departamento</SelectItem>
                                <SelectItem value="variavel">Variável de fluxo</SelectItem>
                                <SelectItem value="descartar">Descartar</SelectItem>
                              </SelectContent>
                            </Select>
                            {(i === 0 || i === 2) ? (
                              <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 text-[10px] font-black flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Mapeado
                              </div>
                            ) : (
                              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/10 text-[10px] font-black uppercase tracking-tight">
                                Variável: {header.toLowerCase()}
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(1, 4).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#E5E7EB] hover:bg-muted transition-colors">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-6 text-sm font-medium text-muted-foreground italic truncate max-w-[200px]">
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
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-manrope font-extrabold text-foreground uppercase tracking-tight">Conteúdo</h2>
                  <p className="text-sm text-muted-foreground mt-1">Definição do conteúdo a ser enviado</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-black text-foreground uppercase tracking-widest">Tipo de conteúdo</Label>
                  <div className="space-y-3">
                    {[
                      { id: "mensagem", label: "Criar mensagem", desc: "Selecione o template a enviar e configure as variáveis e ações de botões.", icon: MessageSquare, badge: "NEW" },
                      { id: "departamento", label: "Enviar por departamento", desc: "A execução é feita pelos usuários que estiverem mapeados com este departamento.", icon: Users },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setContentType(item.id)}
                        className={cn(
                          "p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group",
                          contentType === item.id 
                            ? "bg-primary/10 border-primary shadow-sm" 
                            : "bg-card border-[#E5E7EB] hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          contentType === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-sm font-bold", contentType === item.id ? "text-primary" : "text-foreground")}>{item.label}</p>
                            {item.badge && <span className="bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-md font-black">{item.badge}</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5">{item.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          contentType === item.id ? "border-primary bg-primary" : "border-[#E5E7EB]"
                        )}>
                          {contentType === item.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-3xl p-8 border border-[#E5E7EB]">
                {contentType === "mensagem" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                    <div className="space-y-6">
                      <div className="bg-card border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-[#E5E7EB] bg-muted flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10">
                              <Smile className="w-5 h-5" />
                            </Button>
                            <label className="cursor-pointer">
                              <div className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setMessageImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            {["nome", "departamento"].map(v => (
                              <Button 
                                key={v} 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-3 text-[10px] font-black uppercase border-primary/20 text-primary hover:bg-primary/10 rounded-lg"
                                onClick={() => setMessageText(prev => prev + `{{${v}}}`)}
                              >
                                {"{{"}{v}{"}}"}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <textarea 
                          placeholder="Escreva sua mensagem aqui..."
                          className="w-full min-h-[250px] p-6 text-foreground focus:outline-none resize-none leading-relaxed text-sm bg-card"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className="p-4 border-t border-[#E5E7EB] bg-muted flex justify-between items-center">
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Aprox. {messageText.length} caracteres</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[#E5E7EB] text-foreground hover:bg-card font-bold h-9 rounded-xl"
                            onClick={() => setCtaButtons(prev => [...prev, { id: crypto.randomUUID(), label: "Clique aqui" }])}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Botão CTA
                          </Button>
                        </div>
                      </div>
                      
                      {ctaButtons.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-foreground uppercase tracking-widest">Botões CTA</Label>
                          {ctaButtons.map((btn) => (
                            <div key={btn.id} className="flex gap-2">
                              <Input 
                                value={btn.label}
                                onChange={(e) => setCtaButtons(prev => prev.map(b => b.id === btn.id ? { ...b, label: e.target.value } : b))}
                                className="bg-card border-[#E5E7EB] h-10 rounded-xl flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground-fg hover:text-primary"
                                onClick={() => setCtaButtons(prev => prev.filter(b => b.id !== btn.id))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#E5DDD5] rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden border border-[#D1D7DB] flex flex-col h-auto min-h-[500px]">
                      {/* WhatsApp Header */}
                      <div className="bg-[#008069] p-4 flex items-center gap-3 -mx-4 -mt-4 mb-4">
                        <div className="w-9 h-9 rounded-full bg-[#D1D7DB] flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">Zevva Business</div>
                          <div className="text-white/70 text-[10px]">online</div>
                        </div>
                      </div>

                      {/* Message Area */}
                      <div className="space-y-4 flex-1 -mx-4 p-5 overflow-y-auto">
                        <div className="bg-card rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] max-w-[85%] relative ml-2">
                          {/* Triangle tip */}
                          <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent" />
                          
                          <div className="p-2 pb-1">
                            {messageImage && (
                              <div className="mb-2 overflow-hidden rounded-md">
                                <img src={messageImage} alt="Preview" className="w-full h-auto object-cover max-h-60" />
                              </div>
                            )}
                            
                            {!messageImage && messageText && (
                              <div className="mb-2 aspect-video bg-[#F0F2F5] rounded-md flex items-center justify-center">
                                 <ImageIcon className="w-8 h-8 text-[#ACB1B6]" />
                              </div>
                            )}

                            <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#111b21] px-1">
                              {messageText || "Escreva sua mensagem aqui..."}
                            </div>
                            
                            <div className="flex justify-end items-center gap-1 mt-1">
                              <span className="text-[10px] text-[#667781]">14:30</span>
                              <Check className="w-3 h-3 text-[#53bdeb]" />
                            </div>
                          </div>

                          {/* CTA Buttons - WhatsApp Style */}
                          {ctaButtons.length > 0 && (
                            <div className="border-t border-[#f0f2f5] mt-1">
                              {ctaButtons.map((btn) => (
                                <div key={btn.id} className="py-2.5 px-4 flex items-center justify-center gap-2 border-b last:border-b-0 border-[#f0f2f5] cursor-default bg-card hover:bg-[#f8f9fa] active:bg-[#f1f2f3] transition-colors first:rounded-b-none last:rounded-b-lg">
                                  <MousePointer2 className="w-3.5 h-3.5 text-[#00a884]" />
                                  <span className="text-[14px] font-normal text-[#00a884]">{btn.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-manrope font-extrabold text-foreground">Selecione o Departamento</h3>
                      <p className="text-sm text-muted-foreground mt-1">Escolha o setor responsável por este disparo.</p>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground uppercase tracking-widest">Departamento <span className="text-primary">*</span></Label>
                        <Select>
                          <SelectTrigger className="bg-card border-[#E5E7EB] h-12 rounded-xl focus:ring-[#F06452]">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-[#E5E7EB]">
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="suporte">Suporte</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-5 bg-primary/10 border border-dashed border-primary/20 rounded-2xl flex gap-4">
                        <HelpCircle className="w-6 h-6 text-primary shrink-0" />
                        <p className="text-xs text-foreground font-semibold leading-relaxed">
                          As respostas deste disparo serão direcionadas automaticamente para os usuários vinculados a este departamento.
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
                  <h2 className="text-xl font-manrope font-extrabold text-foreground uppercase tracking-tight">Configurações</h2>
                  <p className="text-sm text-muted-foreground">Configurações adicionais para o envio</p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-[#F06452]/20">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-sm text-foreground">
                  <span className="text-muted-foreground">Hoje este envio dispara </span>
                  <span className="font-black text-primary">50 contatos por vez</span>
                  <span className="text-muted-foreground">, com pausa de </span>
                  <span className="font-black text-primary">10 min entre lotes</span>
                  <span className="text-muted-foreground"> — cerca de </span>
                  <span className="font-black text-primary">300 mensagens por hora</span>
                  <span className="text-muted-foreground">, somente das </span>
                  <span className="font-black text-primary">00:00 às 23:59</span>
                  <span className="text-muted-foreground">.</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-black text-foreground uppercase tracking-widest">Com que rapidez enviar?</Label>
                  <p className="text-[11px] text-muted-foreground font-medium">Quanto mais rápido, maior a chance das mensagens serem marcadas como spam.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { id: "lento", label: "Lento", speed: "10 contatos / 15 min", total: "≈40/h", risk: "Risco baixo", icon: "🐢" },
                    { id: "medio", label: "Médio (Rec.)", speed: "50 contatos / 10 min", total: "≈300/h", risk: "Risco baixo", recommended: true, icon: "🐢" },
                    { id: "rapido", label: "Rápido", speed: "100 contatos / 5 min", total: "≈1200/h", risk: "Risco moderado", icon: "🐇" },
                    { id: "manual", label: "Manual", speed: "Defina você mesmo", total: "", risk: "Personalizado", icon: "✋" }
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSendingSpeed(item.id)}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-4 relative group",
                        sendingSpeed === item.id ? "bg-primary/10 border-primary shadow-sm" : "bg-card border-[#E5E7EB] hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        {sendingSpeed === item.id && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md shadow-[#F06452]/20"><Check className="w-3 h-3 text-white" /></div>}
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-sm font-bold", sendingSpeed === item.id ? "text-primary" : "text-foreground")}>{item.label}</p>
                        <p className="text-[10px] font-black text-foreground/70 uppercase tracking-tight">{item.speed}</p>
                      </div>
                      <div className="h-1.5 w-full bg-muted relative overflow-hidden rounded-full">
                        <div className={cn(
                          "absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-in-out",
                          item.id === "lento" ? "w-1/4" : item.id === "medio" ? "w-2/4" : item.id === "rapido" ? "w-full" : "w-0"
                        )} />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight",
                          item.id === "rapido" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                        )}>{item.risk}</span>
                        {item.recommended && <span className="bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight">Recomendado</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-[2rem] border border-[#E5E7EB] p-8 space-y-6 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2.5 rounded-xl"><Users className="w-5 h-5 text-foreground" /></div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Envio em lotes</h4>
                      <p className="text-[11px] text-muted-foreground leading-tight font-medium">O sistema manda um grupo, pausa e continua. Mais natural.</p>
                    </div>
                  </div>

                  <div className="bg-muted rounded-2xl p-5 flex gap-4 overflow-x-auto no-scrollbar border border-[#E5E7EB]">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="min-w-[150px] bg-card border border-[#E5E7EB] rounded-xl p-4 text-center space-y-2 shadow-sm">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Lote {i}</p>
                        <p className="text-sm font-black text-foreground">50 contatos</p>
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-50">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] font-bold text-muted-foreground">10 min</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-foreground uppercase tracking-widest">Contatos / Lote</Label>
                      <Input 
                        type="number" 
                        value={contactsPerBatch}
                        onChange={(e) => setContactsPerBatch(Number(e.target.value))}
                        className="bg-card border-[#E5E7EB] h-12 rounded-xl font-bold text-foreground focus:ring-[#F06452]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-foreground uppercase tracking-widest">Pausa (minutos)</Label>
                      <Input 
                        type="number" 
                        value={intervalBetweenBatches}
                        onChange={(e) => setIntervalBetweenBatches(Number(e.target.value))}
                        className="bg-card border-[#E5E7EB] h-12 rounded-xl font-bold text-foreground focus:ring-[#F06452]"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 text-primary p-4 rounded-xl flex items-center gap-3 border border-primary/10">
                    <Clock className="w-5 h-5" />
                    <p className="text-[10px] font-black uppercase tracking-tight">Fuso horário: America/Sao Paulo</p>
                  </div>

                  <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2.5 rounded-xl"><Calendar className="w-5 h-5 text-foreground" /></div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Agendar início?</h4>
                        <p className="text-[11px] text-muted-foreground leading-tight font-medium">Define quando a campanha deve começar.</p>
                      </div>
                    </div>
                    <Switch checked={isScheduled} onCheckedChange={setIsScheduled} className="data-[state=checked]:bg-primary" />
                  </div>
                </div>

                <div className="bg-card rounded-[2rem] border border-[#E5E7EB] p-8 space-y-6 shadow-xl shadow-slate-200/50 flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2.5 rounded-xl"><Clock className="w-5 h-5 text-foreground" /></div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Horário permitido</h4>
                      <p className="text-[11px] text-muted-foreground leading-tight font-medium">Fora dessa faixa o envio pausa e volta no dia seguinte.</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center py-6">
                    <div className="relative h-2 w-full mb-10 bg-muted rounded-full">
                      <div className="absolute top-0 left-0 w-full h-full bg-primary/20 rounded-full" />
                      {[0, 6, 12, 18, 24].map(h => (
                        <div key={h} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2" style={{ left: `${(h / 24) * 100}%` }}>
                          <div className="w-3 h-3 rounded-full bg-card border-2 border-primary shadow-sm" />
                          <span className="text-[11px] font-black text-muted-foreground mt-5">{h}h</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-8 justify-center mt-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground uppercase tracking-widest">Começa às</Label>
                        <div className="flex items-center gap-3">
                          <Input 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-28 bg-card border-[#E5E7EB] h-12 rounded-xl font-bold text-foreground text-center focus:ring-[#F06452]"
                          />
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-foreground uppercase tracking-widest">Para às</Label>
                        <div className="flex items-center gap-3">
                          <Input 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-28 bg-card border-[#E5E7EB] h-12 rounded-xl font-bold text-foreground text-center focus:ring-[#F06452]"
                          />
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-[#D95342] text-white font-black h-16 rounded-[1.25rem] shadow-2xl shadow-[#F06452]/30 text-lg uppercase tracking-widest mt-auto transition-all transform active:scale-[0.98]"
                    onClick={() => onOpenChange(false)}
                  >
                    <Rocket className="w-6 h-6 mr-3" /> Iniciar Envio Agora
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

