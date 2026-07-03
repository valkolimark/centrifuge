# Cycle 5 — Authority: Education & Proof

**Prerequisites:** Cycles 2–4 complete. External: SproutVideo embed IDs harvested from legacy pages; rebuild photo sets from S3 (already migrated in Cycle 3 harvest — extend harvest to how-it-works + media pages).
**Output:** upgraded education library, case-study engine + first entries, blog with launch posts, rebuilt sell/buy surfaces. This is the content AI engines cite.

## Tasks

### 5.1 How-It-Works library (`/resources/how-it-works/`)
Migrate + restructure the 6 legacy pages (decanter, basket, peeler, pusher, self-cleaning decanter, nozzle separator): AnswerBox ("How does a [type] centrifuge work?") → plain-language explanation with proper H2/H3 outline → labeled diagram (create as lightweight inline SVG per type — schematic, original artwork, no copied OEM diagrams) → video embed behind a click-to-load facade (static thumbnail; SproutVideo iframe injected on interaction; VideoObject schema) → "Signs this type needs repair" section → links to the matching repair service + brands → quote CTA.
Net-new pages ×2: "Signs Your Centrifuge Needs Repair" (symptom → likely cause → recommended action tables) and "Repair vs. Replace vs. Rebuild" (uses only client-verified cost framing from faq-bank; unverified numbers stay ranges/TODO).
Article schema on all; index page with type cards.
- **Accept:** 8 pages pass Definition of Done; zero raw video iframes at initial load (network assertion); each page links its service page and ≥2 brand pages.

### 5.2 Case-study engine + first entries
`case-studies` collection: title, client industry (never client name unless client supplies written permission — default "Confidential [industry] client"), machine brand/model, problem, scope of work, before/after gallery, timeline, outcome. Template with BeforeAfterSlider, Article schema, related brand/service links, quote CTA.
Draft **4–6 case studies** from harvested rebuild photo sets that clearly document a job (e.g., model-numbered sequences like P3400 / PM75000 / Lynx 40 / CQ5000 series photos). Write ONLY what the photos + legacy captions support: machine, visible scope, before/after. Every outcome/timeline field = `TODO(verify)` until client confirms; publish as drafts pending sign-off.
- **Accept:** engine live; ≥4 drafts complete with zero invented facts (all quantitative claims either sourced or TODO-flagged); client review packet generated (list of TODOs per study).

### 5.3 Blog (`/resources/blog/`)
Posts collection (already scaffolded C1) + listing/post templates (Article schema, author = Organization, reading time, related posts). Write 4 launch posts targeting question queries: (1) "How Much Does Industrial Centrifuge Repair Cost?" (range framing per faq-bank), (2) "How Long Does a Centrifuge Rebuild Take?" (publish only if turnaround TODO resolved; else swap for "What Happens During a Centrifuge Inspection?"), (3) "5 Warning Signs Your Decanter Centrifuge Needs Service," (4) "Emergency Centrifuge Repair: What to Do When Your Machine Goes Down." Each ends with the matching form CTA.
- **Accept:** 4 posts published on staging, Definition of Done, each internally links ≥3 money pages.

### 5.4 Sell / Buy surfaces
`/sell-your-centrifuge/`: rebuilt page (redirect from -2 slug already mapped) with the Sell form, what-we-buy criteria, how-it-works steps, photo-upload-forward UI. `/resources/videos/`: CW Media consolidation — facade-loaded video grid with VideoObject schema. Buy path: header/footer links to inventory.centrifuge.com open same-tab with consistent labeling; add `BACKLOG.md` entry for future inventory absorption; do NOT restyle the subdomain this cycle.
- **Accept:** sell form submits with photos; videos page loads zero third-party JS pre-interaction.

### 5.5 Content close-out
Run the full content inventory: every legacy URL harvested in Cycles 3/5 is now either (a) rebuilt, (b) merged with anchor, or (c) redirected — produce `content-migration/closeout-report.md` listing each with its disposition. Zero "unreviewed."
- **Accept:** closeout report shows 100% dispositioned; redirects.csv final except Cycle 6 full-export verification.

## Exit checklist
- [ ] All acceptance criteria pass
- [ ] Case-study fact-check packet sent to client; studies remain drafts until sign-off
- [ ] PROGRESS.md updated — the site is now feature/content complete pending launch
