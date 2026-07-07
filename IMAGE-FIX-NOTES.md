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
