import { verifyInstall } from "../../../../../lib/store";

export async function POST(request: Request) {
  let body: unknown; try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const email = (body as Record<string, unknown> | null)?.email;
  if (typeof email !== "string" || !email.includes("@")) return Response.json({ error: "A valid organizer email is required" }, { status: 400 });
  // Local-only stand-in for a magic-link round trip: pending verification completes immediately.
  return Response.json(verifyInstall(email), { status: 201 });
}
