import { requireBotToken } from "../../../../lib/bot-auth";
import { getInstall } from "../../../../lib/store";
export async function GET(request: Request) { const auth = await requireBotToken(request); if ("response" in auth) return auth.response; return Response.json(await getInstall(auth.bot.token)); }
