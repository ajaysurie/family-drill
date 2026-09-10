"use server";
import { revalidatePath } from "next/cache";
import { activateHousehold, addMember } from "../../lib/store";
import { auth } from "../../auth";

export async function activateAgreement() {
  const session = await auth(); if (!session?.user?.id) throw new Error("Organizer session required");
  await activateHousehold(session.user.id);
  revalidatePath("/household");
  revalidatePath("/admin");
}

export async function createMember(formData: FormData) {
  const session = await auth(); if (!session?.user?.id) throw new Error("Organizer session required");
  await addMember(session.user.id, String(formData.get("name") ?? ""), String(formData.get("email") ?? ""));
  revalidatePath("/household");
  revalidatePath("/admin");
}
