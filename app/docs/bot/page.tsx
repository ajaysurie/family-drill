import { BOT_INSTALL_URL } from "../../../lib/bot-install";
import { OnboardingSteps } from "../../onboarding-steps";

export default function BotDocsPage() {
  return <>
    <span className="eyebrow">Install the bot</span>
    <h1>Run Family Drill from one conversation.</h1>
    <p className="lede">Add relatives by telling the bot their names and email addresses in the bot chat. There is no hosted website form for adding family members. Your family members do not need to set anything up.</p>

    <p><a className="button" href={BOT_INSTALL_URL}>Install the Family Drill bot →</a></p>

    <h2>The easy path</h2>
    <OnboardingSteps />

    <h2>Hosted or self-hosted</h2>
    <p><strong>Hosted:</strong> install the Family Drill bot and use the service on familydrill.com. No app deployment or email-provider setup is required.</p>
    <p><strong>Self-hosted:</strong> clone the repository, run the app on your own domain, and connect your own email service when you are ready to move beyond the included console-only mail adapter.</p>

    <h2>Practice, not phishing</h2>
    <p>Every drill uses a fictional organization, never a real brand or sender identity.</p>
    <p>A reveal teaches the clues and never harvests credentials, financial details, or other secrets.</p>

    <p>Bot builders: see <a href="https://github.com/ajaysurie/family-drill/blob/main/docs/bot-api.md">docs/bot-api.md in the repository</a>.</p>
  </>;
}
