import { LeadForm } from './LeadForm'
import type { FormType } from '@/lib/forms/config'
import type { MachineSnapshot } from '@/lib/inventory-machine'

// Native inline lead forms (Turnstile + honeypot; submit via the server action into the leads
// pipeline). Thin wrappers keep page code terse — every inline form on the site is now native.
// QuoteForm = the native "EZ Quote" (request_quote); ContactForm = the native contact form.
// `prefill`/`machine` support CYCLE-INV-1 Phase 3 (quote pre-population from an inventory machine).
export function QuoteForm({
  type = 'request_quote',
  prefill,
  machine,
}: { type?: FormType; prefill?: Partial<Record<string, string>>; machine?: MachineSnapshot | null } = {}) {
  return <LeadForm type={type} prefill={prefill} machine={machine} />
}

export function ContactForm() {
  return <LeadForm type="contact" />
}
