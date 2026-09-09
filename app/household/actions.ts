"use server";
import { revalidatePath } from "next/cache";
import { activateHousehold, addMember } from "../../lib/store";

export async function activateAgreement() {
  activateHousehold();
  revalidatePath("/household");
  revalidatePath("/admin");
}

export async function createMember(formData: FormData) {
  addMember(String(formData.get("name") ?? ""), String(formData.get("email") ?? ""));
  revalidatePath("/household");
  revalidatePath("/admin");
}
