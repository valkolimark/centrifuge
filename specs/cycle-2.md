# Cycle 2 — Conversion Core

**Prerequisites:** Cycle 1 complete (verify: /styleguide deploys, CMS roles work, schema builders unit-tested, Lighthouse CI active). If any fail, STOP and report.
**Output:** the money pages. Homepage, native forms engine, contact, 14 service pages, legal pages, request-a-quote. After this cycle the staging site is a functioning lead-gen site.

## Tasks

### 2.1 Forms engine (build first — everything embeds it)
Six form types as configurations over one engine: **Request a Quote, Emergency Service, Free Inspection, Sell Your Centrifuge, Contact, Send Photos for Review.**
Shared field library: name*, company, email*, phone*, location/city, equipment type (select: Decanter / Basket / Disc Stack / Pusher / Peeler / Gearbox / Other), brand (select fed from `oem-brands.json` + "Not sure"), model, service needed, urgency (select: Emergency – down now / This week / Planning ahead), photo upload, message. Per-type field subsets: Emergency = name, phone, company, equipment, "what happened" (short), urgency locked to Emergency, photos optional — 5 fields max visible. Sell = adds condition + asking-price-optional. Photos-for-review = upload-first UI.
Behavior: server actions with zod validation; Turnstile + honeypot; submission stored in `form-submissions` (type, payload, page source, UTM capture) with admin list views, filters, CSV export; Resend notification to the four inboxes — **Emergency submissions use a distinct subject prefix `[EMERGENCY]` and also render the emergency phone number back to the user on the success screen** ("Fastest response: call 832-338-4990"). Success screens per type with clear next step. `form_submit` GA4 event with type param.
- **Accept:** all six types submit end-to-end on staging incl. 6-photo upload; CSV export opens in Excel; emergency success screen shows the phone; spam test (empty honeypot bypass attempt) rejected server-side.

### 2.2 Master service-page template
Payload `services` collection drives a block-composed template: Breadcrumbs → H1 → **AnswerBox** (question from `data/faq-bank.md`) → capabilities section → ProcessSteps → EmergencyCallout → Gallery (optional) → FAQAccordion (3–5 items) → RelatedLinks (services/brands/industries, CMS-selectable) → inline quote form (type per page) → CTABanner. Service + FAQPage + Breadcrumb schema auto-emitted.
- **Accept:** template page passes full Definition of Done with placeholder content before real pages are authored.

### 2.3 Service pages (14) — authored content
Create with real copy (migrate + rewrite legacy where it exists in `content-migration/`; write fresh where the audit found gaps). Answer-box question assignments per `data/faq-bank.md`.
Existing-content pages: Centrifuge Repair (hub), Centrifuge Rebuilds, Decanter Repair, Basket Repair, Inspections, Parts & Fabrication (merge of 4 legacy pages — preserve carbide tiles + settling tanks as sections w/ anchors), Gearbox Repair (absorb Sumitomo + planetary + decanter-gearbox-parts as sections), Rentals.
Net-new pages: Disc Stack Repair, Pusher & Peeler Repair, **Emergency Centrifuge Service** (24/7 framing, response process, emergency form embedded, safety-orange hero variant), Field Service, Preventive Maintenance, Balancing & Testing (dynamic hard-bearing balancing content exists in legacy decanter page — extract it here).
Rewrite rules: fix all audit-flagged copy artifacts; one H1; plant-manager tone; every page links to ≥2 sibling services, ≥2 brands, ≥1 industry (industries link to placeholder routes until Cycle 4 — acceptable, they 200 with a stub).
- **Accept:** 14 pages pass Definition of Done; zero copy artifacts from the audit blacklist (grep for "Treament", ".Firstly", "8:00pm"); internal-link rule verified.

### 2.4 Homepage
Sections in order: Hero (headline + sub + dual CTA: safety-orange "24/7 Emergency Service" tel/link + blue "Request a Quote"; real shop imagery, LCP image preloaded) → TrustBar (Since 1939 · 3 US Facilities · 45+ Brands Serviced · 24/7 Emergency — from site-settings) → Services grid (6 cards) → EmergencyCallout band → Centrifuge types row (5 types → service pages) → Industries strip (8 chips → Cycle 4 stubs) → ProcessSteps (Inspect → Quote → Rebuild → Balance → Test → Return) → Before/After proof section (BeforeAfterSlider + gallery from migrated S3 imagery) → Why Centrifuge World → LocationCards ×3 → FAQAccordion (5 global questions) → CTABanner → Footer.
- **Accept:** Definition of Done; LCP <1.8s on staging mobile throttled; both hero CTAs fire GA4 events.

### 2.5 Contact + Request-a-Quote pages
`/contact/`: three LocationCards from nap.json (address, role phone, hours, map embed loaded as static image with click-to-interactive facade), Contact form, emergency band. ContactPage + LocalBusiness schema. `/request-a-quote/`: focused single-column quote form page (nav-linked as primary button).
- **Accept:** NAP rendered matches nap.json byte-for-byte (automated test comparing rendered output to the JSON).

### 2.6 Legal + auth surfaces
`/privacy-policy/` and `/terms-of-use/`: draft covering forms data, cookies, GTM/GA analytics, ad/tracking pixels (present via Site Kit/AdSense legacy — cover conditionally), email communication, storage (Neon/Vercel), third-party processors (Vercel, Neon, Resend, Cloudflare, Google), user rights, privacy contact. Mark both `TODO(verify: legal review by client counsel)` in PROGRESS — publishable draft, not legal advice.
`/login/` (user) and `/admin` (Payload) confirmed styled, rate-limited, reset-flow tested.
- **Accept:** pages published; reset email delivers; brute-force lockout verified.

## Exit checklist
- [ ] All acceptance criteria pass; every page ≥95 mobile Lighthouse
- [ ] Client walkthrough: submit each form type from a phone; edit homepage trust bar via CMS unassisted
- [ ] PROGRESS.md updated; TODO(verify) list sent to client (turnaround claims, legal review, public email)
