import { authenticateBot } from "./store";

export async function requireBotToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : request.headers.get("x-family-drill-token");
  const bot = await authenticateBot(token);
  return bot ? { bot } : { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
}
