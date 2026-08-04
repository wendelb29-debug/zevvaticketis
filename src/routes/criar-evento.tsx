import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/criar-evento")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: CriarEventoWizard,
});

function CriarEventoWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: "Informações básicas" },
    { id: 2, title: "Local e data" },
    { id: 3, title: "Ingressos" },
    { id: 4, title: "Divulgação" },
    { id: 5, title: "Revisão" },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Producer Header Layout */}
      <header className="bg-white border-b border-line px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-heading font-extrabold text-gold tracking-tighter">
            ZEVVA <span className="text-navy">TICKETS</span>
          </Link>
          <div className="h-6 w-px bg-line" />
          <span className="text-xs font-bold text-muted uppercase tracking-widest">ÁREA DO PRODUTOR</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-8 mb-12">
          <h1 className="text-4xl font-heading font-extrabold text-navy">Criar evento</h1>
          <p className="text-muted font-medium text-lg">divulgar e vender seu evento.</p>

          {/* Stepper */}
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex-1 space-y-2">
                <div className={cn("h-2 rounded-full", step >= s.id ? "bg-gold" : "bg-line")} />
                <p className={cn("text-[10px] font-extrabold uppercase tracking-widest", step >= s.id ? "text-gold" : "text-muted")}>
                  {i + 1}. {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-line p-10 min-h-[500px] flex flex-col">
          {step === 1 && (
            <div className="space-y-6 flex-1">
              <h2 className="text-2xl font-bold text-navy">Informações Básicas</h2>
              <div className="space-y-4">
                <Input placeholder="Título do evento *" className="h-14 rounded-xl border-line" />
                <Textarea placeholder="Descrição do evento *" className="min-h-[150px] rounded-xl border-line" />
                <Select>
                  <SelectTrigger className="h-14 rounded-xl border-line">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="festa">Festa</SelectItem>
                    <SelectItem value="show">Show</SelectItem>
                  </SelectContent>
                </Select>
                <div className="border-2 border-dashed border-line rounded-2xl p-10 text-center text-muted font-medium">
                  Arraste uma imagem ou clique para enviar (PNG, JPG, WEBP)
                </div>
              </div>
            </div>
          )}

          {/* Add more steps as needed */}
          
          <div className="flex justify-between mt-10">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Anterior</Button>
            <Button className="bg-navy text-white" onClick={() => step < 5 ? setStep(s => s + 1) : navigate({ to: '/produtor' })}>
              {step === 5 ? "Publicar Evento" : "Próximo"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}