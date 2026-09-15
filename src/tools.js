/**
 * tools.js — OpenCodeWEB MCP tool definitions + handlers.
 * All tools call the live sovereign mesh (no custody, reads are open).
 */
export const WORKER = process.env.GDBX_WORKER || "https://gdbx.xup.workers.dev";

async function getJSON(url, opts = {}) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok && !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

export const TOOL_DEFS = [
  {
    name: "gdbx_did_resolve",
    description: "Resolve a did:gdbx identity document for a .GDBx address.",
    inputSchema: {
      type: "object",
      properties: { addr: { type: "string", description: "56-char .GDBx address (without .gdbx suffix)" } },
      required: ["addr"],
    },
  },
  {
    name: "gdbx_sync_get",
    description: "Read merged CRDT state (deltas) for an address, optionally filtered by key prefix.",
    inputSchema: {
      type: "object",
      properties: {
        addr: { type: "string" },
        prefix: { type: "string", description: "Key prefix filter, e.g. tld/gdbx/" },
      },
      required: ["addr"],
    },
  },
  {
    name: "gdbx_name_resolve",
    description: "Resolve a verified .gdbx short name (e.g. absup → https://absup.org). Server-side PoW+sig verified.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Name without .gdbx suffix" } },
      required: ["name"],
    },
  },
  {
    name: "gdbx_names_list",
    description: "List all claimed .gdbx names (global registry, newest first).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "gdbx_apikey_verify",
    description: "Verify a GDBx****AB API key. Returns owner prefix + address.",
    inputSchema: {
      type: "object",
      properties: { key: { type: "string", description: "Full GDBx****AB key" } },
      required: ["key"],
    },
  },
  {
    name: "gdmx_providers",
    description: "List fiat on-ramp providers (MoonPay, Transak, Ramp, Banxa, Wert, Stripe) with configured status.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "gdmx_create_checkout",
    description: "Create a card→USDC checkout (parallel race, fastest provider wins, direct to merchant wallet).",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Merchant EVM address" },
        amount: { type: "string", description: "USD amount, e.g. 5" },
        provider: { type: "string", description: "Preferred provider id (optional)" },
        chainId: { type: "string", description: "EVM chain id (optional)" },
      },
      required: ["to", "amount"],
    },
  },
  {
    name: "dsgx_profile",
    description: "Get a developer support profile (dsgx.pages.dev/<login>) with wallet + verified status.",
    inputSchema: {
      type: "object",
      properties: { login: { type: "string", description: "GitHub login, e.g. ABsUP" } },
      required: ["login"],
    },
  },
];

export const HANDLERS = {
  async gdbx_did_resolve({ addr }) {
    return getJSON(`${WORKER}/did/${encodeURIComponent(addr)}`);
  },
  async gdbx_sync_get({ addr, prefix }) {
    const q = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
    return getJSON(`${WORKER}/sync/${encodeURIComponent(addr)}${q}`);
  },
  async gdbx_name_resolve({ name }) {
    return getJSON(`${WORKER}/name/${encodeURIComponent(String(name).toLowerCase())}`);
  },
  async gdbx_names_list() {
    return getJSON(`${WORKER}/names`);
  },
  async gdbx_apikey_verify({ key }) {
    return getJSON(`${WORKER}/apikey/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    });
  },
  async gdmx_providers() {
    return getJSON(`${WORKER}/gdmx/providers`);
  },
  async gdmx_create_checkout({ to, amount, provider, chainId }) {
    const p = new URLSearchParams({ to, amount: String(amount) });
    if (provider) p.set("provider", provider);
    if (chainId) p.set("chainId", String(chainId));
    return getJSON(`${WORKER}/gdmx/create-checkout?${p}`);
  },
  async dsgx_profile({ login }) {
    return getJSON(`${WORKER}/dsgx/route/${encodeURIComponent(String(login).toLowerCase())}`);
  },
};

export function toolResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
