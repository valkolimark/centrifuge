/* POST /quote-send { quoteId } — the workspace "Send to Client" action.
 *
 * A standalone Node route handler (NOT a client-imported server action, and NOT a Payload
 * collection endpoint) so the heavy send chain — sendQuote → pdf.tsx (react-dom/server +
 * headless Chrome) — never enters the client bundle or the payload.config graph. The client
 * just fetch()es this URL; auth rides the same-origin admin session cookie. */
import { headers as nextHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { sendQuote } from '@/lib/quotes/send'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let quoteId: string | undefined
  try {
    quoteId = (await req.json())?.quoteId
  } catch {
    /* fall through to 400 */
  }
  if (!quoteId) return Response.json({ error: 'Missing quoteId' }, { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const result = await sendQuote(payload, quoteId, { ownerEmail: (user as any).email })
    return Response.json({ ok: true, ...result })
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Send failed' }, { status: 400 })
  }
}
