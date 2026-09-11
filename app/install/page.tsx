import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../auth";
import { BOT_TEMPLATE_URL } from "../../lib/constants";
import { verifyInstall } from "../../lib/store";
import { InstallCode } from "./install-code";

export default async function InstallPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/login");
  const install = await verifyInstall(session.user.id);
  if (!install) notFound();

  return <section className="card install"><span className="eyebrow">Organizer verified</span><h1>Connect your bot.</h1>
    <p>Copy this install code and paste it into your Family Drill bot chat.</p>
    <InstallCode code={install.botToken} />
    <p className="help">This is not your email password and not a SendGrid, Postmark, or Resend key.</p>
    <Link className="button" href={BOT_TEMPLATE_URL}>Open the Family Drill bot</Link>
    <p className="help">After you paste the code, the bot will help you add your family.</p>
  </section>;
}
