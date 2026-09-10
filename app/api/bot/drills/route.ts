import { requireBotToken } from "../../../../lib/bot-auth";
import { createBotDrill } from "../../../../lib/store";

export async function POST(request: Request) {
  const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized;
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { memberId, scenarioId, sendAt } = (body ?? {}) as Record<string, unknown>;
  if ((memberId !== undefined && typeof memberId !== "string") || (scenarioId !== undefined && typeof scenarioId !== "string") || (sendAt !== undefined && typeof sendAt !== "string")) return Response.json({ error: "memberId, scenarioId, and sendAt must be strings" }, { status: 400 });
  const result = createBotDrill(memberId as string | undefined, scenarioId as string | undefined, sendAt as string | undefined);
  if ("error" in result) {
    const error = result.error ?? "invalid_request";
    return Response.json({ error }, { status: error === "rate_limited" ? 429 : error.includes("inactive") || error.includes("paused") ? 403 : 400 });
  }
  return Response.json({ drillId: result.attempt.id, memberId: result.member.id, scenarioLabel: result.scenario.subject, revealPath: `/d/${result.attempt.drillToken}`, scheduledFor: result.attempt.scheduledFor }, { status: 201 });
}
