import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type TenantRole = Database["public"]["Enums"]["tenant_role"];

/**
 * Zevva SaaS Multi-Tenant Engine
 * Context: Projects (Tenants) management and isolation.
 */

export const getMyProjects = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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
          telefones: telefone,
          created_at
        )
      `)
      .eq("user_id", user.id);

    return memberData?.map((m: any) => ({
      ...m.tenants,
      role: m.role
    })) || [];
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ nome: z.string().min(3) }).parse(data))
  .handler(async ({ data }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const slug = data.nome.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    // Create the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        nome: data.nome,
        slug,
        plan: "free",
        status: "ACTIVE"
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Add user as OWNER of the new tenant
    const { error: memberError } = await supabase
      .from("tenant_members")
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: "OWNER" as TenantRole
      });

    if (memberError) throw memberError;

    return { success: true, tenant };
  });

export const switchProject = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ projectId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return { success: true, projectId: data.projectId };
  });
