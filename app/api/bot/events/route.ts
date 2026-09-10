import { requireBotToken } from "../../../../lib/bot-auth"; import { getBotEvents } from "../../../../lib/store";
export async function GET(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; const since = new URL(request.url).searchParams.get("since") ?? undefined; return Response.json(await getBotEvents(auth.bot.organizerId, since)); }
