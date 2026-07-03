# CLAUDE.md — Centrifuge.com Rebuild

This repo is the complete rebuild of centrifuge.com for **Centrifuge World**, a US industrial centrifuge repair/rebuild company (since 1939, 3 facilities, 45+ OEM brands serviced, 24/7 emergency service). Work proceeds in independent cycles defined in `/specs/`. Read this file fully before any task. Never start a cycle without reading its spec file.

## Non-negotiable rules
1. **Never fabricate** testimonials, reviews, case-study outcomes, statistics, certifications, or client names. Facts come from `/data/` or the human. If a fact is missing, insert `TODO(verify:)` and flag it in your summary.
2. **All links same-domain.** Never link to centrifugeworld.com or staging.* — those domains are being retired. The inventory subdomain (inventory.centrifuge.com) is the ONLY permitted external property.
3. **NAP data comes only from `/data/nap.json`.** Never type a phone number, address, or hour string by hand.
4. **Brand names/slugs come only from `/data/oem-brands.json`.** Legacy pages contain misspellings — never copy a brand name from scraped legacy content.
5. **Every page ships against the Definition of Done** (below). No exceptions, no "fix later."
6. **Do not exceed the current cycle's scope.** New ideas → append to `/BACKLOG.md`.
7. All copy is written for plant managers, maintenance managers, and procurement engineers — plain, technical, confident. No marketing fluff, no exclamation points.

## Stack (locked — do not substitute)
- **Next.js 15, App Router, TypeScript**, static generation + ISR (revalidate on publish via Payload hooks)
- **Payload CMS 3.x** embedded in the same Next.js app (`/admin`), Postgres via **Neon** (`@payloadcms/db-postgres`)
- **Media:** Vercel Blob storage adapter; sharp for WebP/AVIF; `next/image` everywhere; alt text is a required field
- **Email:** Resend. All form notifications → David@p5400.com, Ron@p5400.com, Cynthia@p5400.com, Mark@p5400.com
- **Anti-spam:** Cloudflare Turnstile (invisible) + honeypot + server-side validation on every form
- **Hosting:** Vercel (staging = preview deployments, production = main branch)
- **Analytics:** GTM `GTM-P5VRJC5` via `@next/third-parties`, loaded after interactive; GA4 events per Definition of Done
- **No page builders, no jQuery, no animation libraries >5KB gzipped, no CSS frameworks other than Tailwind CSS 4**

## Design system — "Web Blue" (client-selected palette)
Defined as CSS variables in `/src/styles/tokens.css`. Monochromatic blue ramp + true black/white, bright red for emergencies. Palette:
- `--color-blue-bright: #00B8FF` (brightest accent — dark surfaces, dark-mode links, glows)
- `--color-blue-mid: #009BD6` (accent / large text)
- `--color-blue: #00719C` (links, primary buttons, focus rings — clears AA on white)
- `--color-navy: #00415A` (primary surfaces, headings)
- `--color-blue-deep: #001F2B` (footer, hero overlays, deepest surface)
- `--color-steel-100/300/500/700: #EEF3F6 / #C2D0D8 / #5C7078 / #16303B` (cool, blue-tinted neutrals)
- `--color-white: #FFFFFF`, `--color-black: #000000`
- `--color-safety: #E11900` — **BRIGHT RED, reserved exclusively for emergency CTAs, the 24/7 line, and warnings.** Never decorative.
- success `#1E8E5A`, error `#D32F2F`
- All text/background pairs must pass WCAG AA (4.5:1 body, 3:1 large). Verify programmatically in Cycle 1.
- Type: self-hosted variable fonts, subset latin, `font-display: swap`. Headings: Archivo (SemiBold/Bold, tight tracking). Body/UI: Inter. Max 2 families, max ~90KB total font payload.
- Radius 6px cards / 4px buttons; borders 1px steel-300; shadows subtle (max `0 8px 24px rgb(7 37 70 / 0.10)`).
- Motion: 150–250ms ease-out micro-interactions; section reveals via IntersectionObserver adding a class (CSS transitions only); everything gated behind `prefers-reduced-motion`.

## Definition of Done — every page, every cycle
- [ ] Lighthouse mobile ≥95 Performance, ≥95 Accessibility, ≥95 SEO (CI budget in `lighthouserc.json` fails the build below this)
- [ ] Exactly one H1; logical H2/H3 hierarchy; no decorative headings
- [ ] Unique `<title>` (≤60 chars) and meta description (≤155 chars) from CMS fields
- [ ] JSON-LD valid for the page type (see `/data/schema-map.md`); BreadcrumbList on all non-home pages
- [ ] Answer-box block (40–60 word direct answer under the H1) on every service, OEM, industry, and how-it-works page
- [ ] Visible CTA above the fold; emergency phone reachable in ≤2 taps on mobile from any page
- [ ] All images: `next/image`, explicit dimensions, descriptive alt, lazy below fold
- [ ] Keyboard navigable; visible focus states; labeled form fields with inline error messages
- [ ] Page registered in sitemap; canonical self-referencing; in exactly one nav/index location per `/data/navigation.json`
- [ ] GA4 events wired: `form_submit` (per form type), `phone_click`, `email_click`, `cta_click`

## Business facts (authoritative)
- Company: **Centrifuge World** · canonical domain **https://centrifuge.com** · founded **1939** · claim "largest provider and rebuilder of industrial centrifuges in the US" is client-verified — usable.
- Hours: **Mon–Fri 6:00 AM–6:00 PM local, On-Call 24/7** (never render the legacy "8:00pm–6:30pm" string).
- Locations (3, all active) and phone roles: see `/data/nap.json`. Roles: 800-208-6075 = main; 832-338-4990 = 24/7 emergency; 773-617-0937 = Chicago + SMS "Text Us"; 832-743-1573 = Houston direct.
- Leads → the four p5400.com inboxes above, plus stored in Payload `form-submissions` with CSV export.
- Social sameAs: Facebook, Instagram, X @centrifugeworld, YouTube @centrifugeworld5012 (exact URLs: TODO(verify) in Cycle 4).

## Repo conventions
- `src/app` routes · `src/components` (ui/, blocks/, layout/) · `src/payload` (collections, blocks, access) · `src/lib` (schema builders, seo, analytics) · `content-migration/` (scraped legacy content staging area, never deployed)
- Conventional commits; one PR per spec task group; every PR description lists which Definition of Done items were verified and how.
- After each cycle: update `/PROGRESS.md` with completed tasks, open TODO(verify) items, and anything deferred to BACKLOG.md.

## Cycle independence protocol
Each `/specs/cycle-N.md` is self-contained: it states its prerequisites, its tasks with acceptance criteria, and its exit checklist. If a prerequisite from an earlier cycle is missing, STOP and report — do not improvise foundation work inside a later cycle.
