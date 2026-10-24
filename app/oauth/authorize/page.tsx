import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { parseAuthorizeRequest } from "../../../lib/oauth";
import { decide } from "./actions";

export const metadata = { title: "Connect an assistant | Family Drill", robots: { index: false } };

const PASSED = ["response_type", "client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method", "scope", "resource"];

export default async function AuthorizePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const parsed = await parseAuthorizeRequest(params);
  if ("error" in parsed) {
    if (parsed.redirect) redirect(parsed.redirect);
    return <section className="card login"><span className="eyebrow">Connection problem</span><h1>We couldn&apos;t connect that assistant.</h1><p>{parsed.error}</p></section>;
  }
  const session = await auth();
  const here = `/oauth/authorize?${new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined)).toString()}`;
  if (!session?.user?.email) redirect(`/login?next=${encodeURIComponent(here)}`);
  const { clientName, redirectUri } = parsed.request;
  return <section className="card login consent">
    <span className="eyebrow">Signed in as {session.user.email}</span>
    <h1>Connect {clientName} to Family Drill?</h1>
    <p>{clientName} will be able to add and remove family members, choose practice topics, send practice emails, and see how each one went.</p>
    <p>It never sees anyone&apos;s passwords or inbox, and it can only send Family Drill&apos;s built-in practice emails. To disconnect it later, use Replace code on your install page.</p>
    <p className="help">After you choose, you&apos;ll go back to <b>{new URL(redirectUri).host || redirectUri}</b>. If you didn&apos;t just add a connector in your assistant, choose Cancel.</p>
    <form action={decide}>
      {PASSED.map((key) => params[key] !== undefined && <input key={key} type="hidden" name={key} value={params[key]} />)}
      <div className="actions"><button name="decision" value="allow">Allow</button><button name="decision" value="deny" className="secondary">Cancel</button></div>
    </form>
  </section>;
}
