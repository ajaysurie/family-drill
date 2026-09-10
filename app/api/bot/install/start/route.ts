import { auth } from "../../../../../auth";
import { verifyInstall } from "../../../../../lib/store";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return Response.json({ error: "Verified organizer session required" }, { status: 401 });
  const install = await verifyInstall(session.user.id);
  return install ? Response.json(install, { status: 201 }) : Response.json({ error: "Organizer household not found" }, { status: 404 });
}
