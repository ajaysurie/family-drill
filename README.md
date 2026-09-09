# Family Drill

Family Drill is a tiny, local, open-source app for **household-agreed surprise email practice**. A family makes one plain-language agreement up front; an organizer can then send members unexpected but entirely fictional exercises. Following a drill link reveals the lesson immediately and gives the family a short, shame-free coaching script.

This is practice under a prior family agreement—not covert real phishing, surveillance, or brand impersonation. The app never imitates real brands, relatives, banks, or government agencies; requests credentials or financial details; uses tracking pixels; ships attachments; or redirects to an external drill page. Reports count only an explicit button POST—not a raw GET, email open, preview, or scanner prefetch.

## Household agreement model

1. The household agrees that surprise practice emails may be sent.
2. Drills use fictional organizations only and never ask for credentials.
3. An organizer can send a drill only while the household agreement is active; there is no per-drill or per-member invite gate.
4. The reveal appears as soon as the unique link loads, but loading it does not score an engagement.
5. The member explicitly chooses **I opened this from the email** before a lure engagement is recorded.
6. Family coaches kindly after a miss, and any member can ask the organizer to stop.

The MVP uses an in-memory seed store with one active household, three members, and one attempt. Changes reset when the server restarts.

## Quickstart

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then try:

- `/household` — agreement status, plain-language terms, member list, and add-member form
- `/admin` — surprise-drill controls and sent-versus-deliberate-engagement reports
- `/d/drill-leo` — seeded immediate reveal; a bare GET does not record engagement

`Send surprise drill` writes a local `[mail:stub]` line and unique URL to the development server console. The repository implements only a console `MailAdapter`: it has no real email service, provider secrets, or SendGrid integration. `.env.example` contains only non-secret local settings.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all three scenarios fictional and educational.

## License

MIT — see [LICENSE](LICENSE).
