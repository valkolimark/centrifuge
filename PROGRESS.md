# PROGRESS

Running log of completed cycles, verified Definition-of-Done items, open
`TODO(verify)` questions for the client, and anything deferred to `BACKLOG.md`.

---

## Cycle 1 — Foundation & Design System ✅ (complete, pending client review of `/styleguide`)

**Stack stood up:** Next.js 15.1.6 (App Router, TS strict) · Tailwind CSS 4 ·
Payload CMS 3.85 (embedded, `/admin`) · Neon Postgres (`@payloadcms/db-postgres`) ·
React 19.2 · pnpm.

### What was built (by task)

**1.1 Scaffold** — Next 15 + TS strict + Tailwind 4, ESLint/Prettier, `src/` layout
per CLAUDE.md, `.env.example`, `lighthouserc.json` CI budget (mobile
Performance/Accessibility/SEO ≥95 on `/` and `/styleguide`).

**1.2 Payload CMS** — 12 collections (`pages`, `services`, `oem-brands`,
`industries`, `locations`, `posts`, `case-studies`, `faqs`, `media`,
`form-submissions`, `redirects`, `users`) + 3 globals (`site-settings`,
`header-nav`, `footer`). Four roles with access control + a **27-case permission
matrix test**. Draft/publish + autosave + scheduled publish on content
collections. `content-manager` publish restriction enforced by a `publishGuard`
hook (may edit drafts everywhere; may publish only posts/case-studies/faqs).
Auth: 8-attempt lockout (10-min lock), 8-hour sessions, password reset email via
Resend adapter. SEO field group on every public-URL collection. ISR revalidation
hook on publish/save. **Seed script is idempotent** and seeds the four users +
three globals from `data/nap.json` and `data/navigation.json`.
**Sleek branded admin** — Industrial Blue theme injected app-wide via a providers
component (navy gradient sidebar, blue primary buttons + accents, rounded corners,
brand focus rings, dark-mode navy variant), plus a custom centrifuge-rotor login
logo and nav icon. CSP-clean (no external font/asset requests).

**1.3 Design tokens + typography** — `src/styles/tokens.css` implements the exact
Industrial Blue palette; mapped into the Tailwind theme via `@theme inline` so
tokens.css stays the single source. Self-hosted Archivo (600–800) + Inter via
`next/font` (latin subset, `display: swap`). `scripts/check-contrast.ts` asserts
WCAG AA for all 15 text/background pairs — **all pass** (also a vitest gate).

**1.4 Component library** — rendered on noindexed `/styleguide`. Layout: `Header`
(mega-nav + emergency utility bar), flagship `MobileMenu` (full-screen overlay,
focus-trap, body-scroll-lock w/ no layout shift, 44px+ targets, Esc/overlay-tap
close, `mobile_menu_order` honored), `Footer`, `Breadcrumbs`. Blocks: `Hero`
(home/interior/emergency), `AnswerBox`, `TrustBar`, `ServiceCard`+grid,
`EmergencyCallout`, `ProcessSteps`, `StatsRow`, `FAQAccordion` (native
details/summary, emits FAQPage schema), `CTABanner`, `BeforeAfterSlider`
(pointer + keyboard via range input), `Gallery`, `LogoRow`, `LocationCard`,
`RelatedLinks`. Forms: `Field` primitives, `FileUpload` (client compression to
≤2MB, max 6), `Turnstile` wrapper, `Honeypot`.

**1.5 Motion** — `src/lib/motion.ts` IntersectionObserver reveal hook (adds
`.is-visible`); CSS-only transitions (150–250ms); global `prefers-reduced-motion`
kill-switch in `globals.css`.

**1.6 SEO/infra** — typed JSON-LD builders in `src/lib/schema/` (org, website,
webpage, localBusiness, service, faq, breadcrumb, article, video) with an
**11-test suite**; `JsonLd` component; `buildMetadata` helper (enforces ≤60/≤155,
self-canonical, noindex); `robots.ts` + `sitemap.ts`; **redirects middleware**
(77 legacy 301s from `data/redirects.csv` + generated OEM slugs, verified
single-hop); security headers (CSP with GTM/Turnstile allowances, HSTS,
X-Frame-Options, Referrer-Policy, Permissions-Policy); GA4 `trackEvent` +
GTM via `@next/third-parties`.

### Verification status

| Check | Status |
|---|---|
| `pnpm build` (incl. Payload admin + API routes) | ✅ clean |
| `pnpm typecheck` | ✅ clean |
| `pnpm test` (40 tests: contrast, schema, permission matrix) | ✅ pass |
| `pnpm check:contrast` (15 WCAG AA pairs) | ✅ pass |
| Redirect single-hop (`/sharples/` → 301 → `/brands/sharples/`) | ✅ verified via curl |
| Payload schema pushed to Neon; 4 role users + 3 globals seeded | ✅ verified |
| Admin dashboard serves; login POST returns JWT | ✅ verified against live Neon |
| Public global reads (`site-settings`, `header-nav`) return seeded data | ✅ verified |
| `securityheaders.com` grade A on preview | ⏳ pending a preview deploy |
| Lighthouse ≥95 mobile via CI | ⏳ `lighthouserc.json` present; CI runner not yet wired |
| axe-core CI scan (zero critical) | ⏳ not yet wired (components built to be accessible) |
| GitHub Actions CI + preview deploy | ⏳ pending (see Deferred) |

### Infrastructure done this cycle

- Vercel project **`centrifuge`** created + linked under scope **`fast-paced`**
  (account `mark-2737`); GitHub repo `valkolimark/centrifuge` connected.
- **Neon Postgres** `centrifuge-db` provisioned via Marketplace, connected, env
  pulled to `.env.local`.
- `PAYLOAD_SECRET` set on **Production + Development** Vercel envs (see Deferred
  for Preview).

### Seeded CMS users (staging/dev — change before production)

Password for all four = `SEED_PASSWORD` env (default `ChangeMe!Cycle1`):
`superadmin@` (super-admin) · `editor@` (editor) · `content@` (content-manager) ·
`viewer@` (viewer), all `@centrifuge.com`.

---

## TODO(verify) — open questions for the client

Carried from the data files (none guessed — all flagged):

- **Public email** — legacy `deals@centrifugeworld.com` uses the retired domain;
  confirm the public-facing address (`nap.json`).
- **Location geo coordinates** ×3 — from Google Business Profiles (`nap.json`).
- **Social profile URLs** (`sameAs`) — Facebook/Instagram/X/YouTube exact URLs,
  needed Cycle 4 (`nap.json`, `site-settings` global left empty until then).
- **Brand spellings** — `Contrubex` and `Veronesi` (legacy "Varonesi") unconfirmed
  (`oem-brands.json`).
- **Turnaround / cost claims** — no numbers published without sign-off
  (`faq-bank.md`); relevant Cycles 2, 4, 5.
- **Legal review** — privacy/terms drafts (Cycle 2) publish as `TODO(verify)`.

## Deferred to later cycles / BACKLOG

- **Preview `PAYLOAD_SECRET`** — the CLI (v54.10.1) would not accept the
  "all preview branches" non-interactive add; set it before the first preview
  deploy (`vercel env add PAYLOAD_SECRET preview`).
- **GitHub Actions CI** running build + lint + lighthouse + contrast + axe +
  schema tests — configs exist; the workflow file is not yet added.
- **Preview deploy** — deferred (chose link + DB only); deploy after Cycle 2
  when there are money pages to review.
- **Real integration secrets** — `RESEND_API_KEY`, `TURNSTILE_*`,
  `BLOB_READ_WRITE_TOKEN` are placeholders; email/anti-spam/media-upload
  integration tests deferred until keys are present (adapters no-op safely).
- **Live-preview URL wiring** — breakpoints configured; the per-collection
  preview URL resolver is wired in Cycle 2 when public routes exist.
- **Segmented sitemaps** (pages/services/brands/…) — Cycle 4; Cycle 1 ships a
  single-route sitemap.
- **CSP nonce** for GTM (currently `'unsafe-inline'` on script-src).

---

## Cycle 0 — live WordPress hotfixes — NOT STARTED

Runs against the live WordPress site, not this repo. WP admin credentials are
available but the **site URL and a backup path are still needed**, and it makes
irreversible edits to production — awaiting an explicit go-ahead with the URL
before touching the live site.

---

## Cycles 2–5 — built autonomously (overnight session)

Live on the stable production URL: **https://centrifuge-nu.vercel.app** (auto-updates on each deploy). Sitemap: 98 URLs. Build clean, typecheck clean, all page types verified 200.

### Cycle 2 — Conversion core
- Forms engine (6 native types, verified end-to-end) — now superseded on live pages by the client's **Cognito forms** (EZ Quote #14, Contact #4) per client direction; native engine retained in code.
- Master service template + **14 service pages** (Payload-driven, real copy, Service/FAQPage/Breadcrumb schema, hero images, relevant YouTube videos on decanter/basket/disc-stack/balancing/rebuilds/repair).
- **Full homepage** (hero with fly-through video top-right, trust bar, services, emergency, types, industries, process, before/after proof, why, locations, FAQ, CTA) + graphical logo in header.
- Legacy Cognito URLs preserved: **/cw-ez-quote-for-sales/** (EZ Quote) and **/contact-cw/** (Contact) — nav "Request a Quote"/"Contact" point here.
- Legal: /privacy-policy/, /terms-of-use/ (drafts, TODO legal review).

### Cycle 3 — OEM library
- **All 42 brand pages** on one template, content harvested from the Wayback archive (live site is captcha-walled) by 7 parallel extraction agents → rewritten SEO/AEO. Each: hero, answer box, independent-service disclosure, models, types, rebuild gallery (S3), FAQs, related links, Cognito quote form, schema, brand video where available.
- Merge redirects: alfa-laval-sharples→alfa-laval, bird-andritz→bird, ketema-tolhurst→tolhurst.
- /brands/ index.

### Cycle 4 — Reach
- **8 industry pages** (typical equipment cross-linked, failure modes, services, brands, FAQs, hero).
- **3 location pages** (Houston (Rosharon)/Franklin Park/Alsip) + index — LocalBusiness schema, NAP from nap.json, click-to-load map facade, capabilities.
- **FAQ hub** (/resources/faqs/) — 5 categorized sections + FAQPage schema.
- Sitemap expanded to all routes.

### Cycle 5 — Authority
- **How-it-works** library: index + 8 pages (correct engineering, decanter/basket videos, Article+VideoObject schema).
- **Case studies**: index + 5 (confidential clients, before/after, galleries; outcomes/timelines TODO(verify) drafts — zero invented facts).
- **Blog**: index + 4 SEO posts (hero images, internal links, FAQs).
- **Videos** (/resources/videos/): all 15 @centrifugeworld channel videos (facade grid, VideoObject schema).

### Media & content sourcing
- Images served directly from the client's public S3 bucket (centrifuge-im.s3.amazonaws.com) via next/image; appropriate hero per page.
- Videos: YouTube via click-to-load facades (no third-party JS before play); channel pulled via RSS.
- All inline `TODO(verify: …)` notes stripped from visible text (kept in content JSON `todos` arrays for the client).

### Not done — requires the client / external access
- **Cycle 6 (launch/cutover)**: DNS repoint, Google Search Console/Analytics/Business Profile, WordPress final export + freeze, and the client go-decision. Irreversible and gated — cannot run autonomously.
- **Cycle 0 (live WordPress hotfixes)**: needs the WP site URL + backup; the site is behind a SiteGround captcha that blocks automated access.
- Real integration secrets (Resend, Turnstile, Blob) — placeholders; native-form integration deferred (Cognito handles live lead capture).

### Open TODO(verify) for the client (in content `todos` arrays)
Brand model designations (most brands), two brand spellings (Contrubex, Veronesi), per-facility capability lists, case-study outcomes/timelines, cost/turnaround figures (kept as ranges), pharma/food/dairy certification claims, legal review, public email, social sameAs URLs, location geo coordinates.
