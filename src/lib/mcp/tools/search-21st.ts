import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_21st",
  title: "Search 21st.dev Components",
  description: "Search for high-quality React components and UI elements on 21st.dev to use in the project.",
  inputSchema: {
    query: z.string().describe("Search term for components (e.g., 'navbar', 'hero', 'card')"),
  },
  handler: async ({ query }) => {
    // This is a proxy tool definition. The actual search is handled by the 21st MCP server
    // once connected in the Lovable dashboard.
    return {
      content: [{ 
        type: "text", 
        text: `Searching 21st.dev for "${query}"... Please ensure the 21st MCP server (https://21st.dev/api/mcp) is connected in your Lovable dashboard.` 
      }]
    };
  },
});
