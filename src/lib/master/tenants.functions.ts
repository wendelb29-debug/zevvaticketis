import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getTenantDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data: { id }, context }) => {
    try {
      // Authorization is enforced server-side: only platform admins may read tenant details.
      const { data: adminRow } = await context.supabase
        .from("platform_admins")
        .select("user_id")
        .eq("user_id", context.userId)
        .maybeSingle();

      if (!adminRow) {
        return { success: false, found: false, code: "FORBIDDEN" };
      }

      const { data: tenant, error } = await supabaseAdmin
        .from("tenants")
        .select("id, nome, slug, logo, status, plan, empresa, telefone, documento, created_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Tenant details query failed");
        return { success: false, found: false, code: "QUERY_ERROR" };
      }

      if (!tenant) {
        return { success: false, found: false, code: "TENANT_NOT_FOUND" };
      }

      const [{ data: ownerMember }, { count: memberCount }, { count: eventCount }] = await Promise.all([
        supabaseAdmin
          .from("tenant_members")
          .select("user_id")
          .eq("tenant_id", id)
          .eq("role", "OWNER")
          .maybeSingle(),
        supabaseAdmin.from("tenant_members").select("*", { count: "exact", head: true }).eq("tenant_id", id),
        supabaseAdmin.from("events").select("*", { count: "exact", head: true }).eq("tenant_id", id),
      ]);

      let owner: { nome: string | null; email: string | null } = { nome: null, email: null };
      if (ownerMember?.user_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("nome, email")
          .eq("id", ownerMember.user_id)
          .maybeSingle();
        if (profile) owner = { nome: profile.nome, email: profile.email };
      }

      return {
        success: true,
        found: true,
        code: "OK",
        tenant: {
          ...tenant,
          owner,
          member_count: memberCount ?? 0,
          event_count: eventCount ?? 0,
        },
      } as {
        success: boolean;
        found: boolean;
        code: string;
        tenant?: any;
      };
    } catch {
      console.error("Tenant details execution error");
      return { success: false, found: false, code: "QUERY_ERROR" };
    }
  });


export const suspendTenant = createServerFn({ method: "POST" })
  .validator((data) => z.object({ 
    id: z.string(), 
    motivo: z.string(), 
    impacto: z.string(),
    observacao: z.string().optional() 
  }).parse(data))
  .handler(async ({ data: { id, motivo, impacto, observacao } }) => {
    // Audit the action and update status
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ status: 'suspenso' })
      .eq('id', id);
    
    if (error) throw error;
    
    // Register audit log
    await supabaseAdmin.from("audit_logs").insert({
      alvo_id: id,
      alvo_tipo: "tenant",
      acao: "suspend",
      categoria: "seguranca",
      payload: { motivo, impacto, observacao }
    });
    
    return { success: true };
  });
