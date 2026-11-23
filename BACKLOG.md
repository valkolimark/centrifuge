# Backlog

Ideas and follow-ups deferred from a cycle's scope (CLAUDE.md rule 6).

## Lead emails (from the new-lead email redesign, 2026-10-02)
- **Customer acknowledgement email redesign.** It picked up the Web Blue header but keeps its old layout.
- **Per-form-type routing** (e.g. quotes → Ron, emergencies → David) instead of all four recipients on every lead.
- **Legacy `src/lib/email/notify.ts` + `scripts/test-form.ts`** are unused by the live path (and the script still uses the old `company_website` honeypot). Remove or update.
- **Delivery status for SendGrid sends.** SendGrid accepts (202) but has no operation to poll, so lead delivery rows stay "Queued". An Event Webhook could mark them delivered/bounced.
- **Reply-to on the customer acknowledgement.** It still replies to notifications@; point it at a monitored inbox once one is chosen.
