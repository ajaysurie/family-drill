import { requireBotToken } from "../../../../../lib/bot-auth";
import { runBotTool } from "../../../../../lib/bot-tools";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return runBotTool("get_drill", auth.bot.organizerId, { drillId: (await params).id }); }
