import { requireBotToken } from "../../../../lib/bot-auth";
import { scheduleBotDrill } from "../../../../lib/store";
import type { QuietHours } from "../../../../lib/types";

function isQuietHours(value: unknown): value is QuietHours {
  if (typeof value !== "object" || value === null) return false;
  const hours = value as Record<string, unknown>;
  return typeof hours.start === "string" && typeof hours.end === "string" && typeof hours.timezone === "string";
}

export async function POST(request: Request) {
  const unauthorized = requireBotToken(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof body !== "object" || body === null) return Response.json({ error: "Invalid request body" }, { status: 400 });
  const { memberId, scenarioId, quietHours } = body as Record<string, unknown>;
  if (typeof memberId !== "string" || typeof scenarioId !== "string" || (quietHours !== undefined && !isQuietHours(quietHours))) {
    return Response.json({ error: "memberId and scenarioId are required; quietHours must include start, end, and timezone" }, { status: 400 });
  }

  const result = scheduleBotDrill(memberId, scenarioId, quietHours as QuietHours | undefined);
  if ("error" in result) {
    const status = result.error === "agreement_inactive" ? 403 : 404;
    return Response.json({ error: result.error }, { status });
  }
  return Response.json({ scheduled: true, intent: result.intent }, { status: 201 });
}
