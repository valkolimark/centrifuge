/* Send the sample new-lead emails ([TEST] quote with photos, emergency, inventory machine) so
 * staff can review the layout in a real inbox. Runs on the deployment because production's
 * Twilio creds are Sensitive and can't be used locally.
 *
 * Auth: the same-origin admin session, like retry-routes. Visit while signed in to /admin.
 * Recipient: ?to=<address>, defaulting to the signed-in user. Only addresses on the lead-routing
 * recipient list are allowed, so this can't be used to email anyone else. No leads are created. */
import { headers as nextHeaders } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getRecipients } from '@/lib/email/recipients'
import { sendTestLeadEmails } from '@/lib/email/test-lead-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated — sign in to /admin first.' }, { status: 401 })

  const to = (req.nextUrl.searchParams.get('to') || String((user as any).email || '')).trim()
  const allowed = (await getRecipients(payload)).map((r) => r.email.toLowerCase())
  if (!to || !allowed.includes(to.toLowerCase())) {
    return NextResponse.json({ ok: false, error: `Test emails can only go to lead recipients: ${allowed.join(', ')}. Pass ?to=<one of them>.` }, { status: 400 })
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://centrifuge.com'
    const sent = await sendTestLeadEmails(to, siteUrl)
    return NextResponse.json({ ok: true, to, sent })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'send failed' }, { status: 502 })
  }
}
