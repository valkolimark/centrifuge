/* Re-send lead notifications that failed to route (e.g. a provider/sender-domain outage left a
 * lead captured but the team un-emailed — the lead has a `route_failed` activity and no
 * delivery). Re-runs routeLead so the internal alert (+ submitter ack) goes out.
 *
 * Auth: the same-origin admin session (a signed-in staff user) — no standing secret. Trigger by
 * visiting the URL while logged into /admin. Pass ?leadId=<id> to re-send one lead, or omit to
 * re-send all failed ones. Idempotent: leads already `routed` or with a delivered recipient are
 * skipped, so re-running never double-sends. */
import { headers as nextHeaders } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { routeLead } from '@/payload/hooks/leadRouting'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated — sign in to /admin first.' }, { status: 401 })

  const leadId = req.nextUrl.searchParams.get('leadId') || undefined

  const res = await payload.find({
    collection: 'leads',
    where: leadId ? { id: { equals: leadId } } : { sourceForm: { not_equals: 'manual' } },
    limit: leadId ? 1 : 100,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
  })

  const targets = (res.docs as any[]).filter((d) => {
    const acts = (d.activity || []).map((a: any) => a.type)
    const routed = acts.includes('routed')
    const delivered = Array.isArray(d.delivery) && d.delivery.some((x: any) => x.status === 'delivered')
    return !routed && !delivered && (acts.includes('route_failed') || (!!leadId && acts.includes('form_received')))
  })

  const results: Array<Record<string, unknown>> = []
  for (const lead of targets) {
    try {
      await routeLead(payload, lead)
      const fresh: any = await payload.findByID({ collection: 'leads', id: lead.id, depth: 0, overrideAccess: true })
      const acts = (fresh.activity || []).map((a: any) => a.type)
      results.push({ id: lead.id, name: lead.name, routed: acts.includes('routed'), stillFailed: !acts.includes('routed') })
    } catch (err: any) {
      results.push({ id: lead.id, name: lead.name, error: err?.message || 'retry failed' })
    }
  }

  return NextResponse.json({ ok: true, considered: targets.length, results })
}
