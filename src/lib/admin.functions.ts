import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const promoteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export const promotePlatformAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => promoteSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Verify the caller is already a platform admin (RLS-scoped read as the user)
    const { data: adminRow, error: adminError } = await context.supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (adminError || !adminRow) {
      return { success: false, message: "Acesso negado." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("promote_to_platform_admin", {
      target_email: data.email,
    });

    if (error) {
      console.error("promote_to_platform_admin failed", error);
      return { success: false, message: "Não foi possível concluir a promoção." };
    }

    return result as { success: boolean; message: string };
  });
