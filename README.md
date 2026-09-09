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

Organizer identities, agreements, members, attempts, and explicit drill events are persisted in Vercel Postgres (Neon) through Drizzle. Relatives never create accounts: their unguessable drill-token links remain public.

## Quickstart

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
# Apply db/migrations/0001_foundation.sql to the database.
# Optionally apply db/seed.sql for local demo data.
npm test
npm run dev
```

Create a Vercel Postgres/Neon database and put its pooled connection string in `DATABASE_URL`. Set a long random `AUTH_SECRET`, then set `AUTH_URL` and `APP_URL` to the canonical app origin. Sign in at `/login` with an organizer email. In development, leave `EMAIL_SERVER` unset and copy the `[auth:magic-link]` URL from the console. In production, set `EMAIL_SERVER` and `EMAIL_FROM` for a transactional SMTP service such as Resend; these settings deliver login links only, not drills.

Open [http://localhost:3000](http://localhost:3000), then try:

- `/household`: organizer-only agreement status, plain-language terms, member list, and add-member form
- `/admin`: organizer-only surprise-drill controls and sent-versus-deliberate-engagement reports
- `/d/drill-leo`: seeded immediate reveal. A bare GET does not record engagement.

The home page, `/docs/*`, and `/d/[token]` are public. Auth.js gates `/household` and `/admin`; their server actions also require the organizer session, and database queries scope records to that organizer.

`Send surprise drill` writes a local `[mail:stub]` line and unique URL to the development server console. The repository implements only a console drill `MailAdapter`. SMTP configuration is exclusively for organizer login links and does not enable drill delivery.

## Privacy model

The database stores the organizer email identity, household agreement, relative names and email addresses, attempts, and deliberate engagement events. Auth.js stores expiring verification tokens and organizer sessions. Relative links use random tokens and need no relative account. A GET only reveals the lesson; it never records engagement. Drills collect no credentials, payment details, open pixels, attachments, or form answers.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all three scenarios fictional and educational.

## License

MIT. See [LICENSE](LICENSE).
