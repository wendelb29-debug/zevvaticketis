import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function PremiumNewsletter() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-navy rounded-[48px] p-8 md:p-20">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-coral/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-coral/20 rounded-full text-primary text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Exclusividade Zevva
              </div>
              <h2 className="text-4xl md:text-6xl font-manrope font-black text-primary-foreground uppercase tracking-tighter leading-[0.9]">
                Receba experiências <br />
                <span className="text-primary">em primeira mão</span>
              </h2>
              <p className="text-primary-foreground/60 text-lg md:text-xl font-medium max-w-md">
                Junte-se a 50.000+ exploradores e receba curadorias semanais de eventos e caravanas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="flex-1 h-16 px-6 bg-card/5 border border-white/10 rounded-2xl text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-coral transition-colors"
                />
                <Button className="h-16 px-8 bg-primary hover:bg-primary-dark text-primary-foreground font-black rounded-2xl gap-2 group">
                  INSCREVER-SE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <p className="text-primary-foreground/20 text-[10px] font-bold uppercase tracking-widest text-center sm:text-left">
                Sem spam. Apenas curadoria de alta qualidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
