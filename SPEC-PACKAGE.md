# Centrifuge.com Rebuild — Claude Code Spec Package

This package contains everything Claude Code needs to build the new centrifuge.com in independent cycles.

## How to use

1. **Create a fresh repo** and copy this entire package into its root (`CLAUDE.md` must sit at repo root — Claude Code reads it automatically every session).
2. **Add secrets** as environment variables / `.env.local` when you have them: `DATABASE_URI` (Neon), `RESEND_API_KEY`, `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`, `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_SECRET`. Cycle 1 scaffolds placeholders if missing.
3. **Run one cycle per session.** Open Claude Code in the repo and prompt:
   > Read CLAUDE.md, then execute specs/cycle-1.md completely. Verify prerequisites first; stop and report if any fail. Work task by task, verifying each acceptance criterion before moving on. Finish by updating PROGRESS.md and listing every TODO(verify) item you created.
   Replace `cycle-1` with the current cycle. Do not ask for multiple cycles in one run.
4. **Review the staging deploy between cycles** — the specs assume a human go/no-go gate at each exit checklist. Batch reviews inside Cycle 3 (OEM Batch A) also expect your sign-off.
5. **Cycle 0 is special:** it runs against your live WordPress site, not this repo. Give Claude Code (or a human) the spec plus WP admin access, or use it as a punch list for your current webmaster.
6. **Cycle 6 is gated on access:** DNS, Search Console, GTM/GA, WordPress export, Google Business Profiles. Gather these during Cycles 3–5.

## Package contents
- `CLAUDE.md` — persistent project brief: stack (locked), design system, Definition of Done, business facts, hard rules
- `specs/cycle-0.md … cycle-7.md` — self-contained cycle specifications with acceptance criteria and exit checklists
- `data/nap.json` — the ONLY source for names, addresses, phones, hours
- `data/oem-brands.json` — the ONLY source for brand names/slugs (~42 brands, corrected spellings, legacy slugs, merge decisions)
- `data/navigation.json` — header/mobile/footer structure
- `data/redirects.csv` — 301 map (observed entries; completed in Cycles 3 and 6)
- `data/schema-map.md` — JSON-LD implementation map per page type
- `data/faq-bank.md` — AEO question bank + per-page answer-box assignments

## Rules that keep this safe
- Anything the audit couldn't verify is marked `TODO(verify:)` in the data files — Claude Code is instructed to flag these, never guess. Expect a short list of questions after Cycles 2, 3, and 5 (turnaround times, two brand spellings, per-facility capabilities, case-study outcomes, social URLs, legal review).
- No testimonials, reviews, stats, or outcomes are ever invented. Case studies publish as drafts until you confirm facts.
- The live site is untouched until Cycle 6, and a 30-day rollback stays armed after launch.
