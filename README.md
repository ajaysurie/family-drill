# Family Drill

Family Drill is an open-source web app for **household-agreed surprise email drills**, run from an AI assistant such as Grok Bot or Meta Muse. A family accepts one plain-language agreement. The organizer's assistant then sends household members unexpected, fictional messages. Opening a drill link shows a lesson that points out the exact clues in that email.

Email artwork (each fictional brand's logo and each scenario's hero illustration) is rendered to PNG at build time by `app/email-assets/[kind]/[file]/route.tsx` and served from `/email-assets/...`. Every recipient loads the same static URL with no query string, so an image load cannot identify who opened a message. Images carry alt text and colored backgrounds so a message still reads well when a mail client blocks images. No binary assets are stored in git.

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
# The app applies db/migrations/0001_foundation.sql automatically on first query.
# For an existing database, 0003_time_zone_and_reports.sql adds the newest columns.
# Optionally apply db/seed.sql for local demo data.
npm test
npm run dev
```

Create a Vercel Postgres/Neon database and put its pooled connection string in `DATABASE_URL`. Set a long random `AUTH_SECRET`, then set `AUTH_URL` and `APP_URL` to the canonical app origin. The hosted values are `https://app.familydrill.com`; replace both with your own origin when self-hosting. Sign in at `/login` with an organizer email. In development without a Resend key, copy the `[auth:magic-link]` URL from the server console.

For production metrics, enable Web Analytics and Speed Insights in the Vercel project if they are not already enabled. Their packages send no data during local development.

Open [http://localhost:3000](http://localhost:3000), then try these self-hosted development and evaluation routes (they are intentionally not linked from the public site navigation):

- `/household`: organizer-only agreement status, plain-language terms, member list, and add-member form
- `/admin`: organizer-only surprise-drill controls and sent-versus-deliberate-engagement reports
- `/d/drill-leo`: seeded immediate reveal. A bare GET does not record anything; the page's script records a click.
- `/examples`: every practice email rendered exactly as sent, with its lesson
- `/learn`: the family teaching page (4-question check, conversation tips, printable card)

The home page, `/docs/*`, and `/d/[token]` are public. Auth.js gates `/household` and `/admin`; their server actions also require the organizer session, and database queries scope records to that organizer.

Drills respect quiet hours (21:00 to 08:00) in the household's time zone, which the assistant sets with `update_preferences`. A future `sendAt` (up to 72 hours ahead) is handed to Resend's scheduler. Surprise picks go to the member with the fewest drills who has not had one in 12 hours, using a lure they have not seen from a different category than their last one.

`Send surprise drill` writes a local `[mail:stub]` line and unique URL to the development server console by default. For production drill delivery, set `MAIL_ADAPTER=resend`, `RESEND_API_KEY` to a Resend API key, and `EMAIL_FROM` to a sender on a verified domain. The same Resend key sends organizer magic links in production. Set `EMAIL_FROM_AUTH` to use a different verified sender for sign-in mail; otherwise it falls back to `EMAIL_FROM`. Production sign-in fails loudly if `RESEND_API_KEY` is absent, while local development logs the magic link when no key is configured. Drills keep the verified sending address and borrow only the fictional display name (for example `SwiftBox Delivery <drills@familydrill.com>`), so "check the real address" is always a catchable clue. Each drill carries an `X-Family-Drill: household-practice-drill` header. Adding a member with `sendHeadsUp` sends a branded, honest heads-up email from `EMAIL_FROM`.

## Assistants: Grok Bot, Meta Muse, and MCP

Organizers sign in at `/login` and land on `/install`, which shows their install code and step-by-step setup for Grok Bot, Meta Muse, and other assistants. Revisiting `/install` keeps the same code; **Replace code** rotates it.

Every assistant uses the same tool registry (`lib/bot-tools.ts`) through one of three doors:

- **Remote MCP server**: `POST /api/mcp` with `Authorization: Bearer <install code>`, or `POST /api/mcp/<install code>` for assistants that only store a URL. Stateless Streamable HTTP with JSON responses.
- **HTTPS tools**: `POST /api/bot/tools/<tool_name>` with a JSON body. `GET /api/bot/tools` lists tools with JSON schemas, and `/openapi.json` describes them.
- **The original REST routes** in the [eggbot API contract](docs/bot-api.md).

`/agent.md` is the assistant guide: setup conversation, cadence, coaching, and hard safety rules. Paste it into a Grok Bot's skills when publishing a bot template (never include an install code in a template), or let an assistant read it from the setup message. `/llms.txt` points crawlers and agents at all of it.

Check a live connection without changing anything:

```bash
npm run smoke:bot -- https://app.familydrill.com <install-code>
```

## Privacy model

The database stores the organizer email identity, household agreement, relative names and email addresses, attempts, and deliberate engagement events. Auth.js stores expiring verification tokens and organizer sessions. Relative links use random tokens and need no relative account. A GET only reveals the lesson. A click is recorded only after the lesson page's script runs in a browser, which link scanners and previews do not do, and a confirmed click only after the member presses the button. Drills collect no credentials, payment details, open pixels, attachments, or form answers.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all scenarios fictional and educational.

## License

MIT. See [LICENSE](LICENSE).

## Lure variety and safety

The scenario pack covers six organizer-selectable categories: package and delivery; bank, payment, and toll alerts; subscriptions and cloud storage; tech support and virus notices; school and kids accounts; and account lockouts and shared files. Organizers can disable any category through their assistant or the household page; surprise selection uses only enabled categories. An optional SMS bubble is a preview only and does not send texts.

All lure identities are fictional: SwiftBox, Riverline Bank, Streamly, SoftShield, Maple District Portal, PayNest, Crestway Tolls, Cloudnook Photos, and Sharefold. Each scenario lists the specific `clues` its lesson page explains. Their colors and geometric marks were created for this project. Do not replace them with real trademarks, lookalike domains, or trade dress. The practice sign-in page (for `portalStage` scenarios) has inputs with no `name`, so field values never leave the browser; it stores only that the button was pressed.
