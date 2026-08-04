import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { LocationModal } from "@/components/ui/LocationModal";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      cidade: (search['cidade'] as string) || undefined,
    };
  },
  component: Index,
});

function Index() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [nearbyError, setNearbyError] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" }) as any;
  const selectedCity = search?.cidade;

  const handleAuthClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is already logged in, redirect based on role
      const { data: member } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      if (member) {
        navigate({ to: "/produtor" });
      } else {
        navigate({ to: "/app" });
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

  const handleLocationSelect = (city: string | null) => {
    setIsLocationModalOpen(false);
    setNearbyError(false);

    if (city === "nearby") {
      // Simulate geolocation matching none
      setNearbyError(true);
      navigate({ to: '.', search: (prev: any) => ({ ...prev, cidade: undefined }) });
    } else {
      navigate({ 
        to: '.',
        search: (prev: any) => ({ 
          ...prev, 
          cidade: city ? city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : undefined 
        }) 
      });
    }
  };

  const categories = [
    { name: "Conferências", icon: "✨" },
    { name: "Shows Gospel", icon: "🎸" },
    { name: "Retiros", icon: "🌳" },
    { name: "Caravanas Internacionais", icon: "🌍" },
    { name: "Cursos e Workshops", icon: "📚" },
    { name: "Infantil", icon: "🎨" },
  ];

  const cities = ["ORLANDO", "LISBOA", "UBERLÂNDIA", "MIAMI", "SÃO PAULO", "MADRI", "NOVA YORK", "BUENOS AIRES"];

  return (
    <div className="min-h-screen bg-bg text-navy font-sans text-base">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-line h-20 flex items-center px-6">
        <div className="flex-1 flex items-center">
          <Link to="/" className="text-xl font-heading font-extrabold text-gold tracking-tighter">
            ZEVVA <span className="text-navy">TICKETS</span>
          </Link>
        </div>

        <div className="flex-[2] max-w-2xl hidden md:flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Buscar eventos, cidades, ministérios..." 
              className="w-full bg-surface h-11 px-11 rounded-full text-sm border-none focus:ring-1 focus:ring-gold outline-none text-navy placeholder:text-muted"
            />
            <svg className="absolute left-4 top-3.5 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div 
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 bg-surface h-11 px-5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-surface-2 transition-colors border border-line"
          >
            <MapPin className={cn("w-4 h-4", selectedCity ? "text-gold" : "text-gold")} />
            <span className={cn(selectedCity && "text-gold")}>
              {selectedCity ? `📍 ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}` : "Localização"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-3">
          <button 
            onClick={handleAuthClick}
            className="text-sm font-bold text-navy hover:text-gold transition-colors px-4"
          >
            Entrar
          </button>
          <Link to="/cadastro" className="text-sm font-bold px-6 py-2.5 rounded-[11px] bg-gradient-to-r from-gold-bright to-gold text-white hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(201,154,62,0.25)]">
            Cadastrar
          </Link>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={handleLocationSelect}
      />

      <main className="pt-24 pb-12 space-y-12">
        {nearbyError && (
          <div className="px-6 max-w-7xl mx-auto">
            <div className="bg-surface rounded-2xl p-6 border border-line flex items-center justify-center text-navy font-bold text-center">
              Nenhum evento perto de você ainda — veja os mais buscados no mundo todo
            </div>
          </div>
        )}
        <div className="px-6 max-w-7xl mx-auto">
          {/* Hero Carousel */}
          <div className="relative w-full aspect-[21/9] bg-surface-2 rounded-2xl overflow-hidden group shadow-md border border-line">
            <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-12">
              <div className="max-w-xl text-white">
                <span className="inline-block bg-gold px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4">Destaque</span>
                <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-4 leading-tight">Grand Tour 2026: Europa Medieval</h2>
                <p className="text-lg text-white/90 mb-8 font-medium leading-relaxed">Uma jornada inesquecível pelas catedrais e castelos mais icônicos do velho continente.</p>
                <button className="bg-gradient-to-r from-gold-bright to-gold text-white px-10 py-4 rounded-[11px] font-extrabold hover:opacity-90 transition-all shadow-[0_6px_20px_rgba(201,154,62,0.3)] text-sm uppercase tracking-wider">Ver Detalhes</button>
              </div>
            </div>
            
            <div className="absolute bottom-6 right-6 flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full border border-white/50 ${i === 1 ? 'bg-gold border-gold' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* City Ticker */}
        <div className="bg-surface border-y border-line py-4 overflow-hidden select-none">
          <div className="flex whitespace-nowrap animate-infinite-scroll">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4">
                {cities.map((city) => (
                  <span key={city} className="text-sm font-extrabold text-gold tracking-[0.2em] flex items-center gap-8">
                    {city} <span className="text-gold/30 text-xs">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 max-w-7xl mx-auto space-y-20">
          {/* Categories Section */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-extrabold">Explore por Categoria</h2>
              <p className="text-muted font-medium">Encontre a experiência ideal para o seu ministério</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat) => (
                <div key={cat.name} className="group cursor-pointer text-center space-y-4 hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-surface to-surface-2 border border-line flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md group-hover:border-gold/30 transition-all">
                    {cat.icon}
                  </div>
                  <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider line-clamp-2 leading-relaxed">{cat.name}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Events Section */}
          <section className="space-y-8">
            <div className="flex justify-between items-end border-b border-line pb-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-heading font-extrabold tracking-tight">Próximas Caravanas</h2>
                <p className="text-muted font-medium">Saídas confirmadas para os próximos meses</p>
              </div>
              <Link to="/eventos" className="text-gold text-sm font-extrabold hover:underline uppercase tracking-widest pb-1">Ver tudo</Link>
            </div>
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: 1,
                  title: "Terra Santa: Passos de Jesus",
                  location: "Jerusalém, Israel",
                  cityKey: "jerusalem",
                  date: "Dezembro 2026",
                  price: "US$ 4.500",
                  image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&fit=crop&q=80&w=800",
                  lote: "Lote 1"
                },
                {
                  id: 2,
                  title: "Grand Tour: Europa Medieval",
                  location: "Paris, França",
                  cityKey: "paris",
                  date: "Julho 2026",
                  price: "US$ 5.200",
                  image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800",
                  lote: "Lote 2"
                },
                {
                  id: 3,
                  title: "Retiro de Jovens: Conexão",
                  location: "Atibaia, SP",
                  cityKey: "atibaia",
                  date: "Janeiro 2026",
                  price: "R$ 850",
                  image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800",
                  lote: "Últimas vagas"
                },
                {
                  id: 4,
                  title: "Conferência Internacional de Fé",
                  location: "Orlando, FL",
                  cityKey: "orlando",
                  date: "Março 2026",
                  price: "US$ 350",
                  image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
                  lote: "Promoção"
                }
              ]
              .filter(e => !selectedCity || e.cityKey === selectedCity)
              .map((event) => (
                <div key={event.id} className="bg-white rounded-[14px] overflow-hidden border border-line shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-[4/3] bg-surface relative overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/95 backdrop-blur-sm text-gold text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm border border-line uppercase tracking-widest">
                        {event.lote}
                      </span>
                    </div>
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-heading font-extrabold text-lg text-navy leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-gold transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted font-semibold">
                        <svg className="w-4 h-4 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted font-semibold">
                        <svg className="w-4 h-4 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {event.date}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-line flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-muted font-bold uppercase tracking-widest">A partir de</span>
                        <span className="text-xl font-extrabold text-navy">{event.price}</span>
                      </div>
                      <Link 
                        to="/eventos" 
                        className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Producers Banner */}
          <section className="bg-gradient-to-br from-surface to-surface-2 rounded-3xl p-12 border border-line shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/2" />
            <div className="max-w-2xl space-y-8 relative z-10">
              <h2 className="text-4xl font-heading font-extrabold leading-tight">Crie eventos, divulgue e venda ingressos em qualquer moeda</h2>
              <ul className="space-y-4">
                {[
                  "Publicação gratuita e intuitiva",
                  "Check-in profissional com QR Code",
                  "Repasse automático em BRL, USD ou EUR"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-lg font-semibold text-navy">
                    <div className="w-6 h-6 rounded-full bg-good/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-good" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/cadastro" className="inline-block bg-gradient-to-r from-gold-bright to-gold text-white px-10 py-5 rounded-[11px] font-extrabold hover:opacity-90 transition-all shadow-[0_6px_20px_rgba(201,154,62,0.3)] uppercase tracking-widest">
                Criar meu evento
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-extrabold">Dúvidas Frequentes</h2>
              <p className="text-muted font-medium">Tudo o que você precisa saber sobre a sua próxima viagem</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "Como funciona o cancelamento e reembolso?", a: "As políticas de cancelamento variam por evento. Geralmente, oferecemos reembolso integral até 60 dias antes da partida." },
                { q: "Onde localizo meus ingressos após a compra?", a: "Seus ingressos ficam disponíveis na aba 'Meus Ingressos' no seu painel e também são enviados por e-mail." },
                { q: "Posso transferir meu ingresso para outra pessoa?", a: "Sim, a transferência é permitida até 15 dias antes do evento diretamente pelo painel do participante." },
                { q: "O preço do ingresso muda conforme o país de compra?", a: "O valor base é fixo na moeda do evento, mas a conversão segue a cotação oficial do dia do pagamento." }
              ].map((faq, idx) => (
                <details key={idx} className="group bg-surface rounded-2xl border border-line">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none font-extrabold text-navy">
                    {faq.q}
                    <span className="text-gold group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-navy pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 border-b border-white/10 pb-16">
            <div className="space-y-6">
              <h4 className="text-white font-extrabold uppercase tracking-widest text-xs">Países</h4>
              <ul className="space-y-3 text-sm font-medium text-white/60">
                <li>Brasil</li>
                <li>Estados Unidos</li>
                <li>Portugal</li>
                <li>Israel</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-extrabold uppercase tracking-widest text-xs">Categorias</h4>
              <ul className="space-y-3 text-sm font-medium text-white/60">
                <li>Caravanas</li>
                <li>Conferências</li>
                <li>Shows Gospel</li>
                <li>Turismo Religioso</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-extrabold uppercase tracking-widest text-xs">Seja Produtor</h4>
              <ul className="space-y-3 text-sm font-medium text-white/60">
                <li>Como vender</li>
                <li>Central de Ajuda</li>
                <li>Taxas e Prazos</li>
                <li>Stripe Connect</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-extrabold uppercase tracking-widest text-xs">A Zevva</h4>
              <ul className="space-y-3 text-sm font-medium text-white/60">
                <li>Sobre nós</li>
                <li>Termos de Uso</li>
                <li>Privacidade</li>
                <li>Blog</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-extrabold uppercase tracking-widest text-xs">Ajuda</h4>
              <ul className="space-y-3 text-sm font-medium text-white/60">
                <li>Suporte ao Comprador</li>
                <li>Suporte ao Produtor</li>
                <li>Contatos</li>
                <li>Segurança</li>
              </ul>
            </div>
          </div>
          <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
            <p>&copy; 2026 Zevva Tickets. Todos os direitos reservados.</p>
            <p>Powered by Milittão Brand</p>
          </div>
        </div>
      </footer>

      {/* Floating Help Bubble */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-gold-bright to-gold text-white rounded-full shadow-[0_8px_25px_rgba(201,154,62,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
