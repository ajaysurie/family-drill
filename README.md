# Family Drill

Family Drill is a small, local, open-source app for **household-agreed surprise email drills**. A family accepts one plain-language agreement. An organizer can then send household members unexpected, fictional messages. Opening a drill link shows the reveal and coach tips immediately.

This is practice under a prior household agreement. It is not covert phishing, surveillance, or brand impersonation. The app does not imitate real brands, relatives, banks, or government agencies. It does not request credentials or financial details, use tracking pixels, include attachments, or redirect to an external drill page. Reports count only an explicit button POST. A raw GET, email open, preview, or scanner prefetch does not count.

## Household agreement model

1. The household agrees that surprise practice emails may be sent.
2. Drills use fictional organizations only and never ask for credentials.
3. An organizer can send a drill only while the household agreement is active; there is no per-drill or per-member invite gate.
4. The reveal appears as soon as the unique link loads, but loading it does not score an engagement.
5. The member explicitly chooses **I opened this from the email** before a lure engagement is recorded.
6. The family reviews the clues after a miss. Any member can ask the organizer to stop.

The MVP uses an in-memory seed store with one active household, three members, and one attempt. Changes reset when the server restarts.

## How to run

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then try:

- `/`: product overview and links to the demo and safety documentation
- `/household`: agreement status, plain-language terms, member list, and add-member form
- `/admin`: surprise-drill controls and sent-versus-deliberate-engagement reports
- `/d/drill-leo`: seeded immediate reveal. A bare GET does not record engagement.

`Send surprise drill` writes a local `[mail:stub]` line and unique URL to the development server console. The repository implements only a console `MailAdapter`: it has no real email service, provider secrets, or SendGrid integration. `.env.example` contains only non-secret local settings.

To verify a production build, stop the development server and run:

```bash
npm run build
```

## Privacy model

- Members, drill attempts, and engagement events live only in the server process's in-memory store. Restarting the server restores the seed data and wipes runtime changes.
- [`lib/scenarios.json`](lib/scenarios.json) contains the three committed fictional scenario definitions. It does not store members, attempts, events, or other runtime data.
- The app never asks for passwords, security codes, or payment-card details. It has no open tracking, tracking pixels, attachments, or downloads.
- Visiting a drill URL reveals the exercise but records nothing. An engagement is recorded only after the member deliberately submits the **I opened this from the email** button with a POST request.
- Email delivery uses the console `MailAdapter`. It prints the recipient, fictional subject, and local drill URL to the server console instead of contacting an email provider.
- Do not commit secrets. The checked-in `.env.example` contains only local, non-secret defaults; keep machine-specific values in `.env.local`, which Git ignores.
- A drill is limited to members of the active household and is allowed only under that household's prior agreement. Do not target strangers, coworkers, or anyone outside the agreement.

Read the full [safety and acceptable-use rules](/docs/safety) before running a drill.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all three scenarios fictional and educational.

## License

MIT. See [LICENSE](LICENSE).
