const onboardingSteps = [
  ["Install the bot", "Install the published Family Drill bot."],
  ["Verify your email", "Open https://app.familydrill.com/login and verify your organizer email."],
  ["Copy the install code", "After verification, you'll land on the page with your install code."],
  ["Connect the bot", "Paste the install code into the bot chat."],
  ["Add your family in the chat", "Tell the bot each relative's name and email address. There is no hosted website form for adding family members."],
  ["Send and review", "The bot sends the drills. Return to the bot chat to review what happened."],
];

export function OnboardingSteps() {
  return <ol className="numbered">
    {onboardingSteps.map(([title, copy], index) => <li key={title}>
      <span>{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div>
    </li>)}
  </ol>;
}
