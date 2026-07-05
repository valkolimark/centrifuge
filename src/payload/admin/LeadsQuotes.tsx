/* Leads & Quotes workspace — Payload custom admin view registered at /admin/leads-quotes
   (Cycle UI-2). Server wrapper; the pixel-faithful UI + interactions live in the client
   island. Real lead/quote data is fetched here and passed down in a later step. */
import LeadsQuotesClient from './LeadsQuotesClient'

export default function LeadsQuotes() {
  return <LeadsQuotesClient />
}
