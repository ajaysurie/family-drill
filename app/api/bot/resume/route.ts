import { requireBotToken } from "../../../../lib/bot-auth";
import { setPaused } from "../../../../lib/store";
export async function POST(request: Request) { const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized; return Response.json(setPaused(false)); }
