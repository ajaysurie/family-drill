"use server";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { verifyInstall } from "../../lib/store";

export async function replaceInstallCode() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await verifyInstall(session.user.id, true);
  redirect("/install?replaced=1");
}
