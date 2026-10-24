# Family Drill

Family Drill is an open-source web app that sends a household safe, surprise scam-practice emails. An organizer runs it from an AI assistant such as Grok Bot or Meta Muse. The family accepts one plain-language agreement, and the organizer's assistant then sends household members fictional messages at unexpected times. Opening a drill link shows a lesson that points out the clues in that email.

This is practice under a household agreement. It is not covert phishing, surveillance, or brand impersonation. The app never imitates real brands, relatives, banks, or government agencies. It never asks for credentials or financial details, and it sends no tracking pixels, attachments, or links to outside sites.

## Household agreement model

1. The household agrees that the organizer may send surprise practice emails.
2. Drills use fictional organizations only and never ask for credentials.
3. An organizer can send a drill only while the household agreement is active. No per-drill or per-member invite step exists.
4. The lesson appears as soon as the drill link opens in a browser.
5. A member can press **I clicked the link in the email** to confirm a click.
6. The family reviews the clues after a miss. Any member can ask the organizer to stop.

Family Drill keeps organizers, agreements, members, drills, and drill events in Vercel Postgres, which is Neon, through Drizzle. Relatives never create accounts. Their drill links hold random tokens.

## Quickstart

You need Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

The app applies `db/migrations/0001_foundation.sql` on its first query. An existing database also picks up the columns in `0003_time_zone_and_reports.sql` that way. Apply `db/seed.sql` yourself if you want local demo data.

Create a Vercel Postgres or Neon database and put its pooled connection string in `DATABASE_URL`. Set a long random `AUTH_SECRET`, then set `AUTH_URL` and `APP_URL` to the app's origin. The hosted values are `https://app.familydrill.com`. Replace both with your own origin when you self-host. Sign in at `/login` with an organizer email. In development without a Resend key, copy the `[auth:magic-link]` URL from the server console.

For production metrics, turn on Web Analytics and Speed Insights in the Vercel project. Their packages send no data during local development.

Open [http://localhost:3000](http://localhost:3000). The public site links to none of these development routes:

- `/household` shows the agreement, the terms, the member list, and an add-member form to the signed-in organizer.
- `/admin` lets the signed-in organizer send drills and see each member's sent, clicked, and reported counts.
- `/d/drill-leo` is a seeded lesson page. A plain GET records nothing. The page's script records a click.
- `/examples` renders every practice email as sent, next to its lesson.
- `/learn` is the family teaching page, with the 4-question check, conversation tips, and a printable card.

The home page, `/docs/*`, `/examples`, `/learn`, and `/d/[token]` are public. Auth.js gates `/household`, `/admin`, and `/install`. Their server actions also check the organizer session, and every database query scopes records to that organizer.

## Sending drills

Drills skip quiet hours, 21:00 to 08:00 in the household's time zone. The assistant sets the time zone with `update_preferences`. A `sendAt` up to 72 hours ahead goes to Resend's scheduler. A surprise drill goes to the member with the fewest drills who has not had one in the last 12 hours. It uses a lure that member has not seen, from a different category than their last one.

By default, sending a drill writes a `[mail:stub]` line and the drill URL to the development server console. For production delivery, set `MAIL_ADAPTER=resend`, set `RESEND_API_KEY`, and set `EMAIL_FROM` to a sender on a verified domain. The same key sends organizer sign-in links. Set `EMAIL_FROM_AUTH` to send sign-in mail from a different verified address. Without it, sign-in mail uses `EMAIL_FROM`. In production, sign-in fails with an error if `RESEND_API_KEY` is missing. In development, the server logs the link instead.

A drill keeps the verified sending address and borrows only the fictional display name, for example `SwiftBox Delivery <drills@familydrill.com>`. That way "check the real address" is always a clue a relative can catch. Each drill carries an `X-Family-Drill: household-practice-drill` header. Adding a member with `sendHeadsUp` sends them a branded heads-up email from `EMAIL_FROM`.

The route `app/email-assets/[kind]/[file]/route.tsx` renders each fictional brand's logo and each scenario's illustration to PNG at build time. Every recipient loads the same URL with no query string, so loading an image can't reveal who opened a message. Each image has alt text and sits on a colored background, so the email still reads well when a mail client blocks images. The repository stores no image binaries for email.

## Assistants: Grok Bot, Meta Muse, and MCP

Organizers sign in at `/login` and land on `/install`. That page shows their install code and setup steps for Grok Bot, Meta Muse, and other assistants. Visiting `/install` again keeps the same code. The **Replace code** button makes a new one.

Every assistant reaches the same tool registry in `lib/bot-tools.ts` through one of three routes:

- `POST /api/mcp` is a stateless Streamable HTTP MCP server. Assistants such as Meta Muse, Claude, and ChatGPT connect with OAuth: they register at `/oauth/register`, the organizer signs in and chooses Allow at `/oauth/authorize`, and `/oauth/token` returns the install code as the access token. Other assistants send `Authorization: Bearer <install code>`, or use `POST /api/mcp/<install code>` if they can only store a URL. Discovery documents live at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server`.
- `POST /api/bot/tools/<tool_name>` runs any tool with a JSON body. `GET /api/bot/tools` lists the tools with their JSON schemas, and `/openapi.json` describes them.
- The original REST routes are in the [eggbot API contract](docs/bot-api.md).

`/agent.md` is the assistant guide. It covers the setup conversation, how often to send drills, coaching, and the safety rules. When you publish a Grok Bot template, paste the guide into the bot's skills and leave any install code out. Other assistants read it from the setup message. `/llms.txt` lists all of these for agents and crawlers.

To check a live connection without changing anything, run:

```bash
npm run smoke:bot -- https://app.familydrill.com <install-code>
```

## Privacy model

The database stores the organizer's email, name, and time zone, the household agreement, each member's name and email address, and the drills and their events. Auth.js stores expiring sign-in tokens and organizer sessions. Relatives need no account.

A GET of a drill link records nothing. The lesson page's script records a click after the page loads in a browser, which link scanners and email previews don't do. Only the confirmation button records a confirmed click. Drills collect no credentials, payment details, or form answers.

## Lure variety and safety

The scenario pack covers six categories that organizers can turn on or off:

- package and delivery
- bank, payment, and toll alerts
- subscriptions and cloud storage
- tech support and virus notices
- school and kids accounts
- account lockouts and shared files

Organizers turn categories off through their assistant or the household page, and surprise drills use only the categories left on. The optional SMS bubble is a preview and sends no texts.

Every lure identity is fictional: SwiftBox, Riverline Bank, Streamly, SoftShield, Maple District Portal, PayNest, Crestway Tolls, Cloudnook Photos, and Sharefold. Each scenario lists the `clues` its lesson page explains. This project drew the colors and marks itself. Do not replace them with real trademarks, lookalike domains, or trade dress. Scenarios with `portalStage` open a practice sign-in page first. Its inputs have no `name`, so typed values never leave the browser. The page records only that someone pressed the button.

## Development checks

```bash
npm test
npm run build
```

The tests reject real brand names, practice wording inside a lure, missing clues, and forms or scripts in a rendered email. Keep every scenario fictional and educational.

## License

MIT. See [LICENSE](LICENSE).
