import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { safeNext } from "../../lib/safe-next";
import { requestMagicLink } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await auth()) redirect(next);
  return <section className="card login"><span className="eyebrow">Organizer sign in</span><h1>Sign in to connect your assistant.</h1>
    <p>Enter your email and we'll send a one-time sign-in link. Household members do not need accounts.</p>
    <form action={requestMagicLink}><input type="hidden" name="next" value={next} /><label>Email address<input type="email" name="email" autoComplete="email" required /></label><button>Send sign-in link</button></form>
    <p className="help">The link expires after 24 hours. If you did not request one, you can ignore the email.</p>
  </section>;
}
