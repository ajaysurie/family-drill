"use server";
import { signIn, signOut } from "../../auth";

export async function requestMagicLink(formData: FormData) {
  await signIn("nodemailer", { email: String(formData.get("email") ?? ""), redirectTo: "/household" });
}

export async function logOut() { await signOut({ redirectTo: "/" }); }
