import { requireBotToken } from "../../../../../../lib/bot-auth";
import { runBotTool } from "../../../../../../lib/bot-tools";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return runBotTool("record_report", auth.bot.organizerId, { drillId: (await params).id }); }
