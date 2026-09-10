import { requireBotToken } from "../../../../lib/bot-auth";
import { getLastAttemptSummary } from "../../../../lib/store";

export async function GET(request: Request) {
  const unauthorized = requireBotToken(request);
  if (unauthorized) return unauthorized;
  return Response.json({ attempt: getLastAttemptSummary() });
}
