import { Link } from "@tanstack/react-router";
import { Mail, Phone, Globe } from "lucide-react";
import logoAsset from "@/assets/logo-zevva.png.asset.json";

import { useUI } from "@/hooks/use-ui";
import { translations } from "@/lib/translations";

export function Footer() {
  const { language } = useUI();
  const t = translations[language].footer;

  return (
    <footer className="bg-brand-dark text-brand-dark-foreground py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        {/* Brand */}
        <div className="space-y-8 col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-2xl font-manrope font-extrabold text-white tracking-tight">
              ZEVVA<span className="text-primary ml-0.5">.</span>
            </span>
          </Link>
          <p className="text-sm text-brand-dark-muted font-medium leading-relaxed max-w-xs">
            {t.description}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-brand-dark-muted hover:text-white hover:border-white/30 transition-all rounded-md">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Plataforma</h4>
          <ul className="space-y-4">
            {[
              { label: "Sobre a Zevva", path: "/" },
              { label: "Explorar Eventos", path: "/eventos" },
              { label: "Cursos e Imersões", path: "/" },
              { label: "Caravanas", path: "/" },
              { label: "Painel do Produtor", path: "/app" }
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path as any} className="text-sm text-brand-dark-muted font-medium hover:text-white transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Suporte & Legal</h4>
          <ul className="space-y-4">
            {[
              { label: "Central de Ajuda", path: "/" },
              { label: "Termos de Uso", path: "/" },
              { label: "Privacidade", path: "/" },
              { label: "Política de Reembolso", path: "/" }
            ].map(link => (
              <li key={link.label}>
                <Link to={link.path as any} className="text-sm text-brand-dark-muted font-medium hover:text-white transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-10">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Contato</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-primary rounded-md">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-dark-muted/60 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-white">suporte@zevvaticjets.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-primary rounded-md">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-dark-muted/60 uppercase tracking-widest">WhatsApp</p>
                <p className="text-sm font-bold text-white">+55 (11) 9999-9999</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-xs text-brand-dark-muted font-bold uppercase tracking-widest">{t.rights}</p>
        <div className="flex items-center gap-10 grayscale opacity-40 brightness-0 invert">
          <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-4" />
        </div>
      </div>
    </footer>
  );
}
