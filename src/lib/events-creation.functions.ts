import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateUserTenantAccess } from "./security";

const createEventSchema = z.object({
  event: z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(2000).optional(),
    category: z.string().max(50).optional(),
    city: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    start_date: z.string().datetime(),
    cover_image: z.string().url().max(500).optional(),
    tenant_id: z.string().uuid(),
  }),
  ticketTypes: z.array(z.object({
    nome: z.string().min(2).max(50),
    valor: z.number().min(0).max(1000000),
    quantidade: z.number().int().positive().max(100000),
  })).min(1).max(10)
});

export const createEventFull = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createEventSchema.parse(data))
  .handler(async ({ data, context }) => {
    // SECURITY: Validate tenant access before administrative operation
    const validation = await validateUserTenantAccess(
      context.supabase,
      context.userId,
      data.event.tenant_id,
      ['owner', 'admin', 'moderator'] // Producers/Moderators can create events
    );

    if (!validation.authorized) {
      throw new Error(validation.message || "Acesso negado para criação de eventos.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .insert({
        title: data.event.title,
        description: data.event.description ?? null,
        category: data.event.category ?? null,
        city: data.event.city ?? null,
        location: data.event.location ?? null,
        start_date: data.event.start_date,
        cover_image: data.event.cover_image ?? null,
        tenant_id: data.event.tenant_id,
        producer_id: context.userId,
        status: "aguardando_aprovacao"
      })
      .select()
      .single();

    if (eventError) {
      console.error("Event creation error:", eventError);
      throw new Error(eventError.message);
    }

    // 2. Create Ticket Types
    const ticketsToInsert = data.ticketTypes.map(t => ({
      ...t,
      event_id: event.id,
      // We don't have tenant_id in ticket_types schema according to types.ts (checked lines 1466+)
      // Wait, I should double check if it exists. Looking at lines 1466-1543, it doesn't show tenant_id.
    }));

    const { error: ticketsError } = await supabaseAdmin
      .from("ticket_types")
      .insert(ticketsToInsert);

    if (ticketsError) {
      console.error("Ticket types creation error:", ticketsError);
      // Rollback event
      await supabaseAdmin.from("events").delete().eq("id", event.id);
      throw new Error(ticketsError.message);
    }

    return { success: true, eventId: event.id };
  });
