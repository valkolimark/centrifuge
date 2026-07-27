import type { CollectionConfig } from 'payload'
import { contentManagerUp, editorUp, publicRead } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { preventNonEditorPublish } from '../hooks/publishGuard'

// Draft/publish + autosave + scheduled publish, shared by all content collections.
// autosave interval is 2.5s rather than Payload's 800ms default: at 800ms an open
// editor writes a draft version ~75x a minute, which is pure database load on a
// metered Postgres. 2.5s still keeps unsaved work to a couple of keystrokes.
export const contentVersions: CollectionConfig['versions'] = {
  drafts: {
    autosave: { interval: 2500 },
    schedulePublish: true,
  },
  maxPerDoc: 25,
}

// Access preset: public reads published; content-managers create/edit drafts;
// editors+ delete. Publishing is additionally gated per-collection by publishGuard.
export const contentAccess: CollectionConfig['access'] = {
  read: publicRead,
  create: contentManagerUp,
  update: contentManagerUp,
  delete: editorUp,
}

// Hooks for collections a content-manager may edit but NOT publish.
export const guardedHooks = {
  beforeChange: [preventNonEditorPublish],
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
}

// Hooks for collections a content-manager MAY publish (posts/case-studies/faqs).
export const publishableHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
}
