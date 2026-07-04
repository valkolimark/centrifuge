import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

// GET /api/admin/analytics — GA4 sessions/acquisition/top-pages for the Mission
// Control dashboard. Requires an authenticated admin session. Returns a graceful
// "not connected" payload when GA4 env vars are absent (UI-1 Phase B). Results are
// cached for 1 hour once the GA4 Data API is wired.
export const revalidate = 3600

export async function GET() {
  // Auth: only logged-in admins.
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const propertyId = process.env.GA4_PROPERTY_ID
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!propertyId || !creds) {
    return NextResponse.json({
      connected: false,
      reason: 'Set GA4_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS to enable analytics.',
      sessions: [],
      acquisition: [],
      topPages: [],
    })
  }

  // TODO(GA4): call the GA4 Data API (@google-analytics/data) here once creds exist.
  // Kept behind the env guard so the dashboard renders a clean empty state until then.
  return NextResponse.json({ connected: false, reason: 'GA4 client not yet wired', sessions: [], acquisition: [], topPages: [] })
}
