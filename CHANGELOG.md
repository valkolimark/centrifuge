# Changelog

All notable changes to the Centrifuge.com rebuild are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); dates are ISO (YYYY-MM-DD).

## 2026-07-07

### Inventory ↔ quote integration (CYCLE-INV-1)

**Added**
- **Brand-page inventory cards** — every OEM brand page now shows a "{Brand} machines in stock (N)" section (available machines for that brand) using the shared `InventoryCard`, capped at 6, most-recent-first, with a "Browse all machines →" link and a one-line empty state. Brand matching is normalized so free-text values like "Krauss-Maffei" and "Krauss Maffei" both resolve. (PR #11)
- **Quote form pre-population from a machine** — "Request this machine" (and `?machine={slug}` on `/cw-ez-quote-for-sales/`) opens the quote form with a machine context callout and pre-filled Equipment/Brand/Model/Message. The lead stores a durable, server-derived machine snapshot plus a `source: "inventory/{slug}"` value in its immutable payload (survives the listing later being edited/deleted). The internal alert email gains a machine block and a "Quote request — {title} (INV-####)" subject; the workspace source column shows the INV id. (PR #12)

**Fixed**
- **Broken inventory images** — the Phase-2 DNS cutover retired `inventory.centrifuge.com`, which was serving all 189 inventory photos. Migrated every image into Payload media (new Vercel Blob store) and rewrote the 44 inventory docs; removed the retired host from `remotePatterns`. (PR #9)
- **Media 500s** — the `media` collection used a reader that filters `_status: published`, but media has no drafts, so every `/api/media/file/...` request 500'd. Switched to `publicReadAlways`. (PR #10)

### Lead notifications (email)

**Fixed**
- **Sender domain not authorized (403)** — resolved by funding/upgrading the Twilio account (it was trial-limited); DKIM/domain auth were already in place.
- **Restricted Reply-To header (400)** — Twilio Email rejects a custom `Reply-To` header, which failed every send once the 403 cleared. Removed it (submitter contact is already in the alert body). (PR #15)
- **Anti-spam artifacts in the email** — the internal alert no longer lists the Turnstile token or honeypot field. (PR #16)

**Added**
- **Retry endpoint** — `GET /api/admin/retry-routes?leadId=<id>` (admin-session auth, idempotent) re-sends notifications for leads that failed to route, so an outage never means a silently lost lead. (PR #14)

### Forms reliability

**Fixed**
- **Honeypot autofill was silently dropping real leads** — the hidden anti-bot field was named `company_website`; browser/password-manager autofill cascade-filled it, so legitimate submissions were treated as spam and returned a fake success screen with no save (no submission, lead, or email). Renamed to a non-autofill name (`contact_time`) with `autocomplete=off` + `data-lpignore`/`data-1p-ignore` hints, and now logs honeypot trips server-side so a false positive is visible instead of silent. (PR #19)
- **Photo submissions crashed the form** — photos exceeded Next.js's default 1 MB Server Action body limit → 413 → "client-side exception" blanked the page. Raised `serverActions.bodySizeLimit` to 8 MB, compress photos to ≤1 MB each, and made a failed submit show an inline recoverable message instead of crashing. (PR #13)
- **Turnstile "Anti-spam check failed" on retry** — tokens are single-use/short-lived but the widget kept showing "Success" with a spent token. The widget now refreshes after a failed submit. (PR #17)

**Added**
- **Uploaded photos surfaced** — submitted photos now appear as a thumbnail strip in the notification email (HTML + text links) and on the Lead / Form Submission edit views. (PR #18)

## 2026-07-06 and earlier (recent groundwork)

- **Forms** — fixed the Turnstile widget render (an invalid `invisible` size produced no token → "Anti-spam check failed"); surfaced a readable summary of every submitted field on the lead and submission; hid raw Monaco JSON editors that blocked the record edit pages.
- **Phase-2 DNS** — SPF narrowed to Google-only, subdomain redirects (inventory/blog/oem → same-domain paths), SiteGround wildcard dropped.
- **Prior cycles** — native lead forms + Turnstile (replacing the Cognito embed), live Twilio email, the Leads & Quotes Mission Control workspace, and the Monday CRM import.
