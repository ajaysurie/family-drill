"use server";
import { redirect } from "next/navigation";
import { acceptInvite } from "../../../lib/store";

export async function accept(token: string) {
  acceptInvite(token);
  redirect(`/invite/${token}?accepted=1`);
}
