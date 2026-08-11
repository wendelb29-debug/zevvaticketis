import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  permission: z.string().trim().min(1).max(60),
  departments: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  accessHours: z.string().trim().max(80).optional(),
  redirectTo: z.string().trim().max(500).optional(),
  tenantId: z.string().uuid().optional(), // Explicit tenantId input
});

export const sendTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    let tenantId: string | undefined = data.tenantId;

    if (!tenantId) {
      // Fallback: check if the user belongs to exactly one tenant
      const { data: member } = await context.supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", context.userId)
        .maybeSingle();

      tenantId = member?.tenant_id ?? undefined;
    }

    if (!tenantId) {
      // Platform admin check: fallback to first tenant if not explicitly scoped
      const { data: adminRow } = await context.supabase
        .from("platform_admins")
        .select("id")
        .eq("user_id", context.userId)
        .maybeSingle();

      if (!adminRow) {
        return { success: false, message: "Você não pertence a nenhum ambiente." };
      }

      const { data: org } = await context.supabase
        .from("tenants")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      tenantId = org?.id ?? undefined;
    }

    if (!tenantId) {
      return { success: false, message: "Nenhum ambiente disponível para o convite." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: insertError } = await supabaseAdmin.from("team_invites").insert({
      tenant_id: tenantId,
      email: data.email,
      role: data.permission,
      departments: data.departments,
      access_hours: data.accessHours ?? null,
      permissions: data.departments,
      invited_by: context.userId,
      status: "pendente",
    });

    if (insertError) {
      console.error("team invite insert failed", insertError);
      return { success: false, message: "Não foi possível registrar o convite." };
    }

    const { error: mailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      ...(data.redirectTo ? { redirectTo: data.redirectTo } : {}),
      data: {
        invited_permission: data.permission,
        invited_departments: data.departments,
        invited_access_hours: data.accessHours ?? null,
      },
    });

    if (mailError) {
      console.error("invite email failed", mailError);
      return {
        success: true,
        message: "Convite registrado, mas o e-mail não pôde ser enviado agora.",
      };
    }

    return { success: true, message: "Convite enviado por e-mail." };
  });
