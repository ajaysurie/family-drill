import { requireBotToken } from "../../../../lib/bot-auth";
import { addMember, canOperate, getMembers } from "../../../../lib/store";

export async function GET(request: Request) {
  const unauthorized = requireBotToken(request);
  if (unauthorized) return unauthorized;
  return Response.json({ members: getMembers().map(({ id, name, email }) => ({ id, name, email })) });
}

export async function POST(request: Request) {
  const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized;
  if (!canOperate()) return Response.json({ error: "Install inactive or household paused" }, { status: 403 });
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { name, email } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || !email.includes("@")) return Response.json({ error: "Valid name and email are required" }, { status: 400 });
  return Response.json({ member: addMember(name, email) }, { status: 201 });
}
