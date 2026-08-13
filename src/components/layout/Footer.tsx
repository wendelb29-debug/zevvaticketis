import { Link } from "@tanstack/react-router";
import { Mail, Phone, Globe } from "lucide-react";
import logoAsset from "@/assets/logo-zevva.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-surface-base border-t border-border py-32 px-6 font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
        {/* Brand */}
        <div className="space-y-10 col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
            <span className="text-xl font-serif italic text-foreground tracking-tight">
              Zevva <span className="not-italic font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-accent ml-1">Tickets</span>
            </span>
          </Link>
          <p className="text-sm text-foreground-muted font-medium leading-relaxed max-w-xs">
            A plataforma definitiva para caravanas, eventos internacionais e experiências que conectam o Reino. Estética editorial aliada à tecnologia de ponta.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-12 h-12 border border-border flex items-center justify-center text-foreground-muted hover:text-accent hover:border-accent transition-all rounded-sm">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Plataforma</h4>
          <ul className="space-y-4">
            {[
              { label: "Sobre a Zevva", path: "/" },
              { label: "Explorar Eventos", path: "/eventos" },
              { label: "Cursos e Imersões", path: "/" },
              { label: "Caravanas", path: "/" },
              { label: "Painel do Produtor", path: "/app" }
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path as any} className="text-sm text-foreground-muted font-medium hover:text-accent transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Suporte & Legal</h4>
          <ul className="space-y-4">
            {[
              { label: "Central de Ajuda", path: "/" },
              { label: "Termos de Uso", path: "/" },
              { label: "Privacidade", path: "/" },
              { label: "Política de Reembolso", path: "/" }
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path as any} className="text-sm text-foreground-muted font-medium hover:text-accent transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-10">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Contato</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border flex items-center justify-center text-accent">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-foreground">suporte@zevvaticjets.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-border flex items-center justify-center text-accent">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[8px] font-bold text-accent uppercase tracking-widest">WhatsApp</p>
                <p className="text-sm font-bold text-foreground">+55 (11) 9999-9999</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-[0.2em]">© 2026 Zevva Tickets. Premium Event Management.</p>
        <div className="flex items-center gap-10 grayscale opacity-40">
          <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-4" />
        </div>
      </div>
    </footer>
  );
}
