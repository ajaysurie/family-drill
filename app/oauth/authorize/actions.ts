"use server";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { issueCode, parseAuthorizeRequest } from "../../../lib/oauth";

// Hidden fields are re-validated here; the page's earlier check is not trusted.
export async function decide(formData: FormData) {
  const params = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)]));
  const parsed = await parseAuthorizeRequest(params);
  if ("error" in parsed) redirect(parsed.redirect ?? "/install");
  const { request } = parsed;
  if (params.decision !== "allow") {
    const url = new URL(request.redirectUri);
    url.searchParams.set("error", "access_denied");
    if (request.state) url.searchParams.set("state", request.state);
    redirect(url.toString());
  }
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const target = await issueCode(session.user.id, request);
  redirect(target ?? "/install");
}
