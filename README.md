# MCP — OpenCodeWEB Model Context Protocol Server

> **Universal AI-tool bridge** for the sovereign ecosystem — `GDBx` (data mesh) + `DSGx` (support) + `GDMx` (payments). Any MCP client (Claude Desktop, Cursor, opencode) can call the live mesh. **Free, MIT, zero hosting cost.**

**Repo:** `github.com/OpenCodeWEB/MCP` · **Live mesh:** `https://gdbx.xup.workers.dev`

## 8 Tools

| Tool | Description |
|---|---|
| `gdbx_did_resolve` | Resolve `did:gdbx` identity for an address |
| `gdbx_sync_get` | Read merged CRDT deltas (`?prefix=` filter) |
| `gdbx_name_resolve` | Resolve verified `.gdbx` name (e.g. `absup`) |
| `gdbx_names_list` | List global `.gdbx` registry |
| `gdbx_apikey_verify` | Verify `GDBx****AB` API key |
| `gdmx_providers` | List 7 fiat on-ramps + configured status |
| `gdmx_create_checkout` | Card→USDC checkout (fastest provider wins) |
| `dsgx_profile` | Developer support profile (`ABsUP`) |

## Usage

```bash
npm i
npm test          # 8 tools + live mesh tests
npm start         # stdio (Claude Desktop)
npm run http      # :8787 — GET /tools, POST /call
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{ "mcpServers": { "opencodeweb": { "command": "npx", "args": ["-y", "@opencodeweb/mcp"] } } }
```

**HTTP:**
```bash
curl localhost:8787/tools
curl -X POST localhost:8787/call -H 'content-type: application/json' \
  -d '{"name":"gdbx_name_resolve","arguments":{"name":"absup"}}'
```

## Principles

- **Non-custodial** — reads are open, writes stay signed client-side
- **0% fee** — only gas, no gateway cut
- **MIT** — fork, self-host, no vendor lock
