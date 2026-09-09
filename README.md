# Family Drill

Family Drill is a local app for household-agreed surprise email drills. A household accepts one plain-language agreement. An organizer can then send household members unexpected, fictional messages. Opening a drill link shows the reveal and coaching tips immediately.

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

Open these URLs while the development server is running:

- [http://localhost:3000](http://localhost:3000): app home
- [http://localhost:3000/household](http://localhost:3000/household): agreement status, terms, member list, and add-member form
- [http://localhost:3000/admin](http://localhost:3000/admin): drill controls and reports
- [http://localhost:3000/d/drill-leo](http://localhost:3000/d/drill-leo): seeded reveal page

On the admin page, `Send surprise drill` creates an in-memory attempt. It then writes a `[mail:stub]` line with the unique drill URL to the server console. It does not send email.

To check a production build, stop the development server and run:

```bash
npm run build
```

## Privacy model

Family Drill is a local demonstration, not a hosted service.

### Stored data

- The running Node.js process holds the `HouseholdAgreement`, `Member`, `Attempt`, and `DrillEvent` records in memory.
- Scenario definitions are stored on disk in [`lib/scenarios.json`](lib/scenarios.json).
- Restarting the server clears runtime changes. The seeded household, members, and attempt return on the next start.

### Data the app does not collect

- The app does not store passwords, card numbers, or bank information.
- It does not use tracking pixels or collect email-open, preview, or prefetch telemetry.
- A bare `GET /d/[token]` only displays the reveal. It does not count as engagement. The app records a score only after the member deliberately presses **I opened this from the email**, which sends a `POST` request.

### Mail and secrets

- This repository includes only the console `MailAdapter` stub. It does not connect to an email provider.
- Provider secrets must not be committed to Git. [`.env.example`](.env.example) contains only non-secret local settings.

### Household boundaries

- Drills are practice for members covered by the household agreement. They do not require per-drill consent.
- The app must not impersonate real brands, spoof a `From` address, or show credential forms.
- See the in-app [safety rules](http://localhost:3000/docs/safety) for the full acceptable-use policy.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all scenarios fictional and educational.

## License

MIT. See [LICENSE](LICENSE).
