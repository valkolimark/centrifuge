# Cycle 7 — Post-Launch Optimization (structured 60 days, then ongoing)

**Prerequisites:** Cycle 6 live ≥48h with exit checklist green. This cycle is a recurring loop, not a single session — run it as four two-week sprints. Each sprint = one Claude Code session working this spec top-down on whatever the data says.

## Sprint 1 (weeks 1–2) — Stabilize
- Mine server logs + GSC for 404s/soft-404s daily → patch redirects same day.
- CrUX field-data watch: any template with LCP >2.5s / INP >200ms / CLS >0.1 at p75 gets a profiling task and fix.
- Form-funnel analytics: start→submit rate per form type; fix any field causing >30% drop (shorten, clarify, or make optional).
- Confirm all TODO(verify) items with client; publish held content (turnaround numbers, case-study outcomes, cert claims) as verified.
- **Accept:** 404 report trending to zero; CWV green or ticketed; TODO(verify) count reduced with client answers logged.

## Sprint 2 (weeks 3–4) — Tune for search & answers
- GSC query mining: pages with impressions but CTR <1.5% at position ≤10 → rewrite title/meta; queries the site ranks 11–20 for → strengthen the matching page (answer box wording, FAQ addition, internal links).
- AI-visibility baseline: manually query the faq-bank global questions in ChatGPT/Perplexity/Gemini/AI Overviews; log whether Centrifuge World is cited and what facts are repeated wrong → fix at the source (page copy/schema). Add a tracking tool (Profound/Otterly) if client approves budget.
- Mobile-menu + emergency-path usage review in GA4; iterate if emergency CTA CTR on mobile <expected.
- **Accept:** revision log of ≥10 title/answer-box tunes; AI-citation baseline document created.

## Sprint 3 (weeks 5–6) — Expand
- **Model-number landing pages** (highest-intent, near-zero competition): template extending the brand page for specific models with documented photo evidence — start with Sharples P3400, P5000, PM75000; Alfa Laval Lynx 40; CQ5000. Only models with real content/photos; parent = brand page.
- 2 additional case studies from Sprint-1-verified facts; publish held drafts.
- Review-generation workflow: email template + landing flow for requesting Google reviews from completed jobs (client executes). Review schema remains blocked until real reviews exist.
- **Accept:** ≥5 model pages live passing Definition of Done; case-study drafts cleared or explicitly parked.

## Sprint 4 (weeks 7–8) — Hand off
- CMS training doc (`/docs/editor-guide.md`): create a service page, brand page, post; edit nav/footer; manage FAQs; export leads; add a redirect — with screenshots.
- Quarterly content calendar proposal (12 topics from GSC gap data).
- 60-day report: leads by form type/source/page, rankings vs pre-launch baseline, CWV field data, AI-citation delta, backlog priorities.
- **Program close criteria:** rankings stable-or-better vs baseline, CWV green in field data, client staff has independently published ≥3 content pieces.

## Standing rules for all sprints
- Every change ships through the same CI gates as build cycles — Definition of Done never relaxes post-launch.
- Escalation threshold: any top-10 pre-launch term dropping >5 positions past day 14 → dedicated investigation task (check redirect, canonical, content parity with legacy page).
- New feature ideas → BACKLOG.md, groomed at sprint boundaries (known backlog: inventory subdomain absorption, WordPress decommission at day 30, review schema activation, heatmaps, call-tracking vendor integration).
