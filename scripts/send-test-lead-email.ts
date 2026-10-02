/* Send the sample new-lead emails to ONE address for review (subjects prefixed [TEST]).
 * Needs Twilio creds in env. Production's are Sensitive (not readable locally), so normally use
 * the deployed route instead: https://centrifuge.com/api/admin/test-lead-email (signed in to /admin).
 *   pnpm tsx scripts/send-test-lead-email.ts you@example.com */
import { isDryRun } from '../src/lib/email/twilio'
import { sendTestLeadEmails } from '../src/lib/email/test-lead-email'

const to = process.argv[2]
if (!to || !/^[^@\s]+@[^@\s]+$/.test(to)) {
  console.error('Usage: pnpm tsx scripts/send-test-lead-email.ts <one-email-address>')
  process.exit(1)
}
process.env.LEADS_EMAIL_DRY_RUN = 'false'
if (isDryRun()) {
  console.error('No Twilio credentials in env. Use https://centrifuge.com/api/admin/test-lead-email while signed in to /admin.')
  process.exit(1)
}
for (const r of await sendTestLeadEmails(to)) console.log(`${r.sample.padEnd(10)} sent → ${to} (op ${r.operationId})`)
