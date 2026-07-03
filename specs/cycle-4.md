# Cycle 4 — Reach: Locations, Industries, AEO Layer

**Prerequisites:** Cycles 2–3 complete (service + brand pages live on staging; schema builders exist). External needs this cycle: confirmed geo coordinates + Google Business Profile URLs per location, social profile URLs (sameAs), map embeds allowed.
**Output:** location pages, industry pages, FAQ hub, and the finished sitewide schema/entity layer. After this cycle the site is fully machine-readable and locally targeted.

## Tasks

### 4.1 Location pages ×3 (`/locations/` index + houston, franklin-park, alsip)
Template: Hero (facility name + real facility imagery from migrated assets if available; generic industrial otherwise, honestly captioned) → AnswerBox ("Who repairs industrial centrifuges near [metro]?") → facility capabilities (shop services available at that site — `TODO(verify per-facility capability list with client)`; render a shared capability list with a TODO flag until confirmed) → service-area copy (metro + surrounding states) → LocationCard w/ map facade → team/shop gallery → FAQ (2–3 local) → quote form pre-filled with location → RelatedLinks. LocalBusiness schema per `data/schema-map.md`, NAP from nap.json only. Houston page uses the "Houston (Rosharon), TX" naming pattern.
- **Accept:** rendered NAP byte-matches nap.json (automated); LocalBusiness validates with 0 errors; all three linked from footer + /locations/ index.

### 4.2 Industry pages ×8
Slugs per navigation.json. Template: Hero → AnswerBox ("Who services centrifuges for [industry] plants?") → typical equipment in this industry (types + common brands, cross-linked to /brands/) → common failure modes / service needs → relevant services grid → industry-tone copy (rendering ≠ pharma: match vocabulary; pharma/food mention sanitary + documentation expectations WITHOUT claiming certifications not in CLAUDE.md — any cert claim = TODO(verify)) → FAQ → quote form → CTABanner. Beer-centrifuge legacy content folds into Food & Beverage as a section with anchor (redirect already mapped).
- **Accept:** 8 pages pass Definition of Done; every industry page links ≥3 brand pages + ≥3 service pages; Cycle 2's placeholder industry stubs fully replaced (no stub route remains).

### 4.3 FAQ hub (`/resources/faqs/`)
All global questions from `data/faq-bank.md` in categorized accordions (Repair & Rebuilds / Emergency & Field Service / Parts & Fabrication / Buying & Selling / Costs & Turnaround). Each answer links to its deep page. FAQPage schema covering exactly the rendered questions. Unverified cost/turnaround numbers stay generic until client sign-off (check PROGRESS TODO list — if signed off since Cycle 2, publish the numbers).
- **Accept:** hub validates; no question duplicated verbatim on >3 pages sitewide (scripted check).

### 4.4 Entity & schema completion (sitewide)
- Organization schema: add verified sameAs URLs, logo, foundingDate, full contactPoint set (main/emergency-24x7/chicago/houston with contactType + hoursAvailable).
- Sweep: every route emits its schema-map.md types; add missing VideoObject/ImageObject wiring for galleries and any embedded videos already migrated.
- Segmented XML sitemaps (pages/services/brands/industries/locations/resources) + robots.txt final (allow all, block /admin, /login, /styleguide, /api).
- CI validation: structured-data validator on one URL per template type; Google Rich Results Test run manually on the same set, results logged in PROGRESS.md.
- Internal-link audit script: every public page reachable ≤3 clicks from home; orphan report must be empty.
- **Accept:** 0 schema errors on all template types; sitemap covers 100% of published routes; orphan report empty.

### 4.5 AEO verification pass
Scripted check: every service/brand/industry/how-it-works route contains an AnswerBox 40–60 words directly after H1; answer text contains the entity name "Centrifuge World" and no TODO strings; headings hierarchy valid (exactly one H1, no skipped levels).
- **Accept:** check passes on 100% of applicable routes; violations report empty.

## Exit checklist
- [ ] All acceptance criteria pass; Lighthouse ≥95 mobile on locations + industries samples
- [ ] Client actions requested: update the 3 Google Business Profiles to byte-match nap.json (site NAP is now the reference)
- [ ] PROGRESS.md updated; remaining TODO(verify) items re-sent to client
