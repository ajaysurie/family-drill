# Eggbot API contract

This is the contract between an eggbot and Family Drill. An eggbot can be any assistant, such as Grok Bot, Meta Muse, an MCP client, or a script. It describes the current routes under `app/api/bot/*` and `app/api/mcp/*`. It is not organizer setup documentation. The app serves the behavior guide for assistants at `/agent.md`.

## Ways to connect

All three routes call the same registry in `lib/bot-tools.ts`, so they share validation, hints, and safety checks.

1. **MCP.** Use `POST /api/mcp` with the bearer header, or `POST /api/mcp/<bot_token>` for clients that can only store a URL. The server is stateless Streamable HTTP. It takes JSON-RPC 2.0 over POST, answers with `application/json`, and uses no SSE stream or session header. It supports `initialize`, `ping`, `tools/list`, and `tools/call`. Notifications return `202`, and `GET` returns `405`.
2. **HTTPS tools.** Send `POST /api/bot/tools/<tool_name>` with a JSON object of arguments. An empty body counts as `{}`. `GET /api/bot/tools` lists every tool with its JSON schema, and `/openapi.json` describes the same operations.
3. **REST routes.** The routes below remain for existing bots.

Tool names: `get_status`, `list_members`, `add_member`, `update_member`, `remove_member`, `get_preferences`, `update_preferences`, `list_scenarios`, `send_drill`, `list_drills`, `get_drill`, `record_report`, `get_family_report`, `list_events`, `pause_drills`, `resume_drills`. Errors return `{ "error": "<code>", "hint": "<what to do next>" }`.

## OAuth for MCP connectors

Assistants that add connectors by URL and sign in, such as Meta Muse, Claude, and ChatGPT, use OAuth 2.1 with PKCE:

1. An unauthenticated `POST /api/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="<origin>/.well-known/oauth-protected-resource"`.
2. The resource metadata names the app origin as the authorization server. `/.well-known/oauth-authorization-server` lists the endpoints.
3. The client registers at `POST /oauth/register` with `redirect_uris`. HTTPS, localhost, and native-app schemes are allowed. The response carries a `client_id` and uses no client secret.
4. The organizer opens `/oauth/authorize` with `response_type=code`, `code_challenge`, and `code_challenge_method=S256`. A signed-out organizer goes to `/login` and comes back. The consent page names the client and the host it returns to.
5. `POST /oauth/token` with `grant_type=authorization_code`, the `code`, and the `code_verifier` returns `{ "access_token", "token_type": "Bearer", "scope": "family-drill" }`. Codes expire after 10 minutes and work once.

The access token is the household's install code, so **Replace code** on `/install` disconnects every assistant at once.


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

Adds a member. The JSON body requires a non-empty string `name` and a valid `email`. The optional boolean `sendHeadsUp` sends the member a branded Family Drill email that explains the program and the 4-question scam check. The response is `{ "member": ..., "headsUpSent": boolean }` with status `201`. Invalid JSON or fields receive `400`. A duplicate email receives `409`. An inactive household agreement, a paused install, or a full household of 12 members receives `403`.

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

All three fields are optional strings. Without `memberId`, the app picks the member with the fewest drills and skips anyone who got a drill in the last 12 hours. The default `scenarioId` is `surprise`, which picks an enabled scenario the member has not seen, from a different category than their last drill. Without `sendAt`, the drill sends now. A `sendAt` in the past also sends now. The app refuses a `sendAt` more than 72 hours ahead.

Quiet hours use the household's `timeZone` preference, which is UTC until the assistant sets it. A time before 08:00 or at or after 21:00 local time moves to the next 08:00 local. The app hands future times to Resend's scheduler. A household can create at most five drills in any one-hour window. Production sends through Resend when `MAIL_ADAPTER=resend`. Other environments use the console adapter.

A successful response has status `201` and contains `drillId`, `memberId`, `memberName`, `scenarioId`, `scenarioLabel`, `from`, `revealPath`, and `scheduledFor`. The errors are:

- `400` for invalid input: `member_not_found`, `scenario_not_found`, `scenario_disabled`, `invalid_send_at`, `send_at_too_far`, `no_members`, or `no_enabled_categories`
- `403` for an inactive agreement or paused install
- `429` for `rate_limited` or `everyone_recently_drilled`
- `502` for `delivery_failed`, which also records a `drill.failed` event

#### `GET /api/bot/drills?memberId=<id>`

Lists drills newest first. Each item has `drillId`, `memberId`, `memberName`, `scenarioId`, `scenarioLabel`, `fromName`, `category`, `sentAt`, `scheduledFor`, `outcome`, and the flags `clicked`, `confirmedByMember`, `enteredDetails`, and `reported`. The `outcome` is one of `scheduled`, `sent`, `clicked`, `entered-details`, `reported`, or `failed`.

#### `POST /api/bot/drills/:id/report`

Records `drill.reported` when the organizer says the member spotted the drill and told them. Returns `{ "recorded": true }` or `404`.

#### `GET /api/bot/drills/:id`

Returns coaching detail for one of the organizer's drills. It has everything in the drill list item plus `lessonBullets`, `clues`, a short `coachingScript`, `lureDeliberate`, and `lureEngagementMethod`. The method is `explicit_button` only after the member presses the confirmation button on the lesson page. Otherwise it is `null`. An unknown drill, or one from another household, receives `404`.

### Reports and scenarios

- `GET /api/bot/status` returns the setup state and suggested `nextSteps`, the same as `get_status`.
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

A script on the lesson page or practice sign-in page records `drill.revealed` after the page loads in a browser. A bare GET, email open, preview, or link-scanner prefetch records nothing. Only the explicit button POST records `lure.engaged`. Only pressing **Sign in** on a practice sign-in page records `credentials.submitted`, and the browser sends no field values. A unique database constraint allows each event type at most once per drill.

### Pause and resume

#### `POST /api/bot/pause`

Sets `householdPaused` to `true` and returns the install's public state.

#### `POST /api/bot/resume`

Sets `householdPaused` to `false` and returns the install's public state. Resume does not activate an agreement by itself. The next authenticated write from an active, unpaused legacy install activates a draft agreement.

Pausing blocks roster writes and new drills. Read-only install, health, member, event, and drill-detail requests remain available. An inactive install token cannot authenticate at all.

## Safety boundaries

- Use only fictional organizations. Never imitate a real brand, relative, bank, government agency, or sender identity.
- A lure link must stay within Family Drill: it opens either the immediate reveal or an approved fictional portal that posts no field values and then reveals the lesson.
- Never receive or store passwords, Social Security numbers, payment details, form answers, or other secrets.
- Do not use tracking pixels, attachments, or downloads. A GET, email open, preview, or scanner prefetch must not count as engagement.
- Record a click only from the lesson page's script. Record a confirmed engagement only after the member presses the confirmation button or submits a fictional portal. Never score a GET, a preview, or a field value.
- Keep email-provider credentials inside the app's server-side delivery integration. They do not belong in bot actions, instructions, templates, or conversations.
- Operate only under an active household agreement. Any member can ask the organizer to pause the household.

### Drill preferences

`GET /api/bot/preferences` returns `enabledCategories`, `smsPreview`, `timeZone`, and `organizerName`. `PATCH /api/bot/preferences` accepts any subset of those fields. `timeZone` must be an IANA name such as `America/Chicago`. `organizerName` appears in heads-up emails and lesson pages. The category values are `delivery`, `bank-payment`, `subscriptions`, `tech-support`, `school-kids`, and `account-lockout`. The bot should read these preferences when it describes choices. The server enforces them when it picks a surprise scenario and rejects a request for a disabled one, so a bot cannot bypass the household setting. SMS stays preview-only.
