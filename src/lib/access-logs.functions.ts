import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const logResourceAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        resourceType: z.string().min(1).max(100),
        resourceId: z.string().max(200).optional(),
        action: z.string().max(50).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    // Only platform admins generate access logs. Verified as the caller (RLS applies).
    const { data: adminRow } = await context.supabase
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!adminRow) return { logged: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("access_logs").insert({
      admin_id: context.userId,
      resource_type: data.resourceType,
      resource_id: data.resourceId ?? "global",
      action: data.action ?? "view",
    });

    return { logged: true };
  });
