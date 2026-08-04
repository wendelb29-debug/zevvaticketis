import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="text-2xl font-heading font-bold text-primary tracking-tighter">
          ZEVVA <span className="text-foreground">TICKETS</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/eventos" className="text-sm hover:text-primary transition-colors">Eventos</Link>
          <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-background transition-all">
            Login
          </Link>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-foreground mb-6 leading-tight">
          Acesso Global aos Melhores <br/>
          <span className="text-primary">Eventos do Mundo</span>
        </h1>
        <p className="text-lg md:text-xl text-secondary max-w-2xl mb-12">
          A plataforma definitiva para tickets internacionais, pacotes de viagem exclusivos e experiências inesquecíveis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/eventos" className="px-8 py-4 bg-primary text-background font-bold rounded-lg hover:bg-accent transition-all text-lg">
            Explorar Eventos
          </Link>
          <Link to="/cadastro" className="px-8 py-4 bg-card text-foreground font-bold rounded-lg border border-white/10 hover:bg-white/5 transition-all text-lg">
            Vender Ingressos
          </Link>
        </div>
      </main>

      <footer className="mt-auto p-12 border-t border-white/5 text-center text-muted-foreground text-sm">
        &copy; 2026 Zevva Tickets. Todos os direitos reservados.
      </footer>
    </div>
  );
}
