import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateUserTenantAccess } from "./security";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  permission: z.enum(['owner', 'admin', 'moderator', 'user']),
  departments: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  accessHours: z.string().trim().max(80).optional(),
  redirectTo: z.string().trim().url().max(500).optional()
    .refine(url => !url || url.startsWith(process.env['VITE_APP_URL'] || 'http://localhost:8080'), {
      message: "Redirecionamento permitido apenas para domínios do sistema."
    }),
  tenantId: z.string().uuid(),
});

export const sendTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inviteSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { tenantId } = data;

    // MANDATORY SECURITY CHECK: Validate user access to the tenant before using supabaseAdmin
    const validation = await validateUserTenantAccess(
      context.supabase,
      context.userId,
      tenantId,
      ['owner', 'admin'] // Only owners/admins can invite
    );

    if (!validation.authorized) {
      return { success: false, message: validation.message || "Acesso negado." };
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
