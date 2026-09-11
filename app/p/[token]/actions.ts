"use server";
import { redirect } from "next/navigation";
import { recordCredentialSubmit } from "../../../lib/store";
export async function submitPortal(token: string) { await recordCredentialSubmit(token); redirect(`/d/${token}?submitted=1`); }
