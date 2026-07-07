# Inventory Image Fix — CYCLE-INV-1 Phase 1

## Root cause
All 189 inventory photos were stored as `imageUrl` text pointing at
`https://inventory.centrifuge.com/wp-content/uploads/...` — a **separate WooCommerce store**
(not the main-site `centrifuge-im.s3` WP-Offload bucket; different path scheme, no timestamp
subdirectory, and the exact keys 403 on that bucket).

During the Phase-2 DNS work (#11), `inventory.centrifuge.com` was repointed to Vercel with a
308 redirect to `/inventory/`. That retired the host these photos were served from — so every
`next/image` request to `inventory.centrifuge.com/...jpg` now followed a 308 to an HTML page
instead of an image → broken images across the grid and detail pages.

The originals still existed on the SiteGround origin (`34.174.141.60`, HTTP 200 via the WP
`Host` header), so they were recoverable.

## Fix applied
Migrated every inventory photo into **Payload media (Vercel Blob)** so nothing depends on the
retired host:

1. Created a Vercel Blob store (`centrifuge-media`, public) — the Blob storage adapter was
   already configured but dormant (no `BLOB_READ_WRITE_TOKEN`). Creating the store provisioned
   and linked the token to the project.
2. `scripts/migrate-inventory-images.ts` downloaded each image from the SiteGround origin IP
   (bypassing the DNS redirect via `Host: inventory.centrifuge.com` + `rejectUnauthorized:false`),
   uploaded it into the `media` collection (→ Blob), and rewrote each inventory doc's `images[]`
   from `imageUrl` → uploaded `image`, publishing the change.
3. No component/design changes: `src/lib/inventory.ts` already resolves `image.url || imageUrl`,
   so the pages now use the migrated media automatically. Existing empty-state ("Photo on
   request") already covers missing photos — no broken glyph.
4. Removed `inventory.centrifuge.com` from `next.config.mjs` `images.remotePatterns` (no doc
   references it anymore).

Media now serves same-origin from `/api/media/file/<name>` (Payload → Blob). Requires the prod
deploy to carry `BLOB_READ_WRITE_TOKEN` (added when the store was created) — done via the
deploy that accompanies this change.

## Migration inventory
- **Images migrated:** 189 (0 failed) across **44 inventory docs**
- **Source (retired):** `inventory.centrifuge.com/wp-content/uploads/2023/09/*` (WooCommerce, SiteGround origin `34.174.141.60`)
- **Destination:** Payload `media` collection → Vercel Blob store `centrifuge-media`
- **imageUrl references remaining after migration:** 0

## Phase 2 (brand-page inventory cards) — flags
- **`?brand=` filter on `/inventory`: deferred.** `/inventory` is statically generated (`revalidate = 300`); adding a `searchParams` brand filter would make it dynamic. The "Browse all machines →" link points to unfiltered `/inventory`. Low-effort follow-up if wanted.
- **`ItemList` structured data: skipped (flagged for Cycle 4).** `data/schema-map.md` defines only `Product` + `Offer` per listing for the inventory hand-off, with no `ItemList` pattern — per the cycle spec, skipped rather than inventing one.
- Brand matching is normalized (case/space/hyphen/parenthetical-insensitive) since `inventory.brand` is free text; handles "Krauss-Maffei" ↔ "Krauss Maffei". Cards are the shared `InventoryCard` (extracted verbatim from `/inventory`), capped at 6, sorted most-recent-first, with the one-line empty state.

## Phase 3 (quote pre-population from a machine) — notes
- **Detail page → "Request this machine"** already scrolled to the embedded form (`#request`); the form now receives the machine (context callout + pre-filled Equipment/Brand/Model/Message) via `machineContext(item)`.
- **`?machine={slug}`** supported on `/cw-ez-quote-for-sales/` (the canonical EZ-quote page CTAs point to). Unknown/sold slug degrades silently to the blank form. The page is now dynamic (reads `searchParams`).
- **Snapshot is server-derived, not client-trusted:** the submit action reads only the slug from the hidden `_machine` field, re-fetches the listing, and rebuilds the snapshot with `machineContext` — so a tampered payload can only reference a real listing (or none). The snapshot + `source: "inventory/{slug}"` are stored in the lead's immutable `payload` JSON, so they survive the inventory doc being later edited or deleted.
- **Email:** the internal (four-recipient) alert renders a machine block (HTML + text) and uses subject `Quote request — {title} (INV-####)` when a machine is present. Live sends remain gated by `LEADS_EMAIL_DRY_RUN` (kept true this cycle — no live sends).
- **Workspace:** the Form-Leads / pipeline source column shows the machine's `INV-####` for inventory-sourced leads (falls back to the normal source label otherwise).
- **Remove control:** the pre-filled fields are rendered controlled so "Remove" clears the context block, the pre-fills, and the hidden `_machine` payload; all fields stay editable.

## Flagged / notes
- `remotePatterns` still lists `centrifuge-im.s3.amazonaws.com` — still used by non-inventory
  pages (main-site WP media); left intact.
- Phase 2 (`?brand=` filter on `/inventory`) and Phase 3 (quote pre-population) are separate
  tasks in this cycle, not part of this image fix.
- Side effect during store creation: `vercel blob create-store` auto-ran `vercel env pull`,
  which overwrote `.env.local` and dropped local-only vars (`MONDAY_API_TOKEN`,
  `LEADS_EMAIL_DRY_RUN`, `TWILIO_*`). `MONDAY_API_TOKEN` + `LEADS_EMAIL_DRY_RUN` restored;
  `TWILIO_*` remain in Vercel (prod) but were not re-materialized locally (only needed for local
  email testing).
