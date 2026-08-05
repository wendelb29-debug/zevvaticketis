import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

export function BreadcrumbNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = pathnames.map((name, index) => {
    const href = "/" + pathnames.slice(0, index + 1).join("/");
    const isLast = index === pathnames.length - 1;
    
    // Custom label mapping
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
      configuracoes: "Configurações",
      atendimento: "Atendimento",
      departamentos: "Departamentos",
      sla: "SLA",
      eventos: "Eventos",
      ingressos: "Meus Ingressos",
      historico: "Histórico",
    };

    const label = labelMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);

    return { label, href, isLast };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-4 py-4 px-1 font-inter animate-in fade-in slide-in-from-top-1 duration-500">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate({ to: "/admin" });
          }
        }}
        className="p-2 hover:bg-primary/10 rounded-full transition-all text-muted-fg hover:text-primary active:scale-95 group"
        title="Voltar"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      </button>

      <div className="flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link
          to={pathnames[0] === "admin" ? "/admin" : "/"}
          className="text-muted-fg hover:text-primary font-bold transition-colors"
        >
          Início
        </Link>

        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-fg/40 shrink-0" />
            {breadcrumb.isLast ? (
              <span className="text-foreground font-extrabold tracking-tight">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.href as any}
                className="text-muted-fg hover:text-primary font-bold transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
