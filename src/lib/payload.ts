import { getPayload } from 'payload'
import config from '@payload-config'

// Cached Payload local-API client for use in server actions / route handlers.
// getPayload memoizes internally, so this is safe to call per request.
export async function getPayloadClient() {
  return getPayload({ config })
}
