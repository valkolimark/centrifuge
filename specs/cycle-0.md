# Cycle 0 — Stop the Bleeding (live WordPress hotfixes)

**Environment:** the CURRENT live WordPress site — NOT this repo. Requires WP admin credentials from the client. If credentials are unavailable, produce a written punch list for whoever holds access and stop.
**Prerequisites:** none. This cycle is independent of all others.
**Risk posture:** minimal, reversible edits only. Take a full backup (files + DB) before touching anything. No theme rebuilds, no plugin changes beyond what's listed.

## Tasks

### 0.1 Contact form failover
The form on `/contact-cw/` loads in an iframe that can render blank. 
- Replace with a native WP form (WPForms Lite or Contact Form 7 — whichever is already installed; install WPForms Lite if neither) with fields: Name, Company, Email, Phone, Location, Equipment Type, Message. Notifications → all four inboxes in `data/nap.json` → `organization.email_leads`.
- If replacing the form is blocked, add a hard-coded fallback block ABOVE the iframe: all four phone numbers with roles, hours, and a mailto link.
- **Accept:** test submission from desktop + mobile arrives in all four inboxes within 5 minutes.

### 0.2 Hours correction — site-wide
Find/replace every instance of the legacy string (see `data/nap.json` → `hours.forbidden_legacy_string`, incl. "8pm - 6:30pm" variant) with `Mon–Fri: 6:00 AM – 6:00 PM · On-Call 24/7`. These live in header/footer template parts (Elementor theme builder) — edit the template once, verify propagation.
- **Accept:** grep of rendered HTML on 5 sampled pages (home, /decanter-centrifuge-repair/, /sharples/, /contact-cw/, /centrifuge-rebuilding/) shows zero legacy hour strings.

### 0.3 Kill cross-domain links
Search content + templates for `centrifugeworld.com` and `staging.centrifugeworld.com` hrefs/srcs. Repoint every link to the same-path centrifuge.com URL. Re-upload the /sharples/ staging-hosted image to the media library / S3 and swap the src.
- **Accept:** site-wide crawl (Screaming Frog or `wget --spider`) returns 0 outbound links to either domain (mailto to deals@centrifugeworld.com may remain temporarily; log it).

### 0.4 Phone role standardization
Header/footer/contact templates updated so each number appears with its role label per `data/nap.json` → `phones`. Contact page must list per-location numbers matching nap.json.
- **Accept:** the four numbers appear with identical role labels on all 5 sampled pages.

### 0.5 Duplicate-slug 301s
Add redirects (Redirection plugin, or .htaccess):
`/hutchinson-hayes/→/hutchison-hayes/`, `/dorr-olive-r-merco/→/dorr-oliver-merco/`, `/heinkel-centrifuge-repair/→/heinkel/`, `/westfalia-centrifuge-repair/→/westfalia/` (confirm which Heinkel/Westfalia page has more content/backlinks first — redirect the weaker into the stronger; record the decision in PROGRESS.md and mirror it in `data/oem-brands.json` if it differs).
- **Accept:** each legacy URL returns a single 301 hop to its target.

### 0.6 Footer brand spelling fixes
In the footer template, correct labels per `data/oem-brands.json` → `legacy_misspellings` (Podbielniak, KHD Humboldt, Heraeus, Alfa Laval, Rousselet Robatel, Dorr-Oliver). Do NOT change slugs here (redirects handle URLs).
- **Accept:** footer contains zero strings from any `legacy_misspellings` array.

## Exit checklist
- [ ] Backup stored and restorable
- [ ] 0.1–0.6 acceptance criteria all pass
- [ ] PROGRESS.md updated with what was changed, where, and any items blocked by access
- [ ] Client notified that a live test lead was sent (so they don't treat it as real)
