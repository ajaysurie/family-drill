import { requireBotToken } from "../../../../../lib/bot-auth";
import { runBotTool } from "../../../../../lib/bot-tools";

// Every MCP tool is also callable as plain JSON over HTTPS for assistants that write their own connectors.
export async function POST(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const auth = await requireBotToken(request); if ("response" in auth) return auth.response;
  const raw = await request.text();
  let body: unknown = {};
  if (raw.trim()) { try { body = JSON.parse(raw); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); } }
  return runBotTool((await params).name, auth.bot.organizerId, body);
}
