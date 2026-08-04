import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchEventsTool from "./tools/search-events";
import getEventTool from "./tools/get-event";
import listMyTicketsTool from "./tools/list-my-tickets";
import listMyEventsTool from "./tools/list-my-events";
import createEventDraftTool from "./tools/create-event-draft";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "build-your-system",
  title: "Build Your System",
  version: "0.1.0",
  instructions:
    "Tools for Zevva Tickets, a marketplace for international caravans and events. Use `search_events` and `get_event` to explore published events, `list_my_tickets` for the signed-in participant's tickets, and `list_my_events` / `create_event_draft` for producers.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchEventsTool,
    getEventTool,
    listMyTicketsTool,
    listMyEventsTool,
    createEventDraftTool,
  ],
});
