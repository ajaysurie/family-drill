"use server";
import { revalidatePath } from "next/cache";
import { sendAttempt } from "../../lib/store";
import { auth } from "../../auth";

export async function sendDrill(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Organizer session required");
  await sendAttempt(session.user.id, String(formData.get("memberId")), String(formData.get("scenarioId")));
  revalidatePath("/admin");
}
