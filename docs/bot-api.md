# Eggbot API contract

This is the implementation-facing contract between an eggbot (or any assistant: Grok Bot, Meta Muse, an MCP client, or a script) and Family Drill. It describes the current routes under `app/api/bot/*` and `app/api/mcp/*`; it is not organizer setup documentation. The behavioral guide for assistants is served at `/agent.md`.

## Three ways in, one set of rules

All three call the same registry in `lib/bot-tools.ts`, so validation, hints, and safety checks are identical.

1. **MCP (preferred).** `POST /api/mcp` with the bearer header, or `POST /api/mcp/<bot_token>` for clients that can only store a URL. Stateless Streamable HTTP: JSON-RPC 2.0 over POST, `application/json` responses, no SSE stream, no session header. Supports `initialize`, `ping`, `tools/list`, and `tools/call`. Notifications return `202`. `GET` returns `405`.
2. **HTTPS tools.** `POST /api/bot/tools/<tool_name>` with a JSON object of arguments (an empty body is `{}`). `GET /api/bot/tools` lists every tool with its JSON schema. `/openapi.json` describes the same operations.
3. **REST routes** below, kept for existing bots.

Tool names: `get_status`, `list_members`, `add_member`, `update_member`, `remove_member`, `get_preferences`, `update_preferences`, `list_scenarios`, `send_drill`, `list_drills`, `get_drill`, `record_report`, `get_family_report`, `list_events`, `pause_drills`, `resume_drills`. Errors return `{ "error": "<code>", "hint": "<what to do next>" }`.

## Authentication

The install bootstrap is the exception to token authentication:

1. The organizer signs in to Family Drill by magic link in a browser.
2. `POST /api/bot/install/start` uses that verified Auth.js session. It accepts no organizer identity in the request body.
3. A successful request activates the household agreement for bot writes, rotates the install credentials, and returns `installId`, `botToken`, `active`, `organizerEmail`, `caps`, and `householdPaused` with status `201`. It returns `401` without a verified organizer session and `404` when that organizer has no household.

All other bot routes accept either of these headers:

```http
Authorization: Bearer <bot_token>
```

```http
X-Family-Drill-Token: <bot_token>
```

The bearer header takes precedence when both are present. Missing, unknown, or inactive install tokens receive `401 { "error": "Unauthorized" }`. The bot token is an app credential, not an email-provider key; keep it out of templates, chat transcripts, and client-side code.

## Endpoints

### Install state

#### `POST /api/bot/install/start`

Rotates credentials from the verified organizer browser session, as described above. Creating a new credential invalidates the previous token for that household. Visiting the `/install` page does **not** rotate the code; only this route and the page's **Replace code** button do.

#### `GET /api/bot/install`

Returns the authenticated install's public state: `active`, `organizerEmail`, `caps`, and `householdPaused`. Current capabilities are `members:read`, `members:write`, `drills:send`, `events:read`, and `household:pause`.

#### `GET /api/bot/health`

Returns `ok`, `installActive`, and `householdPaused` for the authenticated install.

### Family roster

#### `GET /api/bot/members`

Returns `{ "members": [...] }`. Each member contains `id`, `name`, and `email`, and results are ordered by name.

#### `POST /api/bot/members`

Adds a member. The JSON body requires non-empty string `name` and a valid `email`. Optional boolean `sendHeadsUp` sends the member a branded Family Drill email explaining the program and the 4-question scam check. The response is `{ "member": ..., "headsUpSent": boolean }` with status `201`. Invalid JSON or fields receive `400`; a duplicate email receives `409`; an inactive household agreement or paused install receives `403`.

#### `PATCH /api/bot/members/:id`

Updates `name`, `email`, or both. Provided fields must be strings, and an email must contain `@`. The route returns `{ "member": ... }`, `400` for invalid input, `404` when the member is not in the organizer's household, or `403` when operation is paused/inactive.

#### `DELETE /api/bot/members/:id`

Deletes an organizer-owned member and returns `204` with no body. It returns `404` for an unknown or other-household member and `403` when operation is paused/inactive.

### Drill queue

#### `POST /api/bot/drills`

Queues a drill using an optional JSON body:

```json
{
  "memberId": "member-id",
  "scenarioId": "surprise",
  "sendAt": "2026-09-11T14:00:00Z"
}
```

All three fields are optional strings. Without `memberId`, the app picks the member with the fewest drills, skipping anyone drilled in the last 12 hours. The default `scenarioId` is `surprise`, which picks an enabled scenario the member has not seen, from a different category than their last drill. Without `sendAt`, the drill sends now. A `sendAt` in the past sends now; one more than 72 hours ahead is refused.

Quiet hours use the household's `timeZone` preference (UTC until set): a time before 08:00 or at or after 21:00 local time moves to the next 08:00 local. Future times are handed to Resend's scheduler. The queue permits at most five drills created for a household in the trailing hour. Production sends through Resend when `MAIL_ADAPTER=resend`; other environments use the console adapter.

A successful response has status `201` and contains `drillId`, `memberId`, `memberName`, `scenarioId`, `scenarioLabel`, `from`, `revealPath`, and `scheduledFor`. Errors: `400` for invalid input (`member_not_found`, `scenario_not_found`, `scenario_disabled`, `invalid_send_at`, `send_at_too_far`, `no_members`, `no_enabled_categories`); `403` for an inactive agreement or paused install; `429` for `rate_limited` or `everyone_recently_drilled`; `502` for `delivery_failed`, which also records a `drill.failed` event.

#### `GET /api/bot/drills?memberId=<id>`

Lists drills newest first. Each item has `drillId`, `memberId`, `memberName`, `scenarioId`, `scenarioLabel`, `fromName`, `category`, `sentAt`, `scheduledFor`, `outcome` (`scheduled`, `sent`, `clicked`, `entered-details`, `reported`, or `failed`), and the flags `clicked`, `confirmedByMember`, `enteredDetails`, and `reported`.

#### `POST /api/bot/drills/:id/report`

Records `drill.reported` when the organizer says the member spotted the drill and told them. Returns `{ "recorded": true }` or `404`.

#### `GET /api/bot/drills/:id`

Returns organizer-scoped coaching detail: everything in the drill list item plus `lessonBullets`, `clues`, a short `coachingScript`, `lureDeliberate`, and `lureEngagementMethod`. The method is `explicit_button` only after the member deliberately submits the reveal-page button; otherwise it is `null`. An unknown or other-household drill receives `404`.

### Reports and scenarios

- `GET /api/bot/status`: setup state and suggested `nextSteps` (same as `get_status`).
- `GET /api/bot/report`: per-member `drillsSent`, `clicked`, `enteredDetails`, `reported`, and `lastDrill`.
- `GET /api/bot/scenarios`: every scenario with `id`, `category`, `topic`, `from`, `subject`, `tactic`, and `enabled`.

### Events

#### `GET /api/bot/events?since=<cursor>`

Returns an array of events ordered oldest first. Each item contains `cursor`, `type`, `at`, `drillId`, `memberName`, and `summary`. Event types in the schema are:

- `drill.sent`
- `drill.revealed`
- `lure.engaged`
- `credentials.submitted`
- `drill.reported`
- `drill.failed`

Pass the last event's `cursor` as `since` to request later events. If `since` is not a known event ID but parses as a date, it acts as an exclusive timestamp cutoff. An absent or unusable cursor returns all events. Events are scoped to the authenticated organizer.

`drill.revealed` is recorded by a script on the lesson page (or practice sign-in page) after it loads in a browser. A bare GET, email open, preview, or link-scanner prefetch records nothing. Only the explicit button POST records `lure.engaged`, and only pressing **Sign in** on a practice sign-in page records `credentials.submitted` (no field values are sent). The unique database constraint allows each event type at most once per drill.

### Pause and resume

#### `POST /api/bot/pause`

Sets `householdPaused` to `true` and returns the install's public state.

#### `POST /api/bot/resume`

Sets `householdPaused` to `false` and returns the install's public state. Resume does not itself activate an agreement; the next authenticated write from an active, unpaused legacy install activates a draft agreement automatically.

Pausing blocks roster writes and new drills. Read-only install, health, member, event, and drill-detail requests remain available. An inactive install token cannot authenticate at all.

## Safety boundaries

- Use only fictional organizations. Never imitate a real brand, relative, bank, government agency, or sender identity.
- A lure link must stay within Family Drill: it opens either the immediate reveal or an approved fictional portal that posts no field values and then reveals the lesson.
- Never receive or store passwords, Social Security numbers, payment details, form answers, or other secrets.
- Do not use tracking pixels, attachments, or downloads. A GET, email open, preview, or scanner prefetch must not count as engagement.
- Record a click only from the lesson page's script, and a confirmed engagement only after a deliberate reveal confirmation or fictional-portal submit; never score a GET, preview, or field value.
- Keep email-provider credentials inside the app's server-side delivery integration. They do not belong in bot actions, instructions, templates, or conversations.
- Operate only under an active household agreement. Any member can ask the organizer to pause the household.

### Drill preferences

`GET /api/bot/preferences` returns `enabledCategories`, `smsPreview`, `timeZone`, and `organizerName`. `PATCH /api/bot/preferences` accepts any subset of those fields; `timeZone` must be an IANA name such as `America/Chicago`, and `organizerName` appears in heads-up emails and lesson pages; category values are `delivery`, `bank-payment`, `subscriptions`, `tech-support`, `school-kids`, and `account-lockout`. The bot should read these preferences when describing choices. The server always enforces them when selecting a surprise scenario (and rejects an explicitly disabled scenario), so a bot cannot accidentally bypass the household setting. SMS remains preview-only.
