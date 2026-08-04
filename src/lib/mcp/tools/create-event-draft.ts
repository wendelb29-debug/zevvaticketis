import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_event_draft",
  title: "Criar rascunho de evento",
  description:
    "Create a draft event for the signed-in producer on Zevva Tickets. The draft is not published; the producer reviews and publishes it in the app.",
  inputSchema: {
    title: z.string().describe("Event title."),
    description: z.string().optional().describe("Short description of the event or caravan."),
    city: z.string().optional().describe("City where the event happens."),
    location: z.string().optional().describe("Venue or meeting point."),
    category: z.string().optional().describe("Event category, e.g. caravana, conferencia, retiro."),
    start_date: z.string().optional().describe("Start date in ISO 8601 format."),
    end_date: z.string().optional().describe("End date in ISO 8601 format."),
    min_price: z.number().optional().describe("Starting price in the organization currency."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("events")
      .insert({
        producer_id: ctx.getUserId()!,
        title: input.title,
        description: input.description ?? null,
        city: input.city ?? null,
        location: input.location ?? null,
        category: input.category ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        min_price: input.min_price ?? null,
        status: "rascunho",
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { event: data },
    };
  },
});
