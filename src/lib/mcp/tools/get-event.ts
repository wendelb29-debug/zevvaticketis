import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_event",
  title: "Detalhes do evento",
  description:
    "Get full details of one published event on Zevva Tickets, including its available ticket types and prices.",
  inputSchema: {
    event_id: z.string().describe("The event id (UUID)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ event_id }) => {
    const supabase = supabaseAnon();
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .eq("status", "publicado")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!event) {
      return { content: [{ type: "text", text: "Evento não encontrado ou não publicado." }], isError: true };
    }

    const { data: ticketTypes } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", event_id);

    const payload = { event, ticket_types: ticketTypes ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
