import { useQuery } from "@tanstack/react-query";
import { getTenantStats, getTenantActivities } from "@/lib/master/tenant-stats.functions";
import { useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";

export function useTenantAdminStats(tenantId: string) {
  const getStats = useServerFn(getTenantStats);
  const getActivities = useServerFn(getTenantActivities);

  const stats = useQuery({
    queryKey: ["admin-tenant-stats", tenantId],
    queryFn: () => getStats({ data: { tenantId } }),
    enabled: !!tenantId,
  });

  const activities = useQuery({
    queryKey: ["admin-tenant-activities", tenantId],
    queryFn: () => getActivities({ data: { tenantId } }),
    enabled: !!tenantId,
  });

  return { stats, activities };
}
