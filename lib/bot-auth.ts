import { authenticateBot } from "./store";

export function tokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : request.headers.get("x-family-drill-token");
}

export async function requireBotToken(request: Request) {
  const bot = await authenticateBot(tokenFromRequest(request));
  return bot ? { bot } : { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
}
