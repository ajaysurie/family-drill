import Link from "next/link";
import { BOT_INSTALL_URL } from "../../../lib/bot-install";
import { OnboardingSteps } from "../../onboarding-steps";
import { HOSTED_LOGIN_URL } from "../../../lib/constants";

export const metadata = { title: "Get started | Family Drill" };

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Connect your assistant. Pick where Family Drill runs.</h1>
  <p className="lede">Add relatives by telling the bot their names and email addresses in the bot chat. There is no hosted website form for adding family members. Relatives do not set anything up.</p>
  <h2>The easy path</h2>
  <OnboardingSteps />
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Sign in to get your install code</h2><p>Go to <a href={HOSTED_LOGIN_URL}>{HOSTED_LOGIN_URL}</a>. After you verify your email, you&apos;ll land on your install code with setup steps for Grok Bot, Meta Muse, and other assistants. No servers, no email setup.</p><Link className="text-link" href="/docs/bot">See assistant setup →</Link><br /><a className="text-link" href={BOT_INSTALL_URL}>Open the Family Drill bot for Grok →</a></section>
    <section><b>02 · Self-host</b><h2>Run it on your domain</h2><p>Clone the MIT-licensed app, deploy it on your own domain with a Postgres database, and connect Resend for email. Point your assistant at your own origin: the guide, MCP endpoint, and OpenAPI spec all follow your <code>APP_URL</code>.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">Clone the repository ↗</a></section>
  </div>
  <div className="callout"><strong>Tell your family first.</strong> Practice works best when everyone knows it might happen, just not when. Your assistant can send each person a friendly heads-up email that also teaches the 4-question scam check.</div>
  <h2>What happens after a click?</h2><p>The practice link opens a short lesson that points out the clues in that exact email. It never asks for or collects a password, Social Security number, card number, or other secret. <Link href="/examples">Preview every practice email →</Link></p>
  </>; }
