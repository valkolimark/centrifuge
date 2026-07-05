import { NextResponse } from 'next/server'
import { getGa4 } from '@/lib/ga4'

// TEMPORARY diagnostic (UI-1) — reveals GA4 config/connection status so we can see
// why the dashboard shows the empty state. No secrets returned (only lengths/flags).
// Remove after diagnosing.
export const dynamic = 'force-dynamic'

export async function GET() {
  const raw = process.env.GA4_CREDENTIALS_JSON || ''
  let credsParse = 'n/a'
  try {
    const c = JSON.parse(raw)
    credsParse = `ok:${c.client_email || '?'}`
  } catch (e) {
    credsParse = `parse-fail:${(e as Error).message}`
  }
  const d = await getGa4()
  return NextResponse.json({
    hasPropertyId: !!process.env.GA4_PROPERTY_ID,
    propertyId: process.env.GA4_PROPERTY_ID || null,
    hasCreds: !!raw,
    credsLen: raw.length,
    credsFirst: raw.slice(0, 20),
    credsParse,
    ga4Connected: d.connected,
    ga4Reason: d.reason || null,
    ga4Sessions: d.totalSessions,
  })
}
