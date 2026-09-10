import { requireBotToken } from "../../../../lib/bot-auth";
import { getHousehold } from "../../../../lib/store";

export async function GET(request: Request) {
  const unauthorized = requireBotToken(request);
  if (unauthorized) return unauthorized;
  return Response.json({ ok: true, agreementActive: getHousehold().status === "active" });
}
