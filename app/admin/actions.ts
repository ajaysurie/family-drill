"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendAttempt } from "../../lib/store";
import { auth } from "../../auth";

export async function sendDrill(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Organizer session required");
  const sent = await sendAttempt(session.user.id, String(formData.get("memberId")), String(formData.get("scenarioId")));
  if (!sent) redirect("/admin?sendError=Drill+could+not+be+sent.+Confirm+the+household+agreement+and+bot+install+are+active.");
  revalidatePath("/admin");
  redirect("/admin?sent=1");
}
