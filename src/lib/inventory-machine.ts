import type { InventoryItem } from './inventory'
import { brands, SITE_URL } from './site'

// CYCLE-INV-1 Phase 3: pure (client-safe) helpers for pre-populating the quote form from an
// inventory machine. Kept out of ./inventory (which pulls the Payload client) so the client
// LeadForm can import the MachineSnapshot type without dragging server code into its bundle.

export interface MachineSnapshot {
  inventoryId: string // INV-#### (derived from the doc id)
  slug: string
  url: string
  title: string
  brand?: string // brand slug (matches BRAND_OPTIONS value)
  brandName?: string
  model?: string
  condition?: string
  type?: string // machineType
  thumbnailUrl?: string
  specsSnapshot: { label: string; value: string }[]
}

// inventory machineType → the form's equipment option value (separator has no equipment option).
const EQUIP_FROM_TYPE: Record<string, string> = {
  decanter: 'decanter', basket: 'basket', 'disc-stack': 'disc-stack',
  pusher: 'pusher', peeler: 'peeler', separator: 'disc-stack', other: 'other',
}

export const inventoryId = (id: string) => `INV-${String(id).replace(/\D/g, '').padStart(4, '0')}`

// Build the snapshot (stored on the lead) + the field prefills (equipment/brand/model/message).
export function machineContext(item: InventoryItem): { snapshot: MachineSnapshot; prefill: Record<string, string> } {
  const invId = inventoryId(item.id)
  const brandSlug = item.brand ? brands.find((b) => b.name.toLowerCase() === item.brand!.toLowerCase())?.slug : undefined
  const snapshot: MachineSnapshot = {
    inventoryId: invId,
    slug: item.slug,
    url: `${SITE_URL}/inventory/${item.slug}/`,
    title: item.title,
    brand: brandSlug,
    brandName: item.brand,
    model: item.model,
    condition: item.condition,
    type: item.machineType,
    thumbnailUrl: item.images[0]?.url,
    specsSnapshot: item.specs.slice(0, 4),
  }
  const prefill: Record<string, string> = {
    equipment: EQUIP_FROM_TYPE[item.machineType] || 'other',
    ...(brandSlug ? { brand: brandSlug } : {}),
    ...(item.model ? { model: item.model } : {}),
    message: `I'd like a quote on the ${item.title} (${invId}) listed on your site.`,
  }
  return { snapshot, prefill }
}
