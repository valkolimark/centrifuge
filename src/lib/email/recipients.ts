/* Notification recipients — the single source of truth (UI-2 §0). Reads the LeadRouting
 * global (office-editable), falling back to data/routing.json when unseeded. Used for both
 * form-lead routing and quote-delivery CC. Never hardcode addresses elsewhere. */
import routing from '../../../data/routing.json'

export type Recipient = { name?: string; email: string }

export async function getRecipients(payload: any, req?: any): Promise<Recipient[]> {
  try {
    const g: any = await payload.findGlobal({ slug: 'lead-routing', req })
    const list = (g?.recipients ?? []).filter((r: any) => r?.enabled !== false && r?.email)
    if (list.length) return list.map((r: any) => ({ name: r.name, email: r.email }))
  } catch {
    /* global unseeded — fall through */
  }
  return routing.recipients.filter((r) => r.enabled !== false).map((r) => ({ name: r.name, email: r.email }))
}

export const SENDERS = routing.senders
