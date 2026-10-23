// Read-only check that an assistant can reach Family Drill: node scripts/bot-smoke.mjs <app-url> <install-code>
const [base = "http://localhost:3000", code = process.env.FAMILY_DRILL_CODE] = process.argv.slice(2);
if (!code) { console.error("Usage: node scripts/bot-smoke.mjs <app-url> <install-code>"); process.exit(1); }

let failed = false;
const check = (label, ok, detail = "") => { console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? `: ${detail}` : ""}`); failed ||= !ok; };
const rpc = async (url, id, method, params = {}) => (await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) })).json();

const url = `${base}/api/mcp/${code}`, label = "MCP connector URL";
const init = await rpc(url, 1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "bot-smoke", version: "1" } });
check(`${label} initialize`, init.result?.serverInfo?.name === "family-drill", init.error?.message);
const list = await rpc(url, 2, "tools/list");
check(`${label} tools/list`, (list.result?.tools?.length ?? 0) > 0, `${list.result?.tools?.length ?? 0} tools`);
const status = await rpc(url, 3, "tools/call", { name: "get_status", arguments: {} });
check(`${label} get_status`, status.result?.isError === false, JSON.stringify(status.result?.structuredContent ?? status.error));
const rest = await fetch(`${base}/api/bot/tools/get_status`, { method: "POST", headers: { Authorization: `Bearer ${code}` } });
check("HTTPS tool call with bearer header", rest.ok, `${rest.status}`);
for (const path of ["/agent.md", "/openapi.json", "/llms.txt", "/email-assets/logo/family-drill.png"]) {
  const response = await fetch(base + path);
  check(`GET ${path}`, response.ok, `${response.status}`);
}
process.exit(failed ? 1 : 0);
