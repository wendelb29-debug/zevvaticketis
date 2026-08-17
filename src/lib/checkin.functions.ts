import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const checkinSchema = z.object({
  rawToken: z.string().min(4).max(512),
  eventId: z.string().uuid(),
  tenantId: z.string().uuid(),
});

/**
 * Secure server-side wrapper for the atomic check-in routine.
 * The database function is no longer executable by browser clients.
 */
export const processTicketCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => checkinSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: result, error } = await (supabaseAdmin as any).rpc("process_ticket_checkin", {
      _raw_token: data.rawToken,
      _event_id: data.eventId,
      // Operator is always the verified caller, never client-supplied.
      _operator_id: context.userId,
      _tenant_id: data.tenantId,
    });

    if (error) {
      console.error("process_ticket_checkin failed", error);
      return { success: false, code: "ERROR", message: "Não foi possível validar o ingresso." };
    }

    return result as {
      success: boolean;
      code: string;
      message: string;
      checked_in_at?: string;
      attendee_name?: string;
      ticket_type?: string;
    };
  });
