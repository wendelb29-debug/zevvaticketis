import { Link, useLocation, useParams } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { useTenantAdminDetails } from "@/hooks/admin/use-tenant-admin-details";

export function GlobalBreadcrumb() {
  const location = useLocation();
  const params = useParams({ strict: false }) as any;
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Fetch tenant details only on the master tenant management route
  const isTenantRoute = location.pathname.startsWith("/admin/tenants/");
  const { data: tenantResult } = useTenantAdminDetails(
    isTenantRoute ? params.id : undefined,
  );
  const tenantName = tenantResult?.found ? tenantResult.tenant.nome : null;

  return (
    <nav className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
      <Link 
        to="/" 
        className="hover:text-foreground transition-colors flex-shrink-0 flex items-center gap-1.5"
      >
        <Home className="w-3 h-3" />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        
        // Custom labels for specific path parts
        let label = value;
        if (value === "admin") label = "Zevva Admin";
        if (value === "master") label = "Master Console";
        if (value === "tenants") label = "Projetos";
        
        // If the value matches the current tenant ID, show the name instead
        if (params.id && value === params.id && tenantName) {
          label = tenantName;
        }

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="w-3 h-3 mx-2 opacity-20 flex-shrink-0" />
            {last ? (
              <span className="text-foreground font-black truncate">{label}</span>
            ) : (
              <Link 
                to={to as any} 
                className="hover:text-foreground transition-colors truncate"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}