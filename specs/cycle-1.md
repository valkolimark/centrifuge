# Cycle 1 — Foundation & Design System

**Environment:** this repo (fresh). **Prerequisites:** none in-repo. External: Vercel account, Neon database URL, Resend API key, Turnstile keys as env vars — if any secret is missing, scaffold with `.env.example` placeholders and continue; only integration tests are deferred.
**Output:** no public pages. A deployable skeleton with working CMS, design tokens, component library, and CI quality gates. Everything later cycles import.

## Tasks

### 1.1 Project scaffold
Next.js 15 (App Router, TS strict), Tailwind CSS 4, ESLint + Prettier, `src/` layout per CLAUDE.md conventions. Vercel config with staging (preview) + production. `lighthouserc.json` CI budget: mobile Performance/Accessibility/SEO ≥95 on `/` and `/styleguide` — the build FAILS below budget from this cycle forward.
- **Accept:** `pnpm build` clean; CI green; preview deploy live.

### 1.2 Payload CMS 3.x embedded
Collections: `pages`, `services`, `oem-brands`, `industries`, `locations`, `posts`, `case-studies`, `faqs`, `media`, `form-submissions`, `redirects`, `users`. Globals: `header-nav`, `footer`, `site-settings` (seeded from `data/navigation.json` and `data/nap.json` via a seed script — nav/NAP must be CMS-editable but seeded from the data files).
Roles + access control: **super-admin** (all), **editor** (all content, no users/settings), **content-manager** (create/edit drafts + publish posts/case-studies/faqs only), **viewer** (read + form-submissions read/export). Draft/publish, scheduled publish, live preview, autosave. Auth: login rate-limit, lockout after 8 failed attempts, password reset via Resend.
Every collection with public URLs gets SEO fields group: title, description, canonical override, ogImage, noindex toggle.
- **Accept:** four seeded users, one per role, each verified against a permission matrix test; preview shows draft content on the styleguide page; publish triggers ISR revalidation.

### 1.3 Design tokens + typography
`src/styles/tokens.css` implementing the CLAUDE.md palette exactly; Tailwind theme mapped to tokens. Self-host Archivo (variable, wght 600–800) + Inter (variable) via `next/font`, latin subset, swap. Write a small script (`scripts/check-contrast.ts`) asserting AA for every defined text/background pair — runs in CI.
- **Accept:** contrast script passes; total font transfer ≤90KB; no layout shift from font swap on styleguide page (CLS 0 in Lighthouse).

### 1.4 Component library (built on a `/styleguide` route, noindexed)
Layout: `Header` (desktop mega-nav rendering `data/navigation.json` structure incl. emergency utility bar), `MobileMenu`, `Footer`, `Breadcrumbs`.
Blocks: `Hero` (variant: home/interior/emergency), `AnswerBox`, `TrustBar`, `ServiceCard` + grid, `EmergencyCallout` (safety-orange, phone + 2-tap tel:), `ProcessSteps`, `StatsRow`, `FAQAccordion` (semantic details/summary enhanced, emits FAQPage schema via `src/lib/schema`), `CTABanner`, `BeforeAfterSlider` (pointer + keyboard operable), `Gallery`, `LogoRow`, `LocationCard`, `RelatedLinks`.
Forms: `Field` primitives (text, email, tel, select, textarea, file-upload w/ client-side compression to ≤2MB per image, max 6), inline validation + error messaging, Turnstile wrapper, honeypot.
- **MobileMenu requirements (this is a flagship component):** full-screen overlay, opens ≤200ms, order per `navigation.json → mobile_menu_order`; pinned emergency bar at top (safety-orange, tel: link); accordion groups with 44px+ touch targets; focus-trapped; Esc/overlay-tap closes; body scroll locked; no layout shift; works with JS disabled (falls back to anchor to footer nav).
- **Accept:** every component rendered on /styleguide with all variants; axe-core CI scan zero critical violations; keyboard-only walkthrough documented in PROGRESS.md.

### 1.5 Motion layer
`src/lib/motion.ts`: IntersectionObserver hook adding `.is-visible`; CSS-only transitions (opacity/transform, 150–250ms); stagger via CSS custom property index. Hover states on cards/buttons; menu open/close transitions. Global `prefers-reduced-motion` kill-switch. Total motion JS ≤2KB gz.
- **Accept:** reduced-motion emulation shows zero animation; no main-thread task >50ms attributable to motion.

### 1.6 SEO/infra utilities
`src/lib/schema/` builders per `data/schema-map.md` (org, website, localBusiness, service, faq, breadcrumb, article, video — typed, unit-tested against fixture snapshots). `JsonLd` component. Metadata helper reading CMS SEO fields. `next-sitemap`-style generation (segmented) + robots.txt. Redirects collection → Next middleware. Security headers in `next.config` (CSP w/ GTM allowances, HSTS, X-Frame-Options DENY except /admin same-origin, Referrer-Policy, Permissions-Policy). GA4/GTM via `@next/third-parties` with the event helper (`trackEvent`) for the Definition-of-Done events.
- **Accept:** schema unit tests pass; securityheaders.com grade A on preview; GTM fires on styleguide with no Lighthouse penalty >2 points.

## Exit checklist
- [ ] All acceptance criteria pass; CI gates (build, lint, lighthouse, contrast, axe, schema tests) active
- [ ] Seed script idempotent; `data/` files are the single source seeded from
- [ ] `/styleguide` reviewed by client (share preview URL) before Cycle 2 begins
- [ ] PROGRESS.md updated; unresolved env secrets listed
