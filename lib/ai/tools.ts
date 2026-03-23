import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { Calculator } from "@langchain/community/tools/calculator";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export function buildTools() {
  const tools = [];

  // Web Search via Tavily
  if (process.env.TAVILY_API_KEY) {
    tools.push(
      new TavilySearchResults({
        maxResults: 5,
        apiKey: process.env.TAVILY_API_KEY,
      })
    );
  }

  // Calculator
  tools.push(new Calculator());

  // Current datetime tool
  const currentDatetimeTool = tool(
    async () => {
      return new Date().toISOString();
    },
    {
      name: "current_datetime",
      description: "Get the current date and time in ISO format",
      schema: z.object({}),
    }
  );
  tools.push(currentDatetimeTool);

  return tools;
}
