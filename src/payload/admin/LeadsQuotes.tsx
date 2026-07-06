/* Leads & Quotes workspace — Payload custom admin view registered at /admin/leads-quotes
   (Cycle UI-2). Server wrapper: fetches the real read model + the signed-in user, then hands
   both to the client island which renders the interactive Mission Control workspace. */
import { getWorkspaceData } from '@/lib/leads-quotes/workspace'
import LeadsQuotesClient from './LeadsQuotesClient'

export default async function LeadsQuotes(props: any) {
  let data
  try {
    data = await getWorkspaceData()
  } catch {
    // DB unavailable — render an empty-but-functional shell rather than 500 the admin.
    data = {
      pipeline: [], formLeads: [], quotes: [],
      kpis: { newLeads7d: 0, openQuoteValue: 0, openQuoteCount: 0, acceptedValue90d: 0, winRate90d: null, expiringSoon: 0 },
      totals: { leads: 0, quotes: 0 }, generatedAt: new Date().toISOString(),
    }
  }
  const u = props?.user
  const userName = u?.name || (u?.email ? String(u.email).split('@')[0] : 'Mission Control')
  const userEmail = u?.email ? String(u.email) : ''
  return <LeadsQuotesClient data={data} userName={userName} userEmail={userEmail} />
}
