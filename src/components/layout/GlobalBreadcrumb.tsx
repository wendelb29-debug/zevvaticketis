import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const labelMap: Record<string, string> = {
  admin: "Admin",
  app: "Zevva",
  perfil: "Meu Perfil",
  chat: "Chat",
  dashboard: "Dashboard",
  usuarios: "Usuários",
  planos: "Planos",
  marketing: "Marketing",
  auditoria: "Auditoria",
  checkin: "Check-in",
  aprovacoes: "Aprovações",
  produtores: "Produtores",
  paises: "Países",
  emails: "E-mails",
  configuracoes: "Configurações",
  atendimento: "Atendimento",
  departamentos: "Departamentos",
  sla: "SLA",
  eventos: "Eventos",
  ingressos: "Meus Ingressos",
  historico: "Histórico",
};

export function GlobalBreadcrumb({ className }: { className?: string }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) return null;

  const crumbs = pathnames.map((name, index) => ({
    label: labelMap[name.toLowerCase()] ?? name.charAt(0).toUpperCase() + name.slice(1),
    href: "/" + pathnames.slice(0, index + 1).join("/"),
    isLast: index === pathnames.length - 1,
  }));

  const rootHref = pathnames[0] === "admin" ? "/admin" : "/";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm font-inter whitespace-nowrap", className)}
    >
      <Link
        to={rootHref}
        className="hidden sm:inline text-foreground/70 hover:text-primary font-semibold transition-colors"
      >
        Início
      </Link>
      <span className="sm:hidden text-muted-foreground font-semibold">...</span>

      {crumbs.map((crumb) => (
        <div
          key={crumb.href}
          className={cn("items-center gap-2", crumb.isLast ? "flex" : "hidden sm:flex")}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          {crumb.isLast ? (
            <span className="text-foreground font-extrabold tracking-tight">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.href as any}
              className="text-foreground/70 hover:text-primary font-semibold transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
