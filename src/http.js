#!/usr/bin/env node
/**
 * http.js — OpenCodeWEB MCP over Streamable HTTP (for web clients).
 * Usage: node src/http.js  (PORT env, default 8787)
 */
import http from "node:http";
import { TOOL_DEFS, HANDLERS, toolResult } from "./tools.js";

const PORT = Number(process.env.PORT || 8787);

const server = http.createServer(async (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  const send = (code, obj) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  try {
    if (req.method === "GET" && req.url === "/tools") return send(200, { tools: TOOL_DEFS });
    if (req.method === "POST" && req.url === "/call") {
      let body = "";
      for await (const c of req) body += c;
      const { name, arguments: args } = JSON.parse(body || "{}");
      const fn = HANDLERS[name];
      if (!fn) return send(404, { error: `unknown tool: ${name}` });
      try {
        return send(200, await toolResult(await fn(args || {})));
      } catch (e) {
        return send(200, { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true });
      }
    }
    return send(404, { error: "use GET /tools or POST /call" });
  } catch (e) {
    return send(500, { error: String(e.message || e) });
  }
});

server.listen(PORT, () => console.log(`opencodeweb-mcp http on :${PORT} — GET /tools, POST /call`));
