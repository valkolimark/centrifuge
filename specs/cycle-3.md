# Cycle 3 — OEM Library Rebuild

**Prerequisites:** Cycle 2 complete (verify: service template + forms engine live on staging). External: reachable legacy site for content scraping; S3 image access or ability to hotlink-migrate.
**Output:** `/brands/` index + all ~42 brand pages on one upgraded template. Client directive: **keep every OEM page, remake on one template.** This is the SEO moat — treat content quality as the deliverable, not just the template.

## Tasks

### 3.1 Legacy content harvest
Script (`scripts/harvest-oem.ts`) fetches every `legacy_slugs` URL in `data/oem-brands.json`, extracts main content + image URLs + title/meta into `content-migration/oem/<slug>.json`. Also crawl legacy nav/footer/sitemap for any brand slug NOT in oem-brands.json → append to a `discovered` report, do not auto-publish. Confirm/extend `data/redirects.csv` with every harvested URL.
- **Accept:** one migration file per brand; discovered-slugs report written; redirects.csv has a row for every harvested URL.

### 3.2 OEM template (extends Cycle 2 service template)
Blocks in order: Breadcrumbs (Home → Brands → [Brand]) → brand Hero (name + hosted logo where available in harvested media; text-lockup fallback — never fabricate a logo) → **AnswerBox** ("Who repairs [Brand] centrifuges?") → **Independent-service disclosure**: a consistent, prominent one-liner — "Centrifuge World is an independent repair and rebuild specialist. We are not affiliated with [Brand]." (legally clean positioning; replaces the legacy garbled version) → Models Serviced (structured list field — populate from harvested content + `models_seen`; enables future model pages) → centrifuge types serviced for this brand → Rebuild gallery (migrated S3 photos, compressed to AVIF/WebP, descriptive alts incl. model numbers) → brand FAQ (per faq-bank.md) → RelatedLinks (2 sibling brands, 2 services, 1 industry) → inline quote form **pre-filled with brand** → CTABanner. Service + FAQPage + Breadcrumb schema.
- **Accept:** template passes Definition of Done with one pilot brand (Sharples).

### 3.3 Content upgrade pass — batched
Batch A (featured 10: Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, Flottweg, Hutchison Hayes, Tolhurst, Broadbent, Centrisys) → pause for client review → Batch B (next ~16) → Batch C (remainder).
Per-page rewrite rules: correct name from oem-brands.json only; strip duplicated blocks/broken bullets/artifacts; resolve every `merge_into`/duplicate decision flagged in oem-brands.json notes and record it in the file; where legacy content is thin (<150 usable words), write a structurally complete page from the template's standard sections but mark brand-specific claims `TODO(verify)` rather than inventing model lists.
- **Accept:** scripted checks pass across all pages — (a) zero strings from any `legacy_misspellings`, (b) every page has answer box + disclosure + FAQ + pre-filled form, (c) every image has non-empty alt, (d) no page body <300 words without a logged TODO.

### 3.4 `/brands/` index
A–Z grid with client-side filter/search (tiny, no library), featured brands row, intro copy targeting "centrifuge repair by brand." Replaces the legacy 44-item dropdown as the deep surface; header mega-menu shows featured 10 + "All 45+ Brands →" per navigation.json.
- **Accept:** every published brand appears exactly once; filter is keyboard operable; page passes Definition of Done.

### 3.5 Redirect entries
Generate `/brands/` 301 rows for all legacy OEM slugs into the redirects collection (staged, activated at Cycle 6 cutover; on staging they're live for testing).
- **Accept:** automated test — every legacy_slug in oem-brands.json returns 301 → correct new URL on staging.

## Exit checklist
- [ ] All brands published on staging; batch reviews signed off (Batch A explicitly by client)
- [ ] oem-brands.json updated with all merge decisions + verified spellings (Contrubex, Veronesi resolved or still flagged)
- [ ] redirects.csv complete for OEM section; PROGRESS.md updated
