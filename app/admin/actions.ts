"use server";
import { revalidatePath } from "next/cache";
import { consoleMailAdapter } from "../../lib/mail";
import { sendAttempt } from "../../lib/store";

export async function sendDrill(formData: FormData) {
  const result = sendAttempt(String(formData.get("memberId")), String(formData.get("scenarioId")));
  if (result) await consoleMailAdapter.sendDrill(result);
  revalidatePath("/admin");
}
