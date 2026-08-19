import { useQuery } from "@tanstack/react-query";
import { getTenantDetails } from "@/lib/master/tenants.functions";
import { useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useTenantAdminDetails(tenantId?: string) {
  const params = useParams({ strict: false }) as { id?: string };
  const id = tenantId ?? params.id;
  const enabled = !!id && UUID_RE.test(id);
  const getDetails = useServerFn(getTenantDetails);

  return useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: async () => {
      const res = await getDetails({ data: { id: id as string } });
      return res;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error?.code === 'FORBIDDEN' || error?.code === 'TENANT_NOT_FOUND') return false;
      return failureCount < 2;
    }
  });
}
