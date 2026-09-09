# Family Drill

Family Drill is a tiny, local, open-source app for **consent-based fictional email scam practice with older relatives**. An organizer invites a participant, the participant opts in, and the organizer can send a safe exercise. Following its unique link immediately explains that it was a drill and offers three practical cues.

It is **not** a phishing kit, monitoring product, or production email service. It does not imitate real brands, relatives, banks, or government agencies; request credentials or financial details; hide tracking pixels; ship attachments; or send anyone away to an external drill page. Reports count only an explicit button POST—not a raw page request, email open, preview, or scanner prefetch.

## Consent model

1. The relative reads and accepts a plain-language invitation.
2. Only accepted participants can be sent drills.
3. The training reveal appears as soon as the unique link loads.
4. The participant deliberately confirms the interaction before it is scored.
5. A participant can ask their organizer to stop at any time.

This MVP uses an in-memory seed store, so changes reset when the server restarts.

## Quickstart

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then try:

- `/admin` — seeded participants, reports, and fake-send controls
- `/invite/invite-maya` — pending consent
- `/d/drill-leo` — seeded safe training reveal

`Send drill` writes a local `[mail:stub]` line and unique URL to the development server console. The `MailAdapter` interface is intentionally pluggable, but this repository implements only the default console adapter. **Before connecting any production email service provider (ESP), obtain that provider’s written approval for this consent-based drill use case.** Do not put provider secrets in the repository; `.env.example` documents only non-secret local settings.

## Development checks

```bash
npm test
npm run build
```

The scenario tests reject credential-like prompts, forms, attachments, and downloads. Keep all scenarios fictional and educational.

## License

MIT — see [LICENSE](LICENSE).
