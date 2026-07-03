import { getPayloadClient } from './payload'

export interface InventorySpec {
  label: string
  value: string
}
export interface InventoryImage {
  url: string
  alt: string
  width?: number
  height?: number
}
export interface InventoryItem {
  id: string
  slug: string
  title: string
  brand?: string
  machineType: string
  model?: string
  condition?: string
  availability: string
  price?: number
  priceOnRequest?: boolean
  shortDescription?: string
  description?: string
  specs: InventorySpec[]
  images: InventoryImage[]
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
}

export const MACHINE_TYPE_LABELS: Record<string, string> = {
  decanter: 'Decanter',
  basket: 'Basket',
  'disc-stack': 'Disc-stack separator',
  pusher: 'Pusher',
  peeler: 'Peeler',
  separator: 'Separator',
  other: 'Centrifuge',
}
export const CONDITION_LABELS: Record<string, string> = {
  reconditioned: 'Reconditioned',
  rebuilt: 'Rebuilt',
  used: 'Used — as-is',
  'for-parts': 'For parts',
}

type RawImage = { image?: { url?: string; alt?: string; width?: number; height?: number } | null; imageUrl?: string | null; alt?: string | null }
type RawDoc = Record<string, unknown>

function mapItem(d: RawDoc): InventoryItem {
  const title = (d.title as string) || 'Used centrifuge'
  const images: InventoryImage[] = ((d.images as RawImage[] | undefined) ?? [])
    .map((row): InventoryImage | null => {
      const url = row?.image?.url || row?.imageUrl || undefined
      if (!url) return null
      return { url, alt: row?.image?.alt || row?.alt || title, width: row?.image?.width, height: row?.image?.height }
    })
    .filter((im): im is InventoryImage => im !== null)
  const seo = (d.seo as { title?: string; description?: string } | undefined) ?? {}
  return {
    id: String(d.id),
    slug: d.slug as string,
    title: d.title as string,
    brand: (d.brand as string) || undefined,
    machineType: (d.machineType as string) || 'other',
    model: (d.model as string) || undefined,
    condition: (d.condition as string) || undefined,
    availability: (d.availability as string) || 'available',
    price: typeof d.price === 'number' ? d.price : undefined,
    priceOnRequest: !!d.priceOnRequest,
    shortDescription: (d.shortDescription as string) || undefined,
    description: (d.description as string) || undefined,
    specs: ((d.specs as InventorySpec[] | undefined) ?? []).filter((s) => s.label && s.value),
    images,
    featured: !!d.featured,
    seoTitle: seo.title,
    seoDescription: seo.description,
  }
}

// Published, non-sold inventory for the public site (empty array if DB is down).
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'inventory',
      where: { and: [{ _status: { equals: 'published' } }, { availability: { not_equals: 'sold' } }] },
      sort: ['-featured', 'title'],
      depth: 1,
      limit: 300,
    })
    return res.docs.map((d) => mapItem(d as unknown as RawDoc))
  } catch {
    return []
  }
}

export async function getInventoryItem(slug: string): Promise<InventoryItem | null> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'inventory',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      depth: 1,
      limit: 1,
    })
    const doc = res.docs[0]
    return doc ? mapItem(doc as unknown as RawDoc) : null
  } catch {
    return null
  }
}
