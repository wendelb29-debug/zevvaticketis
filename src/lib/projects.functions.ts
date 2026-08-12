import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Database } from "@/integrations/supabase/types";

type TenantRole = Database["public"]["Enums"]["tenant_role"];

/**
 * Zevva SaaS Multi-Tenant Engine
 * Context: Projects (Tenants) management and isolation.
 *
 * Security: tenants can only be created through this server function.
 * The client cannot insert tenants directly (no INSERT policy/grant),
 * so privileged fields (status, plan_id, taxa_percentual_custom,
 * stripe_account_id) are always set server-side.
 */

export const getMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: memberData } = await supabaseAdmin
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
          telefone: telefone,
          created_at
        )
      `)
      .eq("user_id", context.userId);

    return memberData?.map((m: any) => ({
      ...m.tenants,
      role: m.role
    })) || [];
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ nome: z.string().min(3).max(120) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const baseSlug = data.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const slug = `${baseSlug || "projeto"}-${Math.random().toString(36).slice(2, 7)}`;

    // Only non-privileged fields come from the client. Everything sensitive
    // (status, plan, billing fields) is forced server-side.
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        nome: data.nome,
        slug,
        plan: "free",
        status: "aprovado",
        plan_id: null,
        taxa_percentual_custom: null,
        stripe_account_id: null,
      })
      .select()
      .single();

    if (tenantError) {
      console.error("Tenant error:", tenantError.message);
      throw new Error("Não foi possível criar o projeto.");
    }

    const { error: memberError } = await supabaseAdmin
      .from("tenant_members")
      .insert({
        tenant_id: tenant.id,
        user_id: context.userId,
        role: "OWNER" as TenantRole
      });

    if (memberError) {
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      console.error("Member error:", memberError.message);
      throw new Error("Não foi possível criar o projeto.");
    }

    return { success: true, tenant };
  });

export const switchProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: membership } = await supabaseAdmin
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", context.userId)
      .eq("tenant_id", data.projectId)
      .maybeSingle();

    if (!membership) throw new Error("Projeto não encontrado.");

    return { success: true, projectId: data.projectId };
  });
