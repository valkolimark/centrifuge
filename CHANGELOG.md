# Changelog

All notable changes to the Centrifuge.com rebuild are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/); dates are ISO (YYYY-MM-DD).

## 2026-11-26

### Build / deploys

**Fixed**
- **Vercel deployments failing since 2026-11-23** — every build died in `next/font` on `src/payload/admin/BrandProvider.tsx` (`TypeError: Cannot read properties of null (reading '1')`). `next/font/google` downloads fonts from Google at build time; Google began returning font URLs without a file extension to Vercel's builders, which Next 15.4's loader cannot parse. The admin fonts (Chakra Petch, Inter, JetBrains Mono) are now committed under `src/payload/admin/fonts/` and loaded with `next/font/local`, so the build no longer depends on Google. Same font files as before; no visual change intended.
- **Public-site fonts hit the same failure** — the first production deploy after the admin fix died on `src/lib/fonts.ts` instead (the Google response is intermittent per build). Archivo and Inter are now committed under `src/styles/fonts/` and loaded with `next/font/local`. The files are byte-identical to the ones previously served, and the metric-matched fallback faces are pinned in `globals.css` to the values `next/font/google` generated, so layout shift is unchanged. Nothing in the repo uses `next/font/google` any more.

### Interactive 3D decanter

**Added**
- **3D rotating-assembly explorer on the decanter repair page** — `/services/decanter-centrifuge-repair/#rotating-assembly` gets a click-to-load 3D model of a decanter rotating assembly (bowl, scroll conveyor, hubs, bearings, gearbox). Visitors can rotate it, fly it apart with a button or slider, and point at or tap a part to see its name and what it does. A text list of all 26 parts sits under the viewer for screen readers and search.
- **Homepage feature band** — a Web Blue gradient section between "Centrifuge types we service" and "Industries we serve" with an exploded render and a tracked "Explore the 3D decanter" CTA to the explorer.
- **Facade pattern, nothing in first load** — like `VideoFacade`, the page ships only a poster image. `three` (new dependency, an exception to the 5 KB animation-library rule, made at the client's request), the self-hosted Draco decoder (`/public/draco`), and the 453 KB model (`/public/models`) are fetched only after the click. No CSP change: the decoder runs as JS, not WASM.
- GA4 `cta_click` events: `Home — Explore the 3D decanter`, `Explore in 3D`, `3D — Fly apart`.
- **Zoom controls** — the viewer has Zoom in, Zoom out, and Reset view buttons. Clicking or tapping a part makes it the zoom target, so visitors can inspect any component up close. Mouse-wheel and pinch zoom stay off so the viewer never hijacks page scrolling.
- **Viewer generalized for more models** — `DecanterExplorer` / `decanter-viewer` / `decanter-parts` became `FlyApartExplorer` / `flyapart-viewer` / `flyapart-models` (a registry keyed by model), ready for additional machines.

**Notes**
- The model is representative (14-inch class, dimensions approximated from public listings), not a drawing of a specific make or model; the page says so under the viewer.

### Interactive 3D basket centrifuge

**Added**
- **3D basket centrifuge on the basket repair page** — `/services/basket-centrifuge-repair/#inside-the-machine` gets a click-to-load, whole-machine fly-apart of a vertical basket centrifuge: top drive (motor, gearbox, coupling, pedestal), bearing housing with spindle and bearings, lid with sight glass, feed pipe and plow, perforated basket, casing, base frame, and bottom discharge chute. 20 identifiable parts with descriptions; the basket turns once it is clear of the casing.
- **Tall layout** — vertical machines render in a portrait viewer beside the heading and an open parts list on desktop; on phones the list folds under the viewer. `FlyApartSection` picks the layout from the model registry.
- Same loading rules as the decanter: nothing in first-load JS, self-hosted model (338 KB) and decoder, no CSP change.

- **Electric or hydraulic drive** — a Drive toggle in the viewer switches the basket model between an electric drive (motor on an inline gearbox) and a hydraulic drive (radial-piston motor with pressure and return hoses). Both sit on the same pedestal and coupling; parts that belong to one drive are tagged in the parts list.
- **Raised sight glass** — the lid's sight glass is now a 400 mm glass on a raised, flanged nozzle with a bolted frame, so it reads clearly from any angle.
- **Nothing overlays the model** — part information moved to a fixed-height strip above the 3D canvas and every control (fly-apart, slider, drive toggle, zoom) to a strip below it, on both models. The canvas is unobstructed at every screen size, and loading or hovering never shifts the page.
- **Homepage band for the basket centrifuge** — a second Web Blue feature band ("See inside a basket centrifuge") between "How a rebuild works" and "Rebuilt, not replaced", mirrored against the decanter band, with the assembled and exploded renders and a tracked CTA to the basket explorer. `DecanterFeature` became `FlyApartFeature` and renders both bands.

**Notes**
- The model is representative (48 x 30 inch class, top-driven, bottom discharge; dimensions approximated from public listings), not a drawing of a specific make or model. The page says so under the viewer.

### Interactive 3D disc stack centrifuge

**Added**
- **3D disc stack centrifuge on the disc stack repair page** — `/services/disc-stack-centrifuge-repair/#inside-the-machine` gets a click-to-load, whole-machine fly-apart of a self-cleaning disc stack centrifuge: hood with feed pipe and discharge housing, centripetal pump, bowl top and lock ring, a 24-disc stack that fans out, distributor, sliding piston and seal, bowl bottom with ejection ports, solids collector, spindle with bearings and housing, flat-belt drive with a side-mounted motor, and the frame. 23 identifiable parts; the disc stack turns once it is exposed.
- **Homepage band** — "Open up a disc stack centrifuge", between "Three US facilities" and the FAQ, with a tracked CTA to the explorer.

**Notes**
- The model is representative (self-cleaning clarifier style, flat-belt drive; dimensions are plausible approximations), not a drawing of a specific make or model. The page says so under the viewer.

### 3D viewer: isolate a part, individual discs, worm gear drive

**Added**
- **Double-click to isolate a part** — on every model, double-clicking (or double-tapping) a part hides everything else and frames that part alone so it can be turned around and zoomed. Double-clicking again, or the "Back to machine" button, returns it. The fly-apart position is kept.
- **Individual discs** — the disc stack's 24 discs are picked one at a time ("Disc 16 of 24"), fan out far enough to tell apart, and can each be isolated.
- **Worm gear drive option** on the disc stack model — a Drive toggle switches between the flat-belt drive and a worm gear drive (horizontal flanged motor, centrifugal clutch, horizontal shaft with bearings, bronze worm wheel, worm on the spindle, gear housing).
- **Spindle shown on its own** — in the exploded disc stack view the spindle now comes out to the side instead of staying threaded through its bearings and housing.

## 2026-10-02

### Lead notifications (email)

**Changed**
- **Redesigned new-lead email** — reorganized around what the team does next: name + Call/Email buttons, "What they need" with human labels (no more `alfa-laval` / `this-week` slugs), the customer's message once with line breaks kept, attachments, contact. Emergencies get a red banner and "What happened" first. Real form names (Free Inspection, Sell Your Centrifuge, Send Photos) instead of "Contact", and descriptive subjects. Web Blue styling on all transactional emails.
- **Attachments open without logging in** — each photo has View and Download links straight to Vercel Blob (no `/api/media/file` proxy, so they work even if the app or database is down). Lead-photo filenames get a random suffix so public URLs aren't guessable.

**Fixed**
- **HTML injection in lead emails** — customer-supplied text is now escaped in the HTML email (Liquid does not auto-escape).

**Added**
- `scripts/preview-lead-email.ts` (render samples to files) and `scripts/send-test-lead-email.ts` (send samples to one address).
- `GET /api/admin/test-lead-email[?to=]` — sends the [TEST] sample lead emails from production (where the Twilio creds live). Admin session required; recipient must be on the lead-routing list.

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
