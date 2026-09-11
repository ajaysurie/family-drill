# Eggbot API contract

This is the implementation-facing contract between an eggbot and Family Drill. It describes the current routes under `app/api/bot/*`; it is not organizer setup documentation.

## Authentication

The install bootstrap is the exception to token authentication:

1. The organizer signs in to Family Drill by magic link in a browser.
2. `POST /api/bot/install/start` uses that verified Auth.js session. It accepts no organizer identity in the request body.
3. A successful request creates or rotates the install credentials and returns `installId`, `botToken`, `active`, `organizerEmail`, `caps`, and `householdPaused` with status `201`. It returns `401` without a verified organizer session and `404` when that organizer has no household.

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

Creates or rotates credentials from the verified organizer browser session, as described above. Creating a new credential invalidates the previous token for that household.

#### `GET /api/bot/install`

Returns the authenticated install's public state: `active`, `organizerEmail`, `caps`, and `householdPaused`. Current capabilities are `members:read`, `members:write`, `drills:send`, `events:read`, and `household:pause`.

#### `GET /api/bot/health`

Returns `ok`, `installActive`, and `householdPaused` for the authenticated install.

### Family roster

#### `GET /api/bot/members`

Returns `{ "members": [...] }`. Each member contains `id`, `name`, and `email`, and results are ordered by name.

#### `POST /api/bot/members`

Adds a member. The JSON body requires non-empty string `name` and an `email` string containing `@`. The response is `{ "member": ... }` with status `201`. Invalid JSON or fields receive `400`; an inactive household agreement or paused install receives `403`.

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

All three fields are optional strings. Without `memberId`, the app chooses a household member. The default `scenarioId` is `surprise`, which selects one of the repository's fictional scenarios. Without `sendAt`, scheduling starts from the current time.

The queue observes UTC quiet hours: times before 08:00 move to 08:00 that day, and times at or after 21:00 move to 08:00 the next day. It permits at most five drills created for a household in the trailing hour. The current mail adapter writes the drill to the server console rather than delivering real email.

A successful response has status `201` and contains `drillId`, `memberId`, `scenarioLabel`, `revealPath`, and `scheduledFor`. Errors include `400` for invalid JSON, field types, member/scenario IDs, or dates; `403` for an inactive agreement or paused install; and `429` when rate limited.

#### `GET /api/bot/drills/:id`

Returns organizer-scoped coaching detail: `drillId`, `memberName`, `scenarioLabel`, `lessonBullets`, `lureDeliberate`, and `lureEngagementMethod`. The method is `explicit_button` only after the member deliberately submits the reveal-page button; otherwise it is `null`. An unknown or other-household drill receives `404`.

### Events

#### `GET /api/bot/events?since=<cursor>`

Returns an array of events ordered oldest first. Each item contains `cursor`, `type`, `at`, `drillId`, `memberName`, and `summary`. Event types in the schema are:

- `drill.sent`
- `drill.revealed`
- `lure.engaged`
- `drill.failed`

Pass the last event's `cursor` as `since` to request later events. If `since` is not a known event ID but parses as a date, it acts as an exclusive timestamp cutoff. An absent or unusable cursor returns all events. Events are scoped to the authenticated organizer.

Loading the public reveal records `drill.revealed`; it does **not** count engagement. Only the explicit button POST records `lure.engaged`. The unique database constraint allows each event type at most once per drill.

### Pause and resume

#### `POST /api/bot/pause`

Sets `householdPaused` to `true` and returns the install's public state.

#### `POST /api/bot/resume`

Sets `householdPaused` to `false` and returns the install's public state. Resume does not override a draft/inactive household agreement.

Pausing blocks roster writes and new drills. Read-only install, health, member, event, and drill-detail requests remain available. An inactive install token cannot authenticate at all.

## Safety boundaries

- Use only fictional organizations. Never imitate a real brand, relative, bank, government agency, or sender identity.
- A lure may teach recognition of a request for personal information, but every lure link must open the immediate reveal—not a collection form or external drill page.
- Never collect passwords, Social Security numbers, payment details, form answers, or other secrets.
- Do not use tracking pixels, attachments, or downloads. A GET, email open, preview, or scanner prefetch must not count as engagement.
- Record engagement only after the member deliberately presses the reveal-page button.
- Keep email-provider credentials inside the app's server-side delivery integration. They do not belong in bot actions, instructions, templates, or conversations.
- Operate only under an active household agreement. Any member can ask the organizer to pause the household.
