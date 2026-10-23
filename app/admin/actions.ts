"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBotDrill } from "../../lib/store";
import { auth } from "../../auth";

export async function sendDrill(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Organizer session required");
  const result = await createBotDrill(session.user.id, String(formData.get("memberId")), String(formData.get("scenarioId")));
  if ("error" in result) redirect(`/admin?sendError=${encodeURIComponent(`Drill could not be sent (${result.error.replaceAll("_", " ")}).`)}`);
  revalidatePath("/admin");
  redirect("/admin?sent=1");
}
