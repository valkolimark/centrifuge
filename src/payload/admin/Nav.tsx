/* Custom Payload admin Nav (admin.components.Nav) — Mission Control sidebar. Server wrapper
   fetches live pill counts + the signed-in user, then renders the client sidebar. */
import { getPayloadClient } from '@/lib/payload'
import NavClient from './NavClient'

const ROLE_LABEL: Record<string, string> = {
  'super-admin': 'Site Administrator',
  editor: 'Editor',
  'content-manager': 'Content Manager',
  viewer: 'Viewer',
}

export default async function Nav(props: any) {
  let counts = { brands: 0, newLeads: 0 }
  try {
    const payload = await getPayloadClient()
    const [brands, leads] = await Promise.all([
      payload.count({ collection: 'oem-brands' }).catch(() => ({ totalDocs: 0 })),
      payload.count({ collection: 'leads', where: { pipelineStage: { equals: 'new' } } }).catch(() => ({ totalDocs: 0 })),
    ])
    counts = { brands: brands.totalDocs, newLeads: leads.totalDocs }
  } catch {
    /* DB unavailable — render with zeroed pills */
  }

  const u = props?.user
  const name = u?.name || (u?.email ? String(u.email).split('@')[0] : 'Centrifuge World')
  const role = ROLE_LABEL[u?.role as string] || 'Administrator'

  return <NavClient counts={counts} user={{ name, role }} />
}
