"use server";
import { signIn, signOut } from "../../auth";
import { safeNext } from "../../lib/safe-next";

export async function requestMagicLink(formData: FormData) {
  await signIn("nodemailer", { email: String(formData.get("email") ?? ""), redirectTo: safeNext(formData.get("next")) });
}

export async function logOut() { await signOut({ redirectTo: "/" }); }
