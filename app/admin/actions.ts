"use server";
import { revalidatePath } from "next/cache";
import { consoleMailAdapter } from "../../lib/mail";
import { sendAttempt } from "../../lib/store";
import { auth } from "../../auth";

export async function sendDrill(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Organizer session required");
  const result = await sendAttempt(session.user.id, String(formData.get("memberId")), String(formData.get("scenarioId")));
  if (result) await consoleMailAdapter.sendDrill(result);
  revalidatePath("/admin");
}
