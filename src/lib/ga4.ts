import { unstable_cache } from 'next/cache'

// GA4 Data API integration for Mission Control (UI-1 Phase B). Uses a read-only
// SERVICE ACCOUNT — never a user password. Provide two env vars:
//   GA4_PROPERTY_ID       — the numeric GA4 property id (Admin → Property Settings)
//   GA4_CREDENTIALS_JSON  — the full service-account JSON key (one line), whose
//                           client_email is granted Viewer on the GA4 property.
// Returns connected:false (graceful empty state) when either is missing.

export interface Ga4Data {
  connected: boolean
  reason?: string
  sessions: { date: string; sessions: number; conversions: number }[]
  acquisition: { channel: string; sessions: number }[]
  topPages: { path: string; entrances: number }[]
  totalSessions: number
}

const EMPTY = (reason: string): Ga4Data => ({ connected: false, reason, sessions: [], acquisition: [], topPages: [], totalSessions: 0 })

async function fetchGa4(): Promise<Ga4Data> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const raw = process.env.GA4_CREDENTIALS_JSON
  if (!propertyId || !raw) return EMPTY('Set GA4_PROPERTY_ID and GA4_CREDENTIALS_JSON (service account).')

  try {
    const credentials = JSON.parse(raw)
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    const client = new BetaAnalyticsDataClient({ credentials })
    const property = `properties/${propertyId}`

    const [ts, acq, pages] = await Promise.all([
      client.runReport({ property, dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'conversions' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
      client.runReport({ property, dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 5 }),
      client.runReport({ property, dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'entrances' }], orderBys: [{ metric: { metricName: 'entrances' }, desc: true }], limit: 5 }),
    ])

    const sessions = (ts[0].rows ?? []).map((r) => ({ date: r.dimensionValues?.[0]?.value ?? '', sessions: Number(r.metricValues?.[0]?.value ?? 0), conversions: Number(r.metricValues?.[1]?.value ?? 0) }))
    const acquisition = (acq[0].rows ?? []).map((r) => ({ channel: r.dimensionValues?.[0]?.value ?? '—', sessions: Number(r.metricValues?.[0]?.value ?? 0) }))
    const topPages = (pages[0].rows ?? []).map((r) => ({ path: r.dimensionValues?.[0]?.value ?? '/', entrances: Number(r.metricValues?.[0]?.value ?? 0) }))
    const totalSessions = sessions.reduce((a, s) => a + s.sessions, 0)
    return { connected: true, sessions, acquisition, topPages, totalSessions }
  } catch (e) {
    return EMPTY(`GA4 error: ${(e as Error).message}`)
  }
}

// 1-hour cache per the spec — but never serve a stale "disconnected" result (so
// newly-added credentials take effect immediately instead of waiting out the TTL).
const cachedGa4 = unstable_cache(fetchGa4, ['ga4-report-v2'], { revalidate: 3600 })
export async function getGa4(): Promise<Ga4Data> {
  const cached = await cachedGa4()
  if (cached.connected) return cached
  return fetchGa4()
}
