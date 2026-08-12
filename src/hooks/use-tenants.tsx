import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

type Tenant = {
  id: string;
  nome: string;
  empresa: string | null;
  logo: string | null;
  slug: string;
  plan: string;
  status: string;
  telefone: string | null;
};


type TenantContextType = {
  activeTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  userRole: string | null;
  switchTenant: (tenantId: string) => void;
  logout: () => Promise<void>;
  refreshTenants: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshTenants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setTenants([]);
      setLoading(false);
      return;
    }

    const { data: memberData } = await supabase
      .from("tenant_members")
      .select(`
        tenant_id,
        role,
        tenants (
          id,
          nome,
          empresa,
          logo,
          slug,
          plan,
          status,
          telefone
        )

      `)
      .eq("user_id", user.id);

    if (memberData) {
      const fetchedTenants = memberData
        .map((m: any) => m.tenants)
        .filter(Boolean) as Tenant[];
      
      setTenants(fetchedTenants);

      // Restore active tenant from localStorage if it still exists in the list
      const savedId = localStorage.getItem("zevva_active_tenant_id");
      const savedTenant = fetchedTenants.find(t => t.id === savedId);
      
      if (savedTenant) {
        setActiveTenant(savedTenant);
        const member = memberData.find((m: any) => m.tenant_id === savedId);
        if (member) setUserRole(member.role);
      } else if (fetchedTenants.length > 0) {
        // Option: Auto-select if only one
        // if (fetchedTenants.length === 1) switchTenant(fetchedTenants[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshTenants();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      refreshTenants();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const switchTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setActiveTenant(tenant);
      localStorage.setItem("zevva_active_tenant_id", tenant.id);
      
      // Update role for active tenant
      const { data: member } = await supabase
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .maybeSingle();
      
      if (member) setUserRole(member.role);
    }
  };

  const logout = async () => {
    localStorage.removeItem("zevva_active_tenant_id");
    await supabase.auth.signOut();
    setActiveTenant(null);
    setTenants([]);
    setUserRole(null);
  };

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    const role = userRole.toUpperCase();
    
    // Platform Admin has all permissions
    // Note: check_is_platform_admin is separate but for within-tenant logic:
    if (role === 'OWNER' || role === 'ADMIN') return true;
    
    const permissions: Record<string, string[]> = {
      'MANAGER': ['DASHBOARD', 'EVENTOS', 'INGRESSOS', 'PARTICIPANTES', 'CHECKIN', 'RELATORIOS'],
      'MARKETING': ['DASHBOARD', 'CAMPANHAS', 'ANUNCIOS', 'METRICAS'],
      'FINANCEIRO': ['DASHBOARD', 'VENDAS', 'REPASSES', 'RELATORIOS'],
      'CHECKIN_SUPERVISOR': ['CHECKIN', 'EQUIPE', 'AUDITORIA'],
      'CHECKIN_OPERATOR': ['CHECKIN', 'SCANNER', 'PARTICIPANTES']
    };

    return permissions[role]?.includes(permission.toUpperCase()) || false;
  };

  return (
    <TenantContext.Provider value={{ activeTenant, tenants, loading, userRole, switchTenant, refreshTenants, hasPermission, logout }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenants() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenants must be used within a TenantProvider");
  }
  return context;
}
