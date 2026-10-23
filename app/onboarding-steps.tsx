import { HOSTED_LOGIN_URL } from "../lib/constants";

const onboardingSteps = [
  ["Sign in with your email", `Open ${HOSTED_LOGIN_URL} and tap the link we email you. You'll land on the page with your install code.`],
  ["Connect your AI assistant", "Use Grok Bot, Meta Muse, or any assistant that supports MCP. Copy the setup message from the install page and paste the install code into the bot chat."],
  ["Tell it about your family", "In the chat, give each relative's name and email address. There is no hosted website form to fill in. Your assistant can send each person a friendly heads-up."],
  ["Drills arrive as a surprise", "The bot sends the drills: realistic emails from invented companies, spaced out, never at night."],
  ["Every click teaches", "The link opens a short lesson that points out the exact clues in that email. Nothing is collected."],
  ["Celebrate the catches", "When someone spots one and tells you, your assistant records the win. Come back to the bot chat to review progress any time."],
];

export function OnboardingSteps() {
  return <ol className="numbered">
    {onboardingSteps.map(([title, copy], index) => <li key={title}>
      <span>{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div>
    </li>)}
  </ol>;
}
