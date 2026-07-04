'use client'

// List-view cell for Inventory: shows the product's first photo as a thumbnail
// next to the title (UI-1). Reads the row's images array (imageUrl or uploaded url).
import Link from 'next/link'
import { useMemo } from 'react'

type Img = { imageUrl?: string; image?: { url?: string; sizes?: { thumbnail?: { url?: string } } } | null }

export default function InventoryThumbCell({ cellData, rowData }: { cellData?: string; rowData?: { id?: string | number; images?: Img[] } }) {
  const url = useMemo(() => {
    const first = rowData?.images?.[0]
    if (!first) return null
    return first.image?.sizes?.thumbnail?.url || first.image?.url || first.imageUrl || null
  }, [rowData])

  const title = cellData || 'Untitled'
  const href = rowData?.id != null ? `/admin/collections/inventory/${rowData.id}` : undefined

  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 40, height: 40, flex: '0 0 40px', borderRadius: 7, overflow: 'hidden', background: '#0a1226', border: '1px solid #1b2c55', display: 'grid', placeItems: 'center' }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 9, color: '#5a6e96' }}>—</span>
        )}
      </span>
      <span style={{ fontWeight: 500 }}>{title}</span>
    </span>
  )

  return href ? (
    <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{inner}</Link>
  ) : (
    inner
  )
}
