# Cycle 6 — Launch & Cutover

**Prerequisites:** Cycles 0–5 complete AND client go-decision recorded. External access REQUIRED before starting — DNS registrar, Google Search Console (both domains), GTM/GA4, WordPress admin (for freeze + final export), Google Business Profiles. **If any access is missing, STOP — this cycle cannot be partially executed.**
**Output:** the new site live on centrifuge.com, centrifugeworld.com consolidated into it, zero-loss redirect coverage, tracking live, rollback armed.

## Task sequence (ordered — do not parallelize across numbered steps)

### 6.1 Pre-flight (T-7 to T-2 days)
- Export the complete URL inventory from WordPress (all published posts/pages + attachment pages) AND crawl both live domains. Diff against `data/redirects.csv`; complete the map to 100% 1:1 coverage (attachment/junk pages may map to their parent or nearest hub — no URL left unmapped, no blanket redirect-to-home).
- Load final map into the Payload `redirects` collection; automated test asserts every legacy URL → exactly one 301 hop → 200 target on staging.
- Lower DNS TTL to 300s on both domains.
- Full client UAT sign-off checklist: all 6 forms from a real phone; CMS edit; every location's phone tapped and rings the right line.
- Content freeze on WordPress announced (T-48h).
- **Accept:** redirect test 100% green; TTLs confirmed lowered; UAT signed.

### 6.2 Production cutover (launch day)
1. Final DB/media sync staging → production project; production env vars verified (Resend, Turnstile PRODUCTION keys, GTM ID).
2. Point centrifuge.com apex + www to Vercel; www→apex 301; SSL issued and verified; HSTS active.
3. Point centrifugeworld.com to a redirect service (Vercel project or registrar-level) issuing **page-level 301s** `centrifugeworld.com/* → centrifuge.com/*` (paths largely mirror; the redirects collection catches renamed paths after the domain hop). staging.centrifugeworld.com → 410 or redirect to home; request removal in GSC.
4. Smoke suite (scripted): home, 3 service, 3 brand, 3 location/industry pages 200 + <2s TTFB; all forms deliver to the four inboxes from PRODUCTION; tel: links correct; sitemap.xml serving; robots.txt correct (no staging noindex leaked!).
- **Accept:** smoke suite green; a live emergency-form test confirmed received (client pre-warned).

### 6.3 Search & tracking activation (launch day + 1)
- GSC: verify new property (domain-level), submit segmented sitemaps, Change of Address from centrifugeworld.com property → centrifuge.com.
- GA4: fresh property recommended; GTM `GTM-P5VRJC5` audited — remove legacy tags (AdSense/Site Kit remnants) unless client confirms need; publish container with conversion events for each form type + phone_click as key events.
- Google Business Profiles ×3 updated to byte-match nap.json (or verify client did — this is the entity-consistency keystone).
- Bing Webmaster: verify + sitemap.
- **Accept:** GSC shows sitemap processed; real-time GA4 shows events from a test session; GBP audit screenshot logged.

### 6.4 Rollback plan (armed before 6.2, stood down at day 30)
Old WordPress host kept running (dark) for 30 days; documented one-step DNS revert; redirects collection export backed up daily; decision criteria for rollback written (site down >30min unresolved, forms undeliverable >2h, catastrophic indexation event).
- **Accept:** rollback doc in repo (`/LAUNCH-ROLLBACK.md`); revert dry-run described and reviewed.

### 6.5 48-hour watch
Monitor: Vercel logs for 404s (any real-traffic 404 → add redirect same day), GSC coverage, CrUX/Lighthouse on top templates, form delivery, uptime. Daily rank snapshot of top-20 terms (flux expected; escalation only per Cycle 7 thresholds).
- **Accept (cycle exit):** 0 unhandled 404s from real traffic at h48; all forms delivering; PSI ≥95 mobile on the four template samples; PROGRESS.md launch report written.

## Exit checklist
- [ ] Live on production domain, consolidation redirects verified externally (curl from outside)
- [ ] GSC/GA4/GBP/Bing all active and logged
- [ ] Rollback armed with calendar reminder for day-30 stand-down + WordPress decommission task in BACKLOG.md
