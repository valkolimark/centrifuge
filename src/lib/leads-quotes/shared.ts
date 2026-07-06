/* Shared types + constants for the Leads & Quotes workspace. Pure (no server imports) so the
   client island can import PIPELINE_STAGES / the row types without dragging getPayloadClient
   and the Payload config into the client bundle. The server read model lives in ./workspace. */

// Pipeline columns, in board order, with the mockup's per-column accent + label.
export const PIPELINE_STAGES = [
  { stage: 'new', label: 'New', color: 'var(--blue2)' },
  { stage: 'contacted', label: 'Contacted', color: 'var(--cyan)' },
  { stage: 'quoting', label: 'Quoting', color: 'var(--violet)' },
  { stage: 'quote-sent', label: 'Quote Sent', color: 'var(--warn)' },
  { stage: 'won', label: 'Won', color: 'var(--ok)' },
  { stage: 'lost', label: 'Lost', color: 'var(--bad)' },
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]['stage']

export type LeadCard = {
  id: string
  name: string
  company: string
  email: string | null
  phone: string | null
  message: string
  source: string // display label, e.g. "Quote Req"
  sourceTag: string // css tag class, e.g. "quote"
  estimatedValue: number | null
  quoteNumber: string | null // linked quote's number, when one exists
  createdAt: string
  ageLabel: string // "3h", "2d", …
  isHot: boolean // young + high-signal (emergency / <24h)
}

export type StageColumn = {
  stage: PipelineStage
  label: string
  color: string
  count: number
  valueSum: number
  leads: LeadCard[]
}

export type DeliveryDot = { recipient: string; initial: string; status: string }

export type FormLeadRow = {
  id: string
  receivedAt: string
  source: string
  sourceTag: string
  name: string
  company: string
  message: string
  delivery: DeliveryDot[]
  pipelineStage: string
  pipelineLabel: string
}

export type QuoteRow = {
  id: string
  quoteNumber: string
  clientCompany: string
  clientContact: string
  scope: string
  total: number
  sentAt: string | null
  validUntil: string | null
  status: string
  year: string
}

export type WorkspaceKpis = {
  newLeads7d: number
  openQuoteValue: number
  openQuoteCount: number
  acceptedValue90d: number
  winRate90d: number | null // 0–100, null when no decided quotes in window
  expiringSoon: number
}

export type WorkspaceData = {
  pipeline: StageColumn[]
  formLeads: FormLeadRow[]
  quotes: QuoteRow[]
  kpis: WorkspaceKpis
  totals: { leads: number; quotes: number }
  generatedAt: string
}
