export default function BotDocsPage() {
  return <>
    <span className="eyebrow">Install the bot</span>
    <h1>Run Family Drill from one conversation.</h1>
    <p className="lede">Install the bot, verify as the family organizer, and add your family. The bot sends surprise practice drills and shows you what landed. Your family members do not need to set anything up.</p>

    <div className="status-pill">Template not published</div>
    <p>There is no public bot-template or install link yet. We will add one here when the template is ready.</p>

    <h2>How it works</h2>
    <ol className="numbered">
      <li><span>1</span><div><strong>Install and verify</strong><p>The organizer installs the bot and verifies their email once.</p></div></li>
      <li><span>2</span><div><strong>Add your family</strong><p>Tell the bot who should receive the household&apos;s agreed practice drills.</p></div></li>
      <li><span>3</span><div><strong>Send surprise practice</strong><p>The bot queues fictional scam scenarios at unexpected times.</p></div></li>
      <li><span>4</span><div><strong>See what landed</strong><p>Ask the bot which drills were sent, revealed, or deliberately opened, then review the coaching together.</p></div></li>
    </ol>

    <h2>Hosted or self-hosted</h2>
    <p><strong>Hosted:</strong> use Family Drill on familydrill.com. The hosted bot experience will be available when the template is published.</p>
    <p><strong>Self-hosted:</strong> clone the repository, run the app on your own domain, and connect your own email service when you are ready to move beyond the included console-only mail adapter.</p>

    <h2>Practice, not phishing</h2>
    <p>Every drill uses a fictional organization, never a real brand or sender identity.</p>
    <p>A reveal teaches the clues and never harvests credentials, financial details, or other secrets.</p>

    <p>Bot builders: see <a href="https://github.com/ajaysurie/family-drill/blob/main/docs/bot-api.md">docs/bot-api.md in the repository</a>.</p>
  </>;
}
