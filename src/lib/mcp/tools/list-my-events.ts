import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_events",
  title: "Meus eventos (produtor)",
  description:
    "List the events the signed-in producer owns on Zevva Tickets, including drafts and published events.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("events")
      .select("id,title,status,city,category,start_date,end_date,min_price,destaque,created_at")
      .eq("producer_id", ctx.getUserId()!)
      .order("created_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
