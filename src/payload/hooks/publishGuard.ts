import type { CollectionBeforeChangeHook } from 'payload'
import { isEditorUp } from '../access/roles'

// Enforces "content-manager can create/edit drafts but may publish ONLY
// posts/case-studies/faqs". Attach to collections a content-manager must NOT be
// able to publish (pages, services, oem-brands, industries, locations). Blocks any
// attempt by a non-editor to set _status to 'published'.
export const preventNonEditorPublish: CollectionBeforeChangeHook = ({ data, req, originalDoc }) => {
  const user = req.user
  // No user = system/local-API context (seed, migrations). Access control already
  // blocks unauthenticated writes before hooks run, so this is trusted — allow it.
  if (!user) return data
  if (isEditorUp(user)) return data
  const becomingPublished = data?._status === 'published' && originalDoc?._status !== 'published'
  if (becomingPublished) {
    throw new Error('Your role can edit drafts but cannot publish this collection.')
  }
  return data
}
