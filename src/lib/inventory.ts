import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
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

// Exported so scripts/export-inventory-json.ts produces the exact same shape the
// runtime uses — the snapshot can't drift from mapItem.
export function mapItem(d: RawDoc): InventoryItem {
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

// Snapshot fallback, mirroring the other content loaders (src/lib/content.ts). Without
// it a DB outage returned [], /inventory/[slug] called notFound(), and ISR cached that
// 404 for an hour — the same failure that took out the service pages on 2026-07-24.
// Regenerate with `pnpm tsx scripts/export-inventory-json.ts`.
function readInventorySnapshot(): InventoryItem[] {
  try {
    const p = join(process.cwd(), 'content-migration', 'inventory.json')
    if (!existsSync(p)) return []
    const docs = JSON.parse(readFileSync(p, 'utf8')) as InventoryItem[]
    return docs.filter((d) => d.availability !== 'sold')
  } catch {
    return []
  }
}

// Published, non-sold inventory for the public site. Payload first; snapshot if it's down.
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
    if (res.docs.length) return res.docs.map((d) => mapItem(d as unknown as RawDoc))
  } catch {
    /* DB unavailable → snapshot */
  }
  return readInventorySnapshot()
}

// Available machines for a given OEM brand (CYCLE-INV-1 Phase 2). `brand` is a free-text field,
// so match on a normalized comparison (case/space/hyphen/parenthetical-insensitive) — handles
// "Krauss-Maffei" ↔ "Krauss Maffei" etc. Returns the most-recently-listed first + the full count.
const normBrand = (s: string) => s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '')
export async function getInventoryByBrand(brandName: string, limit = 6): Promise<{ items: InventoryItem[]; total: number }> {
  const target = normBrand(brandName || '')
  if (!target) return { items: [], total: 0 }
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'inventory',
      where: { and: [{ _status: { equals: 'published' } }, { availability: { equals: 'available' } }] },
      sort: '-createdAt',
      depth: 1,
      limit: 300,
    })
    const matches = res.docs
      .map((d) => mapItem(d as unknown as RawDoc))
      .filter((i) => {
        const b = normBrand(i.brand || '')
        if (!b) return false
        return b === target || (target.length >= 5 && (b.includes(target) || target.includes(b)))
      })
    return { items: matches.slice(0, limit), total: matches.length }
  } catch {
    return { items: [], total: 0 }
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
    // Only fall through to the snapshot when the DB is unreachable — a genuine
    // "no such machine" must stay a 404, not resurrect a deleted listing.
    if (doc) return mapItem(doc as unknown as RawDoc)
    return null
  } catch {
    return readInventorySnapshot().find((i) => i.slug === slug) ?? null
  }
}
