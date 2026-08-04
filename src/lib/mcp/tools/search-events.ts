import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_events",
  title: "Buscar eventos",
  description:
    "Search published events on Zevva Tickets by text, city or category. Returns title, city, dates and starting price.",
  inputSchema: {
    query: z.string().optional().describe("Free text matched against the event title."),
    city: z.string().optional().describe("Filter by city name."),
    category: z.string().optional().describe("Filter by event category."),
    limit: z.number().int().optional().describe("Maximum number of events to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, city, category, limit }) => {
    const max = Math.min(Math.max(limit ?? 10, 1), 50);
    let request = supabaseAnon()
      .from("events")
      .select("id,title,description,city,location,category,start_date,end_date,min_price,cover_image")
      .eq("status", "publicado")
      .order("start_date", { ascending: true })
      .limit(max);

    if (query) request = request.ilike("title", `%${query}%`);
    if (city) request = request.ilike("city", `%${city}%`);
    if (category) request = request.eq("category", category);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
