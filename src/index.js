#!/usr/bin/env node
/**
 * index.js — OpenCodeWEB MCP server (stdio).
 * Usage: npx @opencodeweb/mcp  OR  node src/index.js
 * Claude Desktop config: { "mcpServers": { "opencodeweb": { "command": "npx", "args": ["-y", "@opencodeweb/mcp"] } } }
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFS, HANDLERS, toolResult } from "./tools.js";

const server = new Server({ name: "opencodeweb", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const fn = HANDLERS[name];
  if (!fn) throw new Error(`unknown tool: ${name}`);
  try {
    return toolResult(await fn(args || {}));
  } catch (e) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
