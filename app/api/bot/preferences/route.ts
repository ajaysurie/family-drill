import { requireBotToken } from "../../../../lib/bot-auth";
import { runBotTool } from "../../../../lib/bot-tools";
export async function GET(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return runBotTool("get_preferences", auth.bot.organizerId, {}); }
export async function PATCH(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); } return runBotTool("update_preferences", auth.bot.organizerId, body); }
