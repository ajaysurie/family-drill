import Link from "next/link";
import { BOT_TEMPLATE_URL, HOSTED_APP_URL } from "../../../lib/constants";

export default function BotDocsPage() { return <>
  <span className="eyebrow">Install the bot</span><h1>Run Family Drill from one conversation.</h1>
  <p className="lede">Install the bot, verify as the family organizer, and add your family. The bot sends surprise practice drills and shows you what landed. Your family members do not need to set anything up.</p>
  <Link className="button" href={BOT_TEMPLATE_URL}>Install the Family Drill bot</Link>
  <h2>How it works</h2>
  <ol className="numbered">
    <li><span>1</span><div><strong>Install the bot</strong><p>Open the public bot template and add it to your chats.</p></div></li>
    <li><span>2</span><div><strong>Verify on the site</strong><p>Sign in at {HOSTED_APP_URL} with your organizer email.</p></div></li>
    <li><span>3</span><div><strong>Paste your install code</strong><p>Copy the install code shown after verification and paste it into your Family Drill bot chat.</p></div></li>
    <li><span>4</span><div><strong>Add your family</strong><p>Tell the bot who should receive the household&apos;s agreed practice drills, then start sending surprise practice.</p></div></li>
  </ol>
  <h2>Hosted or self-hosted</h2>
  <p><strong>Hosted:</strong> use Family Drill at {HOSTED_APP_URL}. This is the default, so you only need to choose another address if you run your own copy.</p>
  <p><strong>Self-hosted:</strong> clone the repository, run the app on your own domain, and connect your own email service when you are ready to move beyond the included console-only mail adapter.</p>
  <h2>Practice, not phishing</h2><p>Every drill uses a fictional organization, never a real brand or sender identity.</p><p>A reveal teaches the clues and never harvests credentials, financial details, or other secrets.</p>
  <p>Bot builders: see <a href="https://github.com/ajaysurie/family-drill/blob/main/docs/bot-api.md">docs/bot-api.md in the repository</a>.</p>
</>; }
