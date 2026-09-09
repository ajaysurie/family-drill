"use server";
import { redirect } from "next/navigation";
import { recordLureOpened } from "../../../lib/store";

export async function confirm(token: string) {
  await recordLureOpened(token);
  redirect(`/d/${token}?confirmed=1`);
}
