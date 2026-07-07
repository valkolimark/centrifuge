/* Real-data read model for the Leads & Quotes workspace (UI-2 §7).
 *
 * Server-only. Aggregates the `leads` and `quotes` collections into the exact shapes the
 * Mission Control workspace renders — the pipeline board (leads grouped by stage), the form
 * lead tracker, the quote archive, and the KPI tiles. This is the read side only; drag-drop
 * stage changes and "Send to Client" are writes wired separately.
 *
 * Kept framework-agnostic (plain data) so the client island renders it directly and it can be
 * unit-tested / dumped by scripts/verify-workspace-data.ts without a browser.
 */
import { getPayloadClient } from '@/lib/payload'
import { PIPELINE_STAGES } from './shared'
import type { LeadCard, StageColumn, DeliveryDot, FormLeadRow, QuoteRow, WorkspaceData, PipelineStage } from './shared'

export { PIPELINE_STAGES } from './shared'
export type { LeadCard, StageColumn, DeliveryDot, FormLeadRow, QuoteRow, WorkspaceData, WorkspaceKpis, PipelineStage } from './shared'

const SOURCE_LABEL: Record<string, { label: string; tag: string }> = {
  contact: { label: 'Contact', tag: 'contact' },
  'quote-request': { label: 'Quote Req', tag: 'quote' },
  emergency: { label: 'Emergency', tag: 'emergency' },
  'phone-in': { label: 'Phone-in', tag: 'phone' },
  manual: { label: 'Manual', tag: 'contact' },
}

const MS = { hour: 3_600_000, day: 86_400_000 }

// Sum a quote's line items × qty (mirrors Quotes.ts money(); virtual `total` isn't selectable).
const lineTotal = (items: { qty?: number; unitPrice?: number }[] = []) =>
  items.reduce((s, li) => s + (Number(li.qty) || 0) * (Number(li.unitPrice) || 0), 0)

const quoteTotal = (q: { lineItems?: any[]; taxRate?: number }) => {
  const sub = lineTotal(q.lineItems)
  return sub + (sub * (Number(q.taxRate) || 0)) / 100
}

function ageLabel(from: string, now: number): string {
  const ms = now - new Date(from).getTime()
  if (ms < MS.hour) return `${Math.max(1, Math.round(ms / 60000))}m`
  if (ms < MS.day) return `${Math.round(ms / MS.hour)}h`
  return `${Math.round(ms / MS.day)}d`
}

const person = (name?: string | null, email?: string | null) =>
  name?.trim() || (email ? email.split('@')[0] : 'Unknown')

const RECIPIENT_INITIAL = (email: string) => (email.trim()[0] || '?').toUpperCase()

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const payload = await getPayloadClient()
  const now = Date.now()

  // Pull leads + quotes with only the fields the workspace needs. Leads are ~700; one page.
  const [leadsRes, quotesRes] = await Promise.all([
    payload.find({
      collection: 'leads',
      depth: 0,
      limit: 2000,
      sort: '-createdAt',
      select: {
        name: true, company: true, email: true, phone: true, sourceForm: true, message: true, notes: true,
        pipelineStage: true, estimatedValue: true, delivery: true, createdAt: true, payload: true,
      },
    }),
    payload.find({
      collection: 'quotes',
      depth: 0,
      limit: 1000,
      sort: '-createdAt',
      select: {
        quoteNumber: true, lead: true, client: true, scopeTitle: true, lineItems: true,
        taxRate: true, validUntil: true, status: true, sentSnapshots: true, createdAt: true,
      },
    }),
  ])

  const leads = leadsRes.docs as any[]
  const quotes = quotesRes.docs as any[]

  // Phase 3: inventory-sourced leads carry payload.machine — show the INV id in the source
  // column (e.g. "INV-0042") so staff can tell the lead came from a specific listing.
  const machineIdOf = (l: any): string | null =>
    l?.payload && typeof l.payload === 'object' && l.payload.machine && typeof l.payload.machine.inventoryId === 'string'
      ? l.payload.machine.inventoryId
      : null

  // Latest quote per lead → surfaces the CW-Q number + value on Quote-Sent/Won/Lost cards.
  const quoteByLead = new Map<string, { quoteNumber: string; total: number }>()
  for (const q of quotes) {
    const leadId = q.lead ? String(q.lead) : null
    if (leadId && !quoteByLead.has(leadId) && q.quoteNumber) {
      quoteByLead.set(leadId, { quoteNumber: q.quoteNumber, total: quoteTotal(q) })
    }
  }

  // ---- Pipeline board ----
  const columns: StageColumn[] = PIPELINE_STAGES.map((s) => ({
    stage: s.stage, label: s.label, color: s.color, count: 0, valueSum: 0, leads: [],
  }))
  const columnByStage = new Map(columns.map((c) => [c.stage, c]))

  for (const l of leads) {
    const col = columnByStage.get(l.pipelineStage as PipelineStage) ?? columnByStage.get('new')!
    const linked = quoteByLead.get(String(l.id))
    const src = SOURCE_LABEL[l.sourceForm as string] ?? SOURCE_LABEL.contact
    const value = linked?.total ?? (typeof l.estimatedValue === 'number' ? l.estimatedValue : null)
    col.count += 1
    col.valueSum += value || 0
    col.leads.push({
      id: String(l.id),
      name: person(l.name, l.email),
      company: l.company || '—',
      email: l.email || null,
      phone: l.phone || null,
      message: (l.message || '').slice(0, 400),
      notes: l.notes || '',
      source: machineIdOf(l) ?? src.label,
      sourceTag: src.tag,
      estimatedValue: value,
      quoteNumber: linked?.quoteNumber ?? null,
      createdAt: l.createdAt,
      ageLabel: ageLabel(l.createdAt, now),
      isHot: l.sourceForm === 'emergency' || now - new Date(l.createdAt).getTime() < MS.day,
    })
  }

  // ---- Form lead tracker (most recent 30 real submissions; manual entries excluded) ----
  const formLeads: FormLeadRow[] = leads
    .filter((l) => l.sourceForm && l.sourceForm !== 'manual')
    .slice(0, 30)
    .map((l) => {
      const src = SOURCE_LABEL[l.sourceForm as string] ?? SOURCE_LABEL.contact
      const delivery: DeliveryDot[] = Array.isArray(l.delivery)
        ? l.delivery.map((d: any) => ({
            recipient: d.recipient, initial: RECIPIENT_INITIAL(d.recipient || '?'), status: d.status || 'queued',
          }))
        : []
      return {
        id: String(l.id),
        receivedAt: l.createdAt,
        source: machineIdOf(l) ?? src.label,
        sourceTag: src.tag,
        name: person(l.name, l.email),
        company: l.company || '—',
        message: (l.message || '').slice(0, 160),
        delivery,
        pipelineStage: l.pipelineStage || 'new',
        pipelineLabel: PIPELINE_STAGES.find((s) => s.stage === l.pipelineStage)?.label || 'New',
      }
    })

  // ---- Quote archive ----
  const quoteRows: QuoteRow[] = quotes.map((q) => {
    const sentAt = Array.isArray(q.sentSnapshots) && q.sentSnapshots.length
      ? q.sentSnapshots[q.sentSnapshots.length - 1].sentAt
      : null
    return {
      id: String(q.id),
      quoteNumber: q.quoteNumber || '—',
      clientCompany: q.client?.company || '—',
      clientContact: q.client?.contactName || '—',
      scope: q.scopeTitle || '—',
      total: quoteTotal(q),
      sentAt,
      validUntil: q.validUntil || null,
      status: q.status || 'draft',
      year: String(new Date(q.createdAt).getUTCFullYear()),
    }
  })

  // ---- KPIs ----
  const sevenDaysAgo = now - 7 * MS.day
  const ninetyDaysAgo = now - 90 * MS.day
  const newLeads7d = leads.filter((l) => new Date(l.createdAt).getTime() >= sevenDaysAgo).length

  const openStatuses = new Set(['sent', 'viewed'])
  const openQuotes = quoteRows.filter((q) => openStatuses.has(q.status))
  const openQuoteValue = openQuotes.reduce((s, q) => s + q.total, 0)

  const decided90d = quoteRows.filter(
    (q) => (q.status === 'accepted' || q.status === 'declined') &&
      q.sentAt && new Date(q.sentAt).getTime() >= ninetyDaysAgo,
  )
  const accepted90d = decided90d.filter((q) => q.status === 'accepted')
  const winRate90d = decided90d.length ? Math.round((accepted90d.length / decided90d.length) * 100) : null
  const acceptedValue90d = accepted90d.reduce((s, q) => s + q.total, 0)

  const expiringSoon = openQuotes.filter(
    (q) => q.validUntil && new Date(q.validUntil).getTime() - now < 7 * MS.day &&
      new Date(q.validUntil).getTime() - now > 0,
  ).length

  return {
    pipeline: columns,
    formLeads,
    quotes: quoteRows,
    kpis: {
      newLeads7d,
      openQuoteValue,
      openQuoteCount: openQuotes.length,
      acceptedValue90d,
      winRate90d,
      expiringSoon,
    },
    totals: { leads: leadsRes.totalDocs, quotes: quotesRes.totalDocs },
    generatedAt: new Date(now).toISOString(),
  }
}
