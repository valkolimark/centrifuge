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
  let test = false
  try {
    const body = await req.json()
    quoteId = body?.quoteId
    test = body?.test === true
  } catch {
    /* fall through to 400 */
  }
  if (!quoteId) return Response.json({ error: 'Missing quoteId' }, { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 })

  const email = (user as any).email as string | undefined
  try {
    // test=true → send only to the signed-in user (test-to-self), nothing committed.
    const result = await sendQuote(payload, quoteId, {
      ownerEmail: email,
      ...(test ? { testEmail: email } : {}),
    })
    return Response.json({ ok: true, test, ...result })
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Send failed' }, { status: 400 })
  }
}
