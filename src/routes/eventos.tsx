import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/eventos")({
  component: EventPage,
});

function EventPage() {
  return (
    <div className="min-h-screen bg-bg text-navy font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-line h-20 flex items-center px-6">
        <div className="flex-1">
          <Link to="/" className="text-xl font-heading font-extrabold text-gold tracking-tighter">
            ZEVVA <span className="text-navy">TICKETS</span>
          </Link>
        </div>
        <div className="flex-1 max-w-xl flex items-center">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Buscar caravanas..." 
              className="w-full bg-card h-10 px-10 rounded-full text-sm border-none focus:ring-1 focus:ring-primary outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <Link to="/login" className="text-sm font-semibold px-5 py-2 rounded-full bg-primary text-background hover:bg-accent transition-all">
            Entrar
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Column */}
          <div className="space-y-8">
            <div className="aspect-video bg-card rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&fit=crop&q=80&w=1600" 
                alt="Caravana Terra Santa"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-heading font-bold leading-tight">Caravana para a Terra Santa 2026: Uma Jornada Espiritual</h1>
              <div className="flex flex-wrap gap-6 text-sm font-medium text-secondary">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  15 a 25 de Dezembro, 2026
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  Jerusalém, Israel
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-heading font-bold border-b border-border pb-2">Sobre o evento</h2>
              <p className="text-secondary leading-relaxed">
                Esta não é apenas uma viagem, mas uma experiência transformadora. Visitaremos os lugares mais sagrados, desde as margens do Mar da Galiléia até as muralhas da Cidade Velha de Jerusalém. Prepare-se para vivenciar a história e a fé de uma maneira única.
              </p>
              
              <h2 className="text-2xl font-heading font-bold border-b border-border pb-2 mt-8">Políticas</h2>
              <p className="text-secondary leading-relaxed">
                Cancelamento gratuito até 60 dias antes da partida. É necessário passaporte com validade mínima de 6 meses. O seguro viagem está incluso em todos os pacotes.
              </p>
            </div>
          </div>

          {/* Sticky Ticket Panel */}
          <aside className="relative lg:block">
            <div className="lg:sticky lg:top-24 bg-card rounded-2xl p-6 shadow-xl border border-border space-y-6">
              <h3 className="text-xl font-heading font-bold">Ingressos</h3>
              
              <div className="space-y-4">
                {[
                  { id: 1, name: "Pacote Premium Individual", price: "US$ 4.500,00", desc: "Alojamento 5 estrelas + Aéreo" },
                  { id: 2, name: "Pacote Standard Duplo", price: "US$ 3.800,00", desc: "Alojamento 4 estrelas + Aéreo" },
                ].map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-line bg-white space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-navy">{ticket.name}</h4>
                        <span className="text-xs text-muted font-medium">{ticket.desc}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-gold">{ticket.price}</span>
                        <span className="text-[10px] bg-good/10 text-good px-2 py-0.5 rounded-sm font-bold uppercase">parcele em 12x</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-line">
                      <span className="text-xs text-muted font-bold">QTD:</span>
                      <div className="flex items-center border border-line rounded-lg overflow-hidden bg-surface">
                        <button className="w-9 h-9 flex items-center justify-center text-navy hover:bg-gold hover:text-white transition-colors font-bold">–</button>
                        <span className="font-bold w-10 text-center text-sm text-navy border-x border-line py-2">0</span>
                        <button className="w-9 h-9 flex items-center justify-center text-navy hover:bg-gold hover:text-white transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="CUPOM DE DESCONTO" className="flex-1 bg-background border border-border h-10 px-4 rounded-lg text-xs font-bold outline-none focus:border-primary" />
                  <button className="text-xs font-bold text-primary hover:underline px-2">APLICAR</button>
                </div>
                
                <button className="w-full bg-gradient-to-r from-gold-bright to-gold text-white h-14 rounded-xl font-extrabold hover:opacity-90 transition-all shadow-[0_6px_20px_rgba(201,154,62,0.3)] text-lg uppercase tracking-wider">
                  Comprar agora
                </button>
                
                <div className="flex justify-center gap-4">
                  <button className="flex items-center gap-2 text-xs font-bold text-secondary hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Help Bubble */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-gold-bright to-gold text-white rounded-full shadow-[0_8px_25px_rgba(201,154,62,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
