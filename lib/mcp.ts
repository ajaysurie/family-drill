import { authenticateBot } from "./store";
import { botTools, callBotTool } from "./bot-tools";

// A stateless Streamable HTTP MCP server: JSON-RPC over POST, JSON responses, no SSE stream.
const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
export const MCP_INSTRUCTIONS = "Family Drill sends a household safe, fictional scam-practice emails so relatives learn to spot real scams. Call get_status first and follow its nextSteps. Only add people the organizer says agreed to practice. Never reveal upcoming drills to recipients. If anyone asks to stop, call pause_drills or remove_member right away. After a click, coach kindly with get_drill. Celebrate reports with record_report. The full guide is at /agent.md.";

type JsonRpcMessage = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };
const reply = (id: JsonRpcMessage["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const error = (id: JsonRpcMessage["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function handle(message: JsonRpcMessage, organizerId: string) {
  if (!message || typeof message !== "object" || message.jsonrpc !== "2.0" || typeof message.method !== "string") return error(message?.id, -32600, "Invalid Request");
  const { id, method, params = {} } = message;
  if (method === "initialize") {
    const requested = typeof params.protocolVersion === "string" ? params.protocolVersion : "";
    return reply(id, { protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[1], capabilities: { tools: { listChanged: false } }, serverInfo: { name: "family-drill", title: "Family Drill", version: "1.0.0" }, instructions: MCP_INSTRUCTIONS });
  }
  if (method === "ping") return reply(id, {});
  if (method === "tools/list") return reply(id, { tools: botTools.map(({ name, title, description, inputSchema, readOnly }) => ({ name, title, description, inputSchema, annotations: { title, readOnlyHint: readOnly, destructiveHint: name === "remove_member", openWorldHint: name === "send_drill" || name === "add_member" } })) });
  if (method === "tools/call") {
    const name = typeof params.name === "string" ? params.name : "";
    if (!botTools.some((tool) => tool.name === name)) return error(id, -32602, `Unknown tool: ${name}`);
    const { status, body } = await callBotTool(name, organizerId, params.arguments);
    return reply(id, { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], structuredContent: body, isError: status >= 400 });
  }
  return error(id, -32601, `Method not found: ${method}`);
}

export async function handleMcpRequest(request: Request, token: string | null) {
  const bot = await authenticateBot(token);
  if (!bot) return Response.json(error(null, -32001, "Unauthorized: use the install code from your Family Drill install page."), { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="family-drill"' } });
  let payload: unknown;
  try { payload = await request.json(); } catch { return Response.json(error(null, -32700, "Parse error"), { status: 400 }); }
  const messages = (Array.isArray(payload) ? payload : [payload]) as JsonRpcMessage[];
  const requests = messages.filter((message) => message && typeof message === "object" && "method" in message && message.id !== undefined);
  if (!requests.length) return new Response(null, { status: 202 });
  const responses = await Promise.all(requests.map((message) => handle(message, bot.organizerId)));
  return Response.json(Array.isArray(payload) ? responses : responses[0]);
}

export const mcpMethodNotAllowed = () => new Response("Family Drill's MCP server accepts JSON-RPC over POST only.", { status: 405, headers: { Allow: "POST" } });
