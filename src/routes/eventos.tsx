import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { getThemeByCategory } from "@/lib/categoryThemes";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  MapPin, 
  Share2, 
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  Clock,
  Ticket as TicketIcon
} from "lucide-react";

export const Route = createFileRoute("/eventos")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search['id'] as string) || undefined,
      categoria: (search['categoria'] as string) || "CARAVANAS INTERNACIONAIS",
    };
  },
  component: EventPage,
});

function EventPage() {
  const search = useSearch({ from: "/eventos" }) as any;
  const theme = getThemeByCategory(search.categoria);
  const Icon = theme.icon;

  return (
    <div className={cn("min-h-screen bg-bg text-navy font-inter", theme.fontFamily)}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-line h-20 flex items-center px-6">
        <div className="flex-1 flex items-center gap-4">
          <Link to="/" className="text-muted hover:text-navy transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="text-xl font-manrope font-extrabold text-coral tracking-tighter">
            ZEVVA <span className="text-navy">TICKETS</span>
          </Link>
        </div>
        <div className="flex-1 max-w-xl hidden md:flex items-center">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Buscar caravanas..." 
              className="w-full bg-surface h-10 px-10 rounded-full text-sm border-2 border-line focus:ring-1 focus:ring-coral outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <Link to="/login" className="text-sm font-extrabold px-6 py-2.5 rounded-xl bg-navy text-white hover:brightness-110 transition-all">
            Entrar
          </Link>
        </div>
      </header>

      <main className={cn("pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8", theme.paddingBoost)}>
        {/* Category Badge & Hero Header */}
        <div className="space-y-4">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm"
            style={{ backgroundColor: theme.accentColor }}
          >
            <Icon className="w-3.5 h-3.5" /> {theme.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-manrope font-extrabold leading-tight text-navy">
            Caravana para a Terra Santa 2026: Uma Jornada Espiritual
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          {/* Main Column */}
          <div className="space-y-12">
            <div 
              className={cn(
                "aspect-video rounded-3xl overflow-hidden shadow-2xl relative border-4 group",
                theme.customClass?.includes('animate-pulse-subtle') && "animate-pulse-subtle"
              )}
              style={{ borderColor: theme.accentColor + '20' }}
            >
              {theme.heroPattern && <div className={cn("absolute inset-0 z-10 pointer-events-none", theme.heroPattern)} />}
              <img 
                src="https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&fit=crop&q=80&w=1600" 
                alt="Caravana Terra Santa"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-wrap gap-8 py-6 border-y border-line">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-surface rounded-2xl" style={{ color: theme.accentColor }}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Data</p>
                  <p className="font-bold text-navy">15 a 25 de Dezembro, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-surface rounded-2xl" style={{ color: theme.accentColor }}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Localização</p>
                  <p className="font-bold text-navy">Jerusalém, Israel</p>
                </div>
              </div>
              {search.categoria === "CURSOS E WORKSHOPS" && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-surface rounded-2xl" style={{ color: theme.accentColor }}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Certificado</p>
                    <p className="font-bold text-navy">Incluso</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8 prose max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-manrope font-extrabold text-navy flex items-center gap-2">
                  <Info className="w-5 h-5" style={{ color: theme.accentColor }} /> Sobre o evento
                </h2>
                <p className="text-muted font-medium leading-relaxed text-lg">
                  Esta não é apenas uma viagem, mas uma experiência transformadora. Visitaremos os lugares mais sagrados, desde as margens do Mar da Galiléia até as muralhas da Cidade Velha de Jerusalém. Prepare-se para vivenciar a história e a fé de uma maneira única.
                </p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-2xl font-manrope font-extrabold text-navy flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" style={{ color: theme.accentColor }} /> Políticas
                </h2>
                <p className="text-muted font-medium leading-relaxed">
                  Cancelamento gratuito até 60 dias antes da partida. É necessário passaporte com validade mínima de 6 meses. O seguro viagem está incluso em todos os pacotes.
                </p>
              </section>
            </div>
          </div>

          {/* Sticky Ticket Panel */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div 
              className={cn(
                "bg-white rounded-[32px] p-8 shadow-2xl border border-line space-y-8",
                theme.customClass
              )}
              style={{ transitionDuration: theme.animationSpeed.split('-')[1] + 'ms' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-manrope font-extrabold text-navy">Ingressos</h3>
                <TicketIcon className="w-6 h-6" style={{ color: theme.accentColor }} />
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 1, name: "Pacote Premium", price: "US$ 4.500", desc: "Alojamento 5★", color: theme.accentColor },
                  { id: 2, name: "Pacote Econômico", price: "US$ 3.200", desc: "Alojamento 3★" },
                ].map((ticket) => (
                  <div key={ticket.id} className="p-5 rounded-2xl border border-line bg-surface/30 space-y-4 group/ticket hover:border-coral/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-extrabold text-navy leading-tight">{ticket.name}</h4>
                        <span className="text-[10px] text-muted font-extrabold uppercase tracking-widest mt-1 block">{ticket.desc}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-extrabold text-navy text-lg">{ticket.price}</span>
                        {ticket.id === 1 && (
                          <span className="text-[9px] bg-coral/10 text-coral px-2 py-0.5 rounded-full font-extrabold uppercase mt-1 inline-block">Popular</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-line/50">
                      <div className="flex items-center border border-line rounded-xl overflow-hidden bg-white shadow-sm">
                        <button className="w-10 h-10 flex items-center justify-center text-navy hover:bg-surface transition-colors font-bold">–</button>
                        <span className="font-extrabold w-12 text-center text-sm text-navy py-2">0</span>
                        <button className="w-10 h-10 flex items-center justify-center text-navy hover:bg-surface transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="CUPOM" className="flex-1 bg-surface border-2 border-line h-12 px-4 rounded-xl text-xs font-extrabold outline-none focus:border-coral" />
                  <button className="text-[10px] font-extrabold text-coral uppercase tracking-widest px-4">Aplicar</button>
                </div>
                
                <button 
                  className={cn(
                    "w-full text-white h-16 rounded-2xl font-extrabold hover:brightness-110 transition-all shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-3",
                    theme.buttonRadius
                  )}
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Garantir minha vaga <ArrowRight className="w-5 h-5" />
                </button>
                
                <div className="flex justify-center pt-2">
                  <button className="flex items-center gap-2 text-[10px] font-extrabold text-muted hover:text-navy transition-colors uppercase tracking-widest">
                    <Share2 className="w-4 h-4" /> Compartilhar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-good/5 rounded-2xl p-6 border border-good/20 flex gap-4">
              <ShieldCheck className="w-6 h-6 text-good shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-good uppercase tracking-widest">Compra Segura</p>
                <p className="text-xs text-good/80 font-medium">Seus dados estão protegidos com criptografia de ponta.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Help Bubble */}
      <button 
        className={cn(
          "fixed bottom-8 right-8 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50",
          theme.buttonRadius
        )}
        style={{ backgroundColor: theme.accentColor }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
