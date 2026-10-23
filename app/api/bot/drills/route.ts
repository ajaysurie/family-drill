import { requireBotToken } from "../../../../lib/bot-auth";
import { runBotTool } from "../../../../lib/bot-tools";

export async function GET(request: Request) {
  const auth = await requireBotToken(request); if ("response" in auth) return auth.response;
  return runBotTool("list_drills", auth.bot.organizerId, { memberId: new URL(request.url).searchParams.get("memberId") ?? undefined });
}

export async function POST(request: Request) {
  const auth = await requireBotToken(request); if ("response" in auth) return auth.response;
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  return runBotTool("send_drill", auth.bot.organizerId, body);
}
