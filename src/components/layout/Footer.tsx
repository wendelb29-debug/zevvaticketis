import { Link } from "@tanstack/react-router";
import { Mail, Phone, Instagram, Facebook, Globe } from "lucide-react";
import logoAsset from "@/assets/logo-zevva.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-white border-t border-line py-20 px-6 font-inter">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
        {/* Brand */}
        <div className="space-y-6 col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logoAsset.url} alt="Zevva" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-manrope font-extrabold text-coral tracking-tighter">
              ZEVVA <span className="text-navy">TICKETS</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            A plataforma definitiva para caravanas, eventos internacionais e experiências que conectam o Reino.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-navy hover:bg-coral hover:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-navy hover:bg-coral hover:text-white transition-all">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-navy hover:bg-coral hover:text-white transition-all">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-6">Plataforma</h4>
          <ul className="space-y-4">
            {["Explorar eventos", "Categorias", "Produtores", "Como funciona"].map(link => (
              <li key={link}>
                <Link to="/" className="text-sm text-slate-500 font-bold hover:text-coral transition-colors">{link}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4">
            {["Termos de Uso", "Privacidade", "LGPD", "Reembolsos"].map(link => (
              <li key={link}>
                <Link to="/" className="text-sm text-slate-500 font-bold hover:text-coral transition-colors">{link}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-6">Suporte</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-coral/5 flex items-center justify-center text-coral">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-navy">suporte@zevvaticjets.com</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-coral/5 flex items-center justify-center text-coral">
                <Phone className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-navy">+55 (11) 9999-9999</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-line flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-400 font-bold">© 2026 Zevva Tickets. Todos os direitos reservados.</p>
        <div className="flex items-center gap-6">
          <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </footer>
  );
}
