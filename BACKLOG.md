# Backlog

Ideas and follow-ups deferred from a cycle's scope (CLAUDE.md rule 6).

## Lead emails (from the new-lead email redesign, 2026-10-02)
- **Real Reply-To on the internal alert.** Twilio Email rejects a custom `Reply-To` header; use its dedicated reply-to field so hitting Reply reaches the customer. The redesign works around this with Call/Email buttons.
- **Customer acknowledgement email redesign.** It picked up the Web Blue header but keeps its old layout.
- **Per-form-type routing** (e.g. quotes → Ron, emergencies → David) instead of all four recipients on every lead.
- **Legacy `src/lib/email/notify.ts` + `scripts/test-form.ts`** are unused by the live path (and the script still uses the old `company_website` honeypot). Remove or update.

## 3D decanter explorer (2026-11-26)
- **Draco decoder before three r194.** `DRACOLoader.setDecoderConfig({ type: 'js' })` is deprecated and removed in r194; after that only the WASM decoder remains, which needs `'wasm-unsafe-eval'` in the CSP `script-src`. Either approve that CSP change or re-export the model without Draco before upgrading `three` past 0.193.
- **`BeforeAfterSlider` breaks the homepage in `pnpm dev`.** `next/image` throws on `fill` + `style.width` in development only (production renders). Pre-existing; fix the slider so the homepage can be previewed locally.
- **Reuse the explorer elsewhere** (e.g. `/resources/how-it-works/decanter/`) and add more models (disc stack, basket) if the decanter one earns engagement.
- **Confirm the model layout with the shop** — gearbox on the liquid end and feed tube through the solids end are assumptions; swap ends in the Blender source if the reference machine differs.

## Fonts (from the 2026-11-23 Vercel build failures)
- **Only the latin subset is self-hosted.** `next/font/google` also served latin-ext, Cyrillic, Greek and Vietnamese subsets on demand; with the local files those characters fall back to system fonts. Add the latin-ext files if a brand or customer name ever needs them.

## 3D basket centrifuge (2026-11-26)
- **Confirm drive details with the shop.** The model offers an electric drive (motor on an inline gearbox) and a hydraulic drive (radial-piston motor with hoses) on the same pedestal. Both are representative; adjust either if the reference machines differ.
- **Perforations are drawn, not cut.** The basket holes are dark discs on the wall to keep the model light for the web. Real through-holes, a filter cloth/liner, and a hinged lid are possible refinements.

## 3D disc stack centrifuge (2026-11-26)
- **Confirm the machine details with the shop.** No public spec sheets were found for the reference models, so bowl size, both drive layouts (flat belt with a vertical side motor; worm gear with a horizontal flanged motor and centrifugal clutch), and the clarifier bowl layout (no separating disc or regulating ring) are assumptions. A purifier bowl would add a separating disc and gravity disc.
- **Operating-water details not modeled:** valves, supply lines, and the internal water passages. The main parts (operating slide, distributing ring, control paring disc, distributing cover) are in the model.
- **Three homepage bands** may be one too many; consider a single "Explore in 3D" band with all three machines.
- **Isolating a part is pointer-only.** Double-click / double-tap has no keyboard equivalent yet; offer an "isolate" action from the parts list.

