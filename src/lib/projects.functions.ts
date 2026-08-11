import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
        status,
        tenants (
          id,
          nome,
          empresa,
          logo,
          slug,
          plan,
          status,
          description,
          created_at
        )
      `)
      .eq("user_id", user.id);

    return memberData?.map((m: any) => ({
      ...m.tenants,
      role: m.role,
      membership_status: m.status
    })) || [];
  });

export const switchProject = createServerFn({ method: "POST" })
  .input(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    // This is primarily a client-side state change in this architecture, 
    // but we can log access or verify permissions here.
    return { success: true, projectId: data.projectId };
  });
