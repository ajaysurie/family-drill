import { requireBotToken } from "../../../../lib/bot-auth";
import { runBotTool } from "../../../../lib/bot-tools";
export async function GET(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return runBotTool("list_scenarios", auth.bot.organizerId, {}); }
