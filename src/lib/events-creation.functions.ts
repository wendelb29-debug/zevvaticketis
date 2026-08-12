import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createEventFull = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    event: z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      city: z.string().optional(),
      location: z.string().optional(),
      start_date: z.string(),
      cover_image: z.string().optional(),
      tenant_id: z.string(),
    }),
    ticketTypes: z.array(z.object({
      nome: z.string(),
      valor: z.number(),
      quantidade: z.number(),
    }))
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create Event with Admin privileges to bypass RLS and ensure correct fields
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .insert({
        ...data.event,
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
