/* Logs a hosted-quote view + flips sent→viewed (UI-2 §6). Called once per session by the
 * hosted page's ViewPing. Uses overrideAccess since the caller is an anonymous client. */
import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: '' }))
  if (!token || typeof token !== 'string') return NextResponse.json({ ok: false }, { status: 400 })

  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'quotes', where: { viewToken: { equals: token } }, limit: 1, depth: 0, overrideAccess: true })
  const q: any = res.docs[0]
  if (!q) return NextResponse.json({ ok: false }, { status: 404 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const userAgent = req.headers.get('user-agent') || undefined
  const data: any = { viewEvents: [...(q.viewEvents || []), { at: new Date().toISOString(), ip, userAgent }] }
  if (q.status === 'sent') data.status = 'viewed'

  await payload.update({ collection: 'quotes', id: q.id, data, overrideAccess: true })
  return NextResponse.json({ ok: true, status: data.status || q.status })
}
