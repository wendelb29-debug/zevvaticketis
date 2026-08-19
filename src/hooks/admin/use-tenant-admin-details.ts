import { useQuery } from "@tanstack/react-query";
import { getTenantDetails } from "@/lib/master/tenants.functions";
import { useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useTenantAdminDetails(tenantId?: string) {
  // Non-strict: this hook is also used outside the /admin/tenants/$id route
  const params = useParams({ strict: false }) as { id?: string };
  const id = tenantId ?? params.id;
  const enabled = !!id && UUID_RE.test(id);
  const getDetails = useServerFn(getTenantDetails);

  return useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: () => getDetails({ data: { id: id as string } }),
    enabled,
  });
}
