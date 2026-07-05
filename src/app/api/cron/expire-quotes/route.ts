/* Expiry cron (UI-2 §2.2 / §6). Flips overdue sent|viewed quotes → expired. Scheduled
 * daily via vercel.json crons. Protected by CRON_SECRET (Vercel sends it as a Bearer token). */
import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const now = new Date().toISOString()
  const res = await payload.find({
    collection: 'quotes',
    where: { and: [{ status: { in: ['sent', 'viewed'] } }, { validUntil: { less_than: now } }] },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  let expired = 0
  for (const q of res.docs as any[]) {
    try {
      await payload.update({ collection: 'quotes', id: q.id, data: { status: 'expired' }, overrideAccess: true })
      expired++
    } catch {
      /* skip individual failures */
    }
  }
  return NextResponse.json({ ok: true, checked: res.docs.length, expired })
}
