# Centrifuge.com

Rebuild of centrifuge.com for **Centrifuge World** — Next.js 15 (App Router) + Payload CMS 3 (embedded), Postgres on Neon, media on Vercel Blob, hosted on Vercel. See `CLAUDE.md` for the full brief and `/specs` for cycle specs.

## Develop

```bash
pnpm install
cp .env.example .env.local   # fill in secrets (see below)
pnpm dev                     # app + admin at http://localhost:3000  (admin: /admin)
pnpm test                    # vitest
pnpm typecheck               # tsc --noEmit
pnpm generate:types          # regenerate Payload types after collection/global changes
pnpm generate:importmap      # regenerate after adding/removing custom admin components
```

---

## Leads & Quotes (Cycle UI-2)

A full-screen admin workspace at **`/admin/leads-quotes`** (Pipeline · Form Leads · Quotes · Archive · Quote Builder · Routing & Delivery), a Twilio-powered email operator, and a quote system (branded PDF + hosted quote page).

### Email operator — Twilio Email API

All lead/quote email goes through `src/lib/email/twilio.ts` → `POST https://comms.twilio.com/v1/Emails`.

- **Recipients** are the single source of truth in the **Lead Routing** global (seeded from `data/routing.json`) — `mark@`, `ron@`, `david@`, `cynthia@p5400.com`. Never hardcode addresses.
- **Dry-run is the default.** With `LEADS_EMAIL_DRY_RUN=true` (or no credentials) the operator logs payloads and **sends nothing**. Real sends require credentials **and** `LEADS_EMAIL_DRY_RUN=false`.

#### Required env vars

| Var | Purpose |
|---|---|
| `TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET` | Preferred auth — a scoped API key |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Fallback auth (dev) |
| `LEADS_EMAIL_DRY_RUN` | `true` everywhere except a deliberate live test |
| `CHROME_PATH` | Local Chrome path for PDF (macOS default assumed) |
| `CRON_SECRET` | Guards `/api/cron/expire-quotes` |

#### ⚠️ Human prerequisite — verify the sending domain (sends fail without this)

The `from` addresses must be **Verified Senders** on a **verified sending domain** or every send returns an error. In the **Twilio Email** console:

1. **Verify the domain** `centrifuge.com` (Twilio provides CNAME/DKIM records → add them in DNS, then confirm).
2. Add/verify the two senders:
   - `notifications@centrifuge.com` — form alerts + acknowledgements
   - `quotes@centrifuge.com` — quote delivery
3. Provision a scoped **API Key** (Console → Account → API keys, or `twilio api:core:keys:create`) and set `TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET` in Vercel + `.env.local`.

Until steps 1–2 are done, leave `LEADS_EMAIL_DRY_RUN=true`.

#### Going live — the one-time smoke test

1. Confirm the domain + both senders are verified and the API key is set.
2. Temporarily set `LEADS_EMAIL_DRY_RUN=false` in a **preview** deployment.
3. Submit one test form (or "Send test to all 4" in Routing & Delivery) and confirm all four p5400 inboxes receive it and the routing dots resolve.
4. With team sign-off, set `LEADS_EMAIL_DRY_RUN=false` in production.

### Quotes

- One component — `src/components/quote/QuoteDocument.tsx` — renders the **live preview, the hosted page, and the PDF** (headless Chrome), so all three are pixel-identical. NAP values come only from `data/nap.json`; all quotes issue from Rosharon, TX.
- Sending (`src/lib/quotes/send.ts`) writes an **immutable snapshot** (version, PDF, SHA-256 hash) — what a client received is retained permanently and is never editable/deletable.
- Hosted quote: **`/quote/{viewToken}`** (noindex). First view per session flips `sent → viewed` and logs the event. Overdue quotes are flipped to `expired` by the daily cron (`vercel.json` → `/api/cron/expire-quotes`).

### Data model

`leads` + `quotes` collections, `lead-routing` + `quote-defaults` globals (all under the **Leads** admin group). Quote numbers are `CW-Q-{YYYY}-{NNNN}` (unique, retry-on-collision).

> **Deploy note:** production runs Payload with `push: false`, so the new `leads`/`quotes` tables need a migration (`pnpm payload migrate:create` → commit → `migrate` on deploy) rather than dev auto-push.
