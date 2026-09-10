import { authenticateBot } from "./store";

export function requireBotToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : request.headers.get("x-family-drill-token");
  if (!authenticateBot(token)) return Response.json({ error: "Unauthorized" }, { status: 401 });
}
