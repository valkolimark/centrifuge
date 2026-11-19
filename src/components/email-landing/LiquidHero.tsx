'use client'

import Image from 'next/image'
import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from './useReducedMotion'

// DRAFT. Hero with the liquid photo drop (Creative rev 2, section 13). No animation dependency:
// SMIL blob morph started from JS only when motion is allowed, CSS entrance (<=600ms), call ring x2.
// Reduced motion: nothing starts, shapes stay still. Blob path data: copy from the staged page's <svg> (seeded, per page).
export function LiquidHero({ title, lede, photos, actions }: {
  title: string; lede: string; photos: { src: string; alt: string; caption: string; width: number; height: number }[]; actions: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || !ref.current) return
    ref.current.classList.add('motion-ok')
    ref.current.querySelectorAll<SVGAnimateElement>('animate[data-morph]').forEach((a) => { try { a.beginElement() } catch {} })
  }, [reduced])
  return (
    <div ref={ref} className="el-hero relative overflow-hidden bg-[#eef7fa]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:pt-16">
        <div>
          <h1 className="text-balance">{title}</h1>
          <span className="el-h1-rule" aria-hidden="true" />
          <p className="el-lede">{lede}</p>
          <div className="flex flex-wrap gap-3">{actions}</div>
        </div>
        <div className="el-photo relative">
          {/* decorative svg (brand liquid + plum group drop + white rim) goes here, aria-hidden */}
          {photos.map((p, i) => (
            <Image key={p.src} src={p.src} alt={p.alt} width={p.width} height={p.height} priority={i === 0}
              fetchPriority={i === 0 ? 'high' : undefined} sizes="(max-width:900px) 92vw, 560px" className="el-photo-img h-auto w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
