import { useQuery } from "@tanstack/react-query";
import { getTenantDetails } from "@/lib/master/tenants.functions";
import { useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";

export function useTenantAdminDetails() {
  const { id } = useParams({ from: "/admin/tenants/$id" });
  const getDetails = useServerFn(getTenantDetails);
  
  return useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: () => getDetails({ data: { id } }),
    enabled: !!id,
  });
}
