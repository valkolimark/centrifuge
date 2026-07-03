'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface GalleryImage {
  url: string
  alt: string
  width?: number
  height?: number
}

// Amazon-style product gallery: a vertical thumbnail rail beside a large main
// image (thumbnails move below on mobile). Click/hover a thumb to swap the main.
export function InventoryGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0)
  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card border border-steel-300 bg-steel-100 text-steel-500">
        Photos available on request
      </div>
    )
  }
  const main = images[Math.min(active, images.length - 1)]

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {images.length > 1 ? (
        <ol className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white transition ${
                  i === active ? 'border-blue ring-1 ring-blue' : 'border-steel-300 hover:border-blue'
                }`}
              >
                <Image src={img.url} alt="" fill sizes="56px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="order-1 flex-1 sm:order-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-card border border-steel-300 bg-white">
          <Image
            key={main.url}
            src={main.url}
            alt={main.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-contain p-4"
          />
        </div>
      </div>
    </div>
  )
}
