"use server";
import { redirect } from "next/navigation";
import { recordDeliberateClick } from "../../../lib/store";

export async function confirm(token: string) {
  recordDeliberateClick(token);
  redirect(`/d/${token}?confirmed=1`);
}
