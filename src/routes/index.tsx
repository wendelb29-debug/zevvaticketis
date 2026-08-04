import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans text-base">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6">
        <div className="flex-1 flex items-center">
          <div className="text-xl font-heading font-bold text-primary tracking-tighter">
            ZEVVA <span className="text-foreground">TICKETS</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex items-center gap-2">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Buscar eventos..." 
              className="w-full bg-card h-10 px-10 rounded-full text-sm border-none focus:ring-1 focus:ring-primary outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-card h-10 px-4 rounded-full text-sm whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Localização</span>
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Link to="/eventos" className="hidden lg:block text-sm font-semibold hover:text-primary transition-colors">Criar evento</Link>
          <Link to="/app" className="hidden lg:block text-sm font-semibold hover:text-primary transition-colors">Meus ingressos</Link>
          <Link to="/login" className="text-sm font-semibold px-5 py-2 rounded-full bg-primary text-background hover:bg-accent transition-all">
            Entrar
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-12">
        {/* Mock Carousel */}
        <div className="relative w-full aspect-[21/9] bg-card rounded-2xl overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white max-w-xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Grand Tour 2026: Europa Medieval</h2>
            <p className="text-lg text-white/80 mb-4 font-medium leading-relaxed">Uma jornada inesquecível pelas catedrais e castelos mais icônicos do velho continente.</p>
            <button className="bg-primary text-background px-8 py-3 rounded-full font-bold hover:bg-accent transition-all text-sm">Ver Detalhes</button>
          </div>
          {/* Mock Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          {/* Mock Navigation Arrows */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-heading font-bold">Próximas Caravanas</h2>
            <Link to="/eventos" className="text-primary text-sm font-semibold hover:underline">Ver tudo</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                <div className="aspect-[4/3] bg-muted relative">
                  <div className="absolute top-2 right-2 bg-primary text-background text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Lote 1</div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors leading-tight line-clamp-2">Terra Santa: Passos de Jesus</h3>
                  <div className="flex flex-col text-sm text-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      Israel & Jordânia
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Dez 2026
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto p-12 border-t border-border text-center text-muted-foreground text-sm font-medium">
        &copy; 2026 Zevva Tickets. A plataforma definitiva para caravanas internacionais.
      </footer>

      {/* Floating Help Bubble */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
