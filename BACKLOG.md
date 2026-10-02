# Backlog

Ideas and follow-ups deferred from a cycle's scope (CLAUDE.md rule 6).

## Lead emails (from the new-lead email redesign, 2026-10-02)
- **Real Reply-To on the internal alert.** Twilio Email rejects a custom `Reply-To` header; use its dedicated reply-to field so hitting Reply reaches the customer. The redesign works around this with Call/Email buttons.
- **Customer acknowledgement email redesign.** It picked up the Web Blue header but keeps its old layout.
- **Per-form-type routing** (e.g. quotes → Ron, emergencies → David) instead of all four recipients on every lead.
- **Legacy `src/lib/email/notify.ts` + `scripts/test-form.ts`** are unused by the live path (and the script still uses the old `company_website` honeypot). Remove or update.
