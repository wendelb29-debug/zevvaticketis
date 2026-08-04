import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  MapPin, 
  Clock, 
  Image as ImageIcon, 
  DollarSign, 
  CheckCircle2,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produtor/novo-evento")({
  component: NewEventWizard,
});

function NewEventWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const steps = [
    { id: 1, title: "Básico", icon: Info },
    { id: 2, title: "Local e Data", icon: MapPin },
    { id: 3, title: "Regional", icon: Globe },
    { id: 4, title: "Mídia", icon: ImageIcon },
    { id: 5, title: "Políticas", icon: CheckCircle2 },
  ];

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <div className="flex items-center gap-4 mb-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate({ to: '/produtor' })}
          className="rounded-full text-navy"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-heading font-extrabold text-navy">Criar novo evento</h1>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-line -z-10 -translate-y-1/2" />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2 group">
            <div 
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                step === s.id ? "bg-gold border-gold text-white shadow-lg shadow-gold/30" : 
                step > s.id ? "bg-navy border-navy text-white" : "bg-white border-line text-muted"
              )}
            >
              {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-extrabold",
              step === s.id ? "text-gold" : "text-muted"
            )}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[32px] border border-line p-8 sm:p-12 shadow-sm min-h-[500px] flex flex-col">
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-navy">Informações Básicas</h2>
                <p className="text-muted font-medium">Defina o nome e a descrição do seu evento.</p>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Nome do Evento</label>
                  <Input placeholder="Ex: Conferência Internacional de Fé 2024" className="h-14 rounded-xl border-line focus-visible:ring-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Subtítulo (Opcional)</label>
                  <Input placeholder="Um resumo curto do evento" className="h-14 rounded-xl border-line focus-visible:ring-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Descrição</label>
                  <Textarea placeholder="Descreva todos os detalhes do seu evento..." className="min-h-[150px] rounded-xl border-line focus-visible:ring-gold" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-wider">Categoria</label>
                    <Select>
                      <SelectTrigger className="h-14 rounded-xl border-line">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caravana">Caravana</SelectItem>
                        <SelectItem value="conferencia">Conferência</SelectItem>
                        <SelectItem value="show">Show / Concerto</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-wider">Tipo</label>
                    <Select defaultValue="presencial">
                      <SelectTrigger className="h-14 rounded-xl border-line">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-navy">Local e Data</h2>
                <p className="text-muted font-medium">Onde e quando o evento irá acontecer.</p>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-navy uppercase tracking-wider">Endereço Completo</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <Input placeholder="Pesquisar endereço no Google Maps..." className="h-14 pl-12 rounded-xl border-line" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-wider">Início do Evento</label>
                    <Input type="datetime-local" className="h-14 rounded-xl border-line" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-wider">Término do Evento</label>
                    <Input type="datetime-local" className="h-14 rounded-xl border-line" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steps 3, 4, 5 placeholders for now or briefly implemented */}
          {step > 2 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-gold">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-navy">Configurações do Passo {step}</h3>
              <p className="text-muted font-medium">Esta seção está pronta para receber os campos específicos do checkout internacional.</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-between items-center border-t border-line pt-8">
          <Button 
            variant="ghost" 
            onClick={prevStep}
            disabled={step === 1}
            className="h-14 px-8 rounded-xl font-bold text-muted hover:text-navy"
          >
            Anterior
          </Button>
          
          {step < 5 ? (
            <Button 
              onClick={nextStep}
              className="h-14 px-10 rounded-xl bg-navy hover:bg-navy/90 text-white font-bold"
            >
              Próximo <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              className="h-14 px-10 rounded-xl bg-gold hover:bg-gold-deep text-white font-extrabold shadow-lg shadow-gold/20"
            >
              Publicar Evento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20" />
      <path d="M2 12h20" />
    </svg>
  );
}
