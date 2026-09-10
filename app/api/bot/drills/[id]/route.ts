import { requireBotToken } from "../../../../../lib/bot-auth";
import { findAttemptById, getMembers, hasLureEngagement, scenarios } from "../../../../../lib/store";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized;
  const drill = findAttemptById((await params).id); if (!drill) return Response.json({ error: "Drill not found" }, { status: 404 });
  const scenario = scenarios.find((item) => item.id === drill.scenarioId)!; const member = getMembers().find((item) => item.id === drill.memberId);
  const lureDeliberate = hasLureEngagement(drill.id);
  return Response.json({ drillId: drill.id, memberName: member?.name ?? "Former household member", scenarioLabel: scenario.subject, lessonBullets: scenario.lesson, lureDeliberate, lureEngagementMethod: lureDeliberate ? "explicit_button" : null });
}
