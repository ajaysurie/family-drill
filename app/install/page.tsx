import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../auth";
import { appBaseUrl } from "../../lib/email-assets";
import { verifyInstall } from "../../lib/store";
import { AssistantSetup } from "../assistant-setup";
import { CopyButton } from "../copy-button";
import { replaceInstallCode } from "./actions";

export default async function InstallPage({ searchParams }: { searchParams: Promise<{ replaced?: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/login");
  const install = await verifyInstall(session.user.id);
  if (!install) notFound();
  const { replaced } = await searchParams;

  return <section className="install-page">
    <span className="eyebrow">Signed in as {session.user.email}</span>
    <h1>Connect your assistant.</h1>
    <p className="lede">Your install code links your AI assistant to your family's practice program. Copy it, then follow the steps for the assistant you use.</p>
    {replaced && <p className="notice" role="status">New code created. The old code no longer works, so update your assistant.</p>}
    <div className="install-code"><span>Install code</span><code>{install.botToken}</code><CopyButton value={install.botToken} /></div>
    <p className="help">Keep this code private. Anyone with it can manage your family's drills. It stays the same until you replace it.</p>
    <AssistantSetup appUrl={appBaseUrl()} code={install.botToken} />
    <div className="install-footer">
      <p>Next, your assistant will ask for your name, your time zone, and who to add. Relatives never need an account.</p>
      <p><Link href="/learn">While you wait: how to talk to your family about scams →</Link></p>
      <form action={replaceInstallCode}><button className="secondary">Replace code</button><small className="help">Use this if the code was shared by mistake.</small></form>
    </div>
  </section>;
}
