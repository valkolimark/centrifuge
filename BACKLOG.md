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
