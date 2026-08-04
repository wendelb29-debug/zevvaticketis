import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_tickets",
  title: "Meus ingressos",
  description:
    "List the tickets owned by the signed-in Zevva Tickets user, with the event each ticket belongs to.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("tickets")
      .select("id,name,price,status,checked_in_at,created_at,events(id,title,city,start_date,location)")
      .eq("owner_id", ctx.getUserId()!)
      .order("created_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { tickets: data ?? [] },
    };
  },
});
