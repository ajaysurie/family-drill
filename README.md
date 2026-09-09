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

## Quickstart

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then try:

- `/household`: agreement status, plain-language terms, member list, and add-member form
- `/admin`: surprise-drill controls and sent-versus-deliberate-engagement reports
- `/d/drill-leo`: seeded immediate reveal. A bare GET does not record engagement.

`Send surprise drill` writes a local `[mail:stub]` line and unique URL to the development server console. The repository implements only a console `MailAdapter`: it has no real email service, provider secrets, or SendGrid integration. `.env.example` contains only non-secret local settings.

## Brand assets

The original artwork lives in [`public/brand`](public/brand) as hand-authored SVG text files. The house mark and coaching illustration use the interface palette (`#17312b` ink, `#176b52` forest green, `#fbfaf5` paper, and `#dff3e9` mint) and depict only fictional, household-focused practice. Keep brand contributions as text-based SVG—do not add PNG, JPEG, WebP, real-company logos, or credential-entry imagery.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all three scenarios fictional and educational.

## License

MIT. See [LICENSE](LICENSE).
