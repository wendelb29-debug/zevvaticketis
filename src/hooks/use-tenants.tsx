import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

type Tenant = {
  id: string;
  nome: string;
  logo: string | null;
  slug: string;
  plan: string;
};

type TenantContextType = {
  activeTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  switchTenant: (tenantId: string) => void;
  refreshTenants: () => Promise<void>;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
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
        tenants (
          id,
          nome,
          logo,
          slug,
          plan
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
      } else if (fetchedTenants.length > 0) {
        // Default to first one if none saved
        // setActiveTenant(fetchedTenants[0]);
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

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setActiveTenant(tenant);
      localStorage.setItem("zevva_active_tenant_id", tenant.id);
    }
  };

  return (
    <TenantContext.Provider value={{ activeTenant, tenants, loading, switchTenant, refreshTenants }}>
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
