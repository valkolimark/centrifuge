import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { getGa4 } from '@/lib/ga4'

// GET /api/admin/analytics — GA4 sessions/acquisition/top-pages for Mission Control.
// Auth-gated to logged-in admins; 1-hour cached; graceful empty state without creds.
export const revalidate = 3600

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await getGa4())
}
