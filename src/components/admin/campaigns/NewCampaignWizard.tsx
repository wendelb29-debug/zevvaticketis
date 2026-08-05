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
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewCampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function NewCampaignWizard({ open, onOpenChange }: NewCampaignWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<"whatsapp" | "email">("whatsapp");
  const [name, setName] = useState("");

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-6 border-b border-border bg-surface">
          <DialogTitle className="text-xl font-manrope font-extrabold text-navy">
            {step === 1 && "Etapa 1 - Tipo de envio"}
            {step === 2 && "Etapa 2 - Selecionar Público"}
            {step === 3 && (type === "whatsapp" ? "Etapa 3 - Criador de Mensagem WhatsApp" : "Etapa 3 - Criador de E-mail")}
            {step === 4 && "Etapa 4 - Pré-visualização"}
            {step === 5 && "Etapa 5 - Configuração de envio"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 min-h-[500px]">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-4">
                <Label className="text-sm font-bold text-muted-fg uppercase tracking-wider">Nome da Campanha</Label>
                <Input 
                  placeholder="Ex: Show Ana Carolina - Lembrete" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg font-medium bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setType("whatsapp")}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200",
                    type === "whatsapp" 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                      : "border-border bg-background hover:border-border/80"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    type === "whatsapp" ? "bg-primary text-white" : "bg-muted text-muted-fg"
                  )}>
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-extrabold text-navy">WhatsApp</p>
                    <p className="text-xs text-muted-fg mt-1 italic leading-relaxed">
                      Envie mensagens para clientes e participantes via WhatsApp.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setType("email")}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200",
                    type === "email" 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                      : "border-border bg-background hover:border-border/80"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    type === "email" ? "bg-primary text-white" : "bg-muted text-muted-fg"
                  )}>
                    <Mail className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-extrabold text-navy">E-mail</p>
                    <p className="text-xs text-muted-fg mt-1 italic leading-relaxed">
                      Envie campanhas profissionais por e-mail.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-muted-fg uppercase tracking-wider">Tipo de Público</Label>
                  <RadioGroup defaultValue="clientes" className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-surface/50 transition-colors">
                      <RadioGroupItem value="clientes" id="clientes" />
                      <Label htmlFor="clientes" className="font-bold cursor-pointer">Clientes Zevva</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-surface/50 transition-colors">
                      <RadioGroupItem value="lista" id="lista" />
                      <Label htmlFor="lista" className="font-bold cursor-pointer">Importar Lista (CSV/Excel)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold text-muted-fg uppercase tracking-wider">Eventos Específicos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                    <Input placeholder="Buscar evento, curso ou caravana..." className="pl-10 h-11" />
                  </div>
                  <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { label: "Show Ana Carolina", type: "Evento" },
                      { label: "Caravana Terra Santa", type: "Caravana" },
                      { label: "Curso Marketing Digital", type: "Curso" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border border-line rounded-lg hover:border-primary/30 transition-all group">
                        <Checkbox id={} />
                        <div className="flex-1">
                          <Label htmlFor={} className="text-sm font-bold block group-hover:text-primary transition-colors cursor-pointer">{item.label}</Label>
                          <span className="text-[10px] uppercase font-extrabold text-muted-fg">{item.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface rounded-2xl border border-line">
                <h4 className="text-xs font-bold text-muted-fg uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Filtros Avançados
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Cidade", "Estado", "Data da compra", "Valor gasto"].map((filter) => (
                    <div key={filter} className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-fg uppercase">{filter}</Label>
                      <Input placeholder="Qualquer" className="h-9 text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && type === "whatsapp" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-navy">Mensagem</Label>
                  <div className="relative border border-border rounded-xl overflow-hidden shadow-sm">
                    <textarea 
                      className="w-full h-48 p-4 text-sm font-medium bg-background resize-none focus:outline-none"
                      placeholder="Olá {{nome}}, seu ingresso para {{evento}} está confirmado!"
                    />
                    <div className="flex items-center gap-2 p-3 bg-surface border-t border-border">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary transition-colors">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-fg hover:text-primary transition-colors">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <div className="h-4 w-[1px] bg-border mx-1" />
                      <div className="flex gap-1">
                        {["nome", "evento", "data"].map(v => (
                          <button key={v} className="text-[10px] font-bold px-2 py-1 bg-white border border-line rounded text-muted-fg hover:border-primary transition-colors">
                            {{`{{${v}}}` }}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-navy">Botões de Ação</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full border-dashed text-muted-fg font-bold h-12 hover:text-primary hover:border-primary/50 transition-all">
                      + Adicionar Botão (Ver Ingresso, etc.)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-[#E5DDD5] rounded-2xl p-6 relative min-h-[400px] border border-line shadow-inner overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-14 bg-[#075E54] flex items-center px-4 gap-3 shadow-md z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-bold leading-none">WhatsApp Zevva</p>
                    <p className="text-[10px] opacity-70 mt-1">Online</p>
                  </div>
                </div>
                
                <div className="mt-12 space-y-4">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] relative border border-[#d1d7db]">
                    <p className="text-xs text-navy">
                      Olá <strong>João</strong>, seu ingresso para <strong>Show Ana Carolina</strong> está confirmado.
                    </p>
                    <p className="text-[9px] text-muted-fg text-right mt-1">10:00</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm max-w-[85%] overflow-hidden border border-[#d1d7db]">
                    <div className="bg-muted aspect-video flex items-center justify-center text-muted-fg/30">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-navy">QR Code de Entrada</p>
                      <p className="text-[9px] text-muted-fg mt-1 italic">Arquivo: ingresso-283.pdf</p>
                    </div>
                  </div>

                  <button className="w-[85%] bg-white py-2 rounded-lg shadow-sm text-[11px] font-bold text-[#00a884] border border-[#d1d7db] hover:bg-gray-50 transition-colors">
                    Ver ingresso
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-navy uppercase tracking-wider">Quando enviar?</h4>
                <RadioGroup defaultValue="agora" className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-6 border border-border rounded-2xl hover:bg-surface/50 transition-colors shadow-sm cursor-pointer group">
                    <RadioGroupItem value="agora" id="agora" />
                    <Label htmlFor="agora" className="font-extrabold cursor-pointer group-hover:text-primary transition-colors">Enviar agora</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-6 border border-border rounded-2xl hover:bg-surface/50 transition-colors shadow-sm cursor-pointer group">
                    <RadioGroupItem value="agendar" id="agendar" />
                    <Label htmlFor="agendar" className="font-extrabold cursor-pointer group-hover:text-primary transition-colors">Agendar envio</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-fg">Data</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                    <Input type="date" className="pl-10 h-11 bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-fg">Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                    <Input type="time" className="pl-10 h-11 bg-background" />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-surface rounded-2xl border border-line shadow-sm">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-6 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" /> Controle de disparo
                </h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-navy">Limite por minuto</p>
                      <p className="text-[10px] text-muted-fg italic">Evita bloqueios nos canais.</p>
                    </div>
                    <Input type="number" defaultValue="30" className="w-24 h-10 text-center font-bold" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-navy">Pausar em caso de erro</p>
                      <p className="text-[10px] text-muted-fg italic">Para a campanha se houver falhas consecutivas.</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-border bg-surface">
          <div className="flex items-center justify-between w-full">
            <Button 
              variant="outline" 
              onClick={step === 1 ? () => onOpenChange(false) : prevStep}
              className="px-6 font-bold border-line hover:bg-white transition-colors"
            >
              {step === 1 ? "Cancelar" : (
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </div>
              )}
            </Button>
            
            <Button 
              onClick={step === 5 ? () => onOpenChange(false) : nextStep}
              className="px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold shadow-lg shadow-primary/20"
            >
              {step === 5 ? (
                <div className="flex items-center gap-2">
                  Finalizar e Programar <Send className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Continuar <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
