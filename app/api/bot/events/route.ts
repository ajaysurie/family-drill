import { requireBotToken } from "../../../../lib/bot-auth";
import { getBotEvents } from "../../../../lib/store";
export async function GET(request: Request) { const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized; const since = new URL(request.url).searchParams.get("since") ?? undefined; return Response.json(getBotEvents(since)); }
