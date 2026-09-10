import { requireBotToken } from "../../../../../lib/bot-auth";
import { canOperate, deleteMember, updateMember } from "../../../../../lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized;
  if (!canOperate()) return Response.json({ error: "Install inactive or household paused" }, { status: 403 });
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const changes = (body ?? {}) as Record<string, unknown>;
  if ((changes.name !== undefined && typeof changes.name !== "string") || (changes.email !== undefined && (typeof changes.email !== "string" || !changes.email.includes("@")))) return Response.json({ error: "Invalid name or email" }, { status: 400 });
  const member = updateMember((await params).id, { name: changes.name as string | undefined, email: changes.email as string | undefined });
  return member ? Response.json({ member }) : Response.json({ error: "Member not found" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireBotToken(request); if (unauthorized) return unauthorized;
  if (!canOperate()) return Response.json({ error: "Install inactive or household paused" }, { status: 403 });
  return deleteMember((await params).id) ? new Response(null, { status: 204 }) : Response.json({ error: "Member not found" }, { status: 404 });
}
