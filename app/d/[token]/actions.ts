"use server";
import { redirect } from "next/navigation";
import { recordLureOpened, recordReveal } from "../../../lib/store";

export async function confirm(token: string) {
  await recordLureOpened(token);
  redirect(`/d/${token}?confirmed=1`);
}

// Called from the browser after the lesson renders. Link scanners and previews fetch the
// page without running scripts, so they never reach this.
export async function markRevealed(token: string) {
  await recordReveal(token);
}
