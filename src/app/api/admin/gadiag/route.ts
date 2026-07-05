import { NextResponse } from 'next/server'
import { getGa4 } from '@/lib/ga4'
export const dynamic = 'force-dynamic'
export async function GET() {
  const raw = process.env.GA4_CREDENTIALS_JSON || ''
  let credsParse = 'n/a'
  try { const c = JSON.parse(raw); credsParse = `ok:${c.client_email || '?'}` } catch (e) { credsParse = `parse-fail:${(e as Error).message}` }
  const d = await getGa4()
  return NextResponse.json({ hasPropertyId: !!process.env.GA4_PROPERTY_ID, propertyId: process.env.GA4_PROPERTY_ID || null, hasCreds: !!raw, credsLen: raw.length, credsFirst: raw.slice(0, 22), credsParse, ga4Connected: d.connected, ga4Reason: d.reason || null, ga4Sessions: d.totalSessions })
}
