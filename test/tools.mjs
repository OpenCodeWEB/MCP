import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TOOL_DEFS, HANDLERS, toolResult } from "../src/tools.js";

describe("tool defs", () => {
  it("has 8 tools with valid schemas", () => {
    assert.equal(TOOL_DEFS.length, 8);
    for (const t of TOOL_DEFS) {
      assert.ok(t.name, "name");
      assert.ok(t.description, "description");
      assert.equal(t.inputSchema.type, "object");
    }
  });
  it("every def has a handler", () => {
    for (const t of TOOL_DEFS) assert.equal(typeof HANDLERS[t.name], "function", t.name);
  });
  it("toolResult wraps JSON text", () => {
    const r = toolResult({ ok: true });
    assert.equal(r.content[0].type, "text");
    assert.match(r.content[0].text, /"ok": true/);
  });
});

describe("live mesh tools", () => {
  it("gdbx_names_list returns global registry", async () => {
    const j = await HANDLERS.gdbx_names_list({});
    assert.equal(j.ok, true);
    assert.ok(j.count >= 1);
    assert.ok(Array.isArray(j.names));
  });
  it("gdbx_name_resolve absup", async () => {
    const j = await HANDLERS.gdbx_name_resolve({ name: "absup" });
    assert.equal(j.ok, true);
    assert.equal(j.name, "absup");
  });
  it("gdmx_providers lists 7 on-ramps", async () => {
    const j = await HANDLERS.gdmx_providers({});
    assert.equal(j.ok, true);
    assert.equal(j.providers.length, 7);
  });
  it("dsgx_profile ABsUP", async () => {
    const j = await HANDLERS.dsgx_profile({ login: "ABsUP" });
    assert.equal(j.ok, true);
    assert.equal(j.route.login, "ABsUP");
  });
  it("gdbx_apikey_verify rejects bad format", async () => {
    const j = await HANDLERS.gdbx_apikey_verify({ key: "GDBx000AB" }).catch((e) => ({ error: e.message }));
    assert.ok(j.error || j.ok === false);
  });
});
