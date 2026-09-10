import { requireBotToken } from "../../../../lib/bot-auth"; import { setPaused } from "../../../../lib/store";
export async function POST(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return Response.json(await setPaused(auth.bot.organizerId, true)); }
