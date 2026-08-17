import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getTenantStats = createServerFn({ method: "GET" })
  .validator((data) => z.object({ tenantId: z.string() }).parse(data))
  .handler(async ({ data: { tenantId } }) => {
    const [
      { count: ingressosEmitidos },
      { count: ingressosUtilizados },
      { data: ordersData },
      { count: membros },
      { count: eventos }
    ] = await Promise.all([
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "used"),
      supabaseAdmin.from("orders").select("valor_bruto, taxa_plataforma, status").eq("tenant_id", tenantId).eq("status", "pago"),
      supabaseAdmin.from("tenant_members").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabaseAdmin.from("events").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId)
    ]);

    const gmv = ordersData?.reduce((acc, curr) => acc + (Number(curr.valor_bruto) || 0), 0) || 0;
    const revenue = ordersData?.reduce((acc, curr) => acc + (Number(curr.taxa_plataforma) || 0), 0) || 0;
    const pedidosPagos = ordersData?.length || 0;

    return {
      ingressos: { emitidos: ingressosEmitidos || 0, utilizados: ingressosUtilizados || 0 },
      financeiro: { gmv, revenue, pedidosPagos },
      equipe: { total: membros || 0 },
      eventos: { total: eventos || 0 }
    };
  });

export const getTenantActivities = createServerFn({ method: "GET" })
  .validator((data) => z.object({ tenantId: z.string(), limit: z.number().default(10) }).parse(data))
  .handler(async ({ data: { tenantId, limit } }) => {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select(`
        *,
        admin:profiles!audit_logs_admin_id_fkey(nome, email)
      `)
      .or(`alvo_id.eq.${tenantId},payload->>tenant_id.eq.${tenantId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  });
