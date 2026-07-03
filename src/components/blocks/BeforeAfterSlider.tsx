'use client'

import { useId, useState } from 'react'
import Image from 'next/image'

// BeforeAfterSlider: pointer + keyboard operable (arrow keys move the divider).
// Uses a native range input as the control for full keyboard/AT support, styled
// as a handle over the clipped "after" image.
export function BeforeAfterSlider({
  before,
  after,
  width = 1200,
  height = 800,
}: {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
  width?: number
  height?: number
}) {
  const [pos, setPos] = useState(50)
  const id = useId()

  return (
    <figure className="overflow-hidden rounded-card border border-steel-300 bg-steel-100">
      <div className="relative select-none" style={{ aspectRatio: `${width} / ${height}` }}>
        <Image src={before.src} alt={before.alt} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ maxWidth: 'none', width: `${(100 / pos) * 100}%` }}
          />
        </div>

        {/* divider */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${pos}%` }}
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill bg-white text-navy shadow-md">
            ⇄
          </span>
        </div>

        <label htmlFor={id} className="sr-only">
          Reveal before/after — drag or use arrow keys
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${pos}% after`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="flex justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-steel-500">
        <span>Before</span>
        <span>After</span>
      </figcaption>
    </figure>
  )
}
