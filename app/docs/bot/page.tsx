import Link from "next/link";
import { appBaseUrl } from "../../../lib/email-assets";
import { BOT_INSTALL_URL } from "../../../lib/bot-install";
import { HOSTED_LOGIN_URL } from "../../../lib/constants";
import { AssistantSetup } from "../../assistant-setup";
import { OnboardingSteps } from "../../onboarding-steps";

export const metadata = { title: "Connect your assistant | Family Drill", description: "Set up Family Drill with Grok Bot, Meta Muse, or any MCP assistant in about five minutes." };

export default function BotDocsPage() {
  return <>
    <span className="eyebrow">Connect your assistant</span>
    <h1>Run Family Drill from one conversation.</h1>
    <p className="lede">Family Drill works with the AI assistant you already use. You sign in once, connect your assistant, and add relatives by telling the bot their names and email addresses in the bot chat. There is no hosted website form for adding family. Your family members do not need to set anything up.</p>
    <p className="actions"><a className="button" href={HOSTED_LOGIN_URL}>Sign in to get your install code →</a><a className="button secondary" href={BOT_INSTALL_URL}>Open the Grok bot</a></p>

    <h2>The easy path</h2>
    <OnboardingSteps />

    <h2>Steps for your assistant</h2>
    <p>Your install page shows these steps with your real code filled in. Here is a preview.</p>
    <AssistantSetup appUrl={appBaseUrl()} />

    <h2>What to say to your assistant</h2>
    <ul className="prompt-list">
      <li>&quot;Add my mom Ruth, ruth@example.com, and send her the heads-up email.&quot;</li>
      <li>&quot;Send one surprise drill to whoever is due.&quot;</li>
      <li>&quot;Skip the school emails, we don't have kids at home.&quot;</li>
      <li>&quot;Dad just told me about a weird toll email. Count it as a catch!&quot;</li>
      <li>&quot;How is everyone doing this month?&quot;</li>
      <li>&quot;Pause everything until after the holidays.&quot;</li>
    </ul>

    <h2>Practice, not phishing</h2>
    <p>Every drill uses a fictional organization, never a real brand or sender identity. A click opens a lesson that never asks for or keeps credentials, financial details, or other secrets. Your assistant follows the same <Link href="/docs/safety">safety rules</Link>.</p>

    <p className="help">Bot builders: see the <a href="/agent.md">assistant guide</a>, the <a href="/openapi.json">OpenAPI spec</a>, and <a href="https://github.com/ajaysurie/family-drill/blob/main/docs/bot-api.md">docs/bot-api.md in the repository</a>.</p>
  </>;
}
