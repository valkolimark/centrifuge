'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { trackCtaClick } from '@/lib/analytics'
import { FLYAPART_DRACO_PATH, FLYAPART_MODELS, type FlyApartModel, type FlyApartModelKey } from '@/lib/flyapart-models'
import type { FlyApartViewerHandle } from '@/lib/flyapart-viewer'

// Click-to-load interactive 3D fly-apart (same facade pattern as VideoFacade / MapFacade).
// The page ships only a poster image; three.js, the Draco decoder, and the model are
// fetched after the visitor clicks "Explore in 3D", so the block costs nothing against
// the Lighthouse budget. Models are registered in lib/flyapart-models.ts.
const IDLE_HINT = 'Drag to rotate. Click or tap a part to identify it, then use + to zoom in on it.'
const ZOOM_STEP = 1.5
const ZOOM_MIN = 1
const ZOOM_MAX = 6

type Status = 'idle' | 'loading' | 'ready' | 'error'

const ASPECT: Record<FlyApartModel['layout'], string> = {
  wide: 'aspect-[4/5] sm:aspect-[16/9]',
  tall: 'aspect-[3/4] sm:aspect-[4/5]',
}
const POSTER_SIZE: Record<FlyApartModel['layout'], string> = {
  wide: 'h-auto w-full max-w-[880px]',
  tall: 'h-auto max-h-[68%] w-auto max-w-full',
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center text-white transition-colors duration-150 hover:bg-white/15 focus-visible:outline-white disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}

export function FlyApartExplorer({
  model: modelKey,
  partsList = true,
  className,
}: {
  model: FlyApartModelKey
  /** Render the collapsible text list of parts under the viewer. */
  partsList?: boolean
  className?: string
}) {
  const model: FlyApartModel = FLYAPART_MODELS[modelKey]
  const location = `${modelKey}_3d_explorer`
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [playingTo, setPlayingTo] = useState<0 | 1 | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewer = useRef<FlyApartViewerHandle | null>(null)
  const tracked = useRef({ fly: false, zoom: false })

  useEffect(
    () => () => {
      viewer.current?.dispose()
      viewer.current = null
    },
    [],
  )

  async function start() {
    if (status === 'loading' || status === 'ready' || !canvasRef.current) return
    setStatus('loading')
    trackCtaClick('Explore in 3D', location)
    try {
      const { createFlyApartViewer } = await import('@/lib/flyapart-viewer')
      viewer.current = createFlyApartViewer({
        canvas: canvasRef.current,
        modelUrl: model.modelUrl,
        dracoPath: FLYAPART_DRACO_PATH,
        partKeys: model.parts.map((p) => p.key),
        accent: getComputedStyle(document.documentElement).getPropertyValue('--color-blue-bright').trim() || '#00b8ff',
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        spin: model.spin,
        floorY: model.floorY,
        view: model.view,
        onReady: () => setStatus('ready'),
        onError: () => setStatus('error'),
        onProgress: (p, to) => {
          setProgress(p)
          setPlayingTo(to)
        },
        onFocus: setFocusKey,
        onZoom: setZoom,
      })
    } catch {
      // WebGL unavailable or the chunk failed to load — keep the poster and say so.
      setStatus('error')
    }
  }

  const apart = (playingTo ?? (progress > 0.5 ? 1 : 0)) === 1
  function toggle() {
    if (!tracked.current.fly) {
      tracked.current.fly = true
      trackCtaClick('3D — Fly apart', location)
    }
    viewer.current?.play(apart ? 0 : 1)
  }
  function zoomBy(factor: number) {
    if (!tracked.current.zoom) {
      tracked.current.zoom = true
      trackCtaClick('3D — Zoom', location)
    }
    viewer.current?.zoomBy(factor)
  }

  const info = focusKey ? model.parts.find((p) => p.key === focusKey) : undefined
  const ready = status === 'ready'

  return (
    <div className={className}>
      <div
        className={cn('relative overflow-hidden rounded-card border border-white/15 bg-blue-deep', ASPECT[model.layout])}
        style={{
          background:
            'radial-gradient(85% 75% at 50% 38%, color-mix(in srgb, var(--color-navy) 82%, var(--color-blue-mid)) 0%, var(--color-blue-deep) 72%)',
        }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none transition-opacity duration-200 active:cursor-grabbing',
            ready ? 'opacity-100' : 'opacity-0',
          )}
          role="img"
          aria-label={model.canvasLabel}
        />

        {!ready ? (
          <button
            type="button"
            onClick={start}
            disabled={status === 'loading'}
            className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-6 p-6 focus-visible:outline-white disabled:cursor-progress"
            aria-label={`Explore in 3D: ${model.title}`}
          >
            <Image
              src={model.poster.src}
              alt={model.poster.alt}
              width={model.poster.width}
              height={model.poster.height}
              sizes="(max-width: 1024px) 92vw, 900px"
              className={cn(
                'drop-shadow-[0_18px_30px_rgb(0_0_0/0.45)] transition-transform duration-200 ease-out group-hover:scale-[1.02]',
                POSTER_SIZE[model.layout],
              )}
            />
            <span className="inline-flex min-h-[48px] items-center gap-2 rounded-button bg-white px-6 py-3 text-base font-semibold text-navy shadow-sm transition-colors duration-150 group-hover:bg-steel-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
                <path d="m3 7 9 5 9-5M12 12v10" />
              </svg>
              {status === 'loading' ? 'Loading 3D model…' : status === 'error' ? 'Try again' : 'Explore in 3D'}
            </span>
            {status === 'error' ? (
              <span className="text-sm text-white/85" role="status">
                The 3D model could not be loaded on this device.
              </span>
            ) : null}
          </button>
        ) : (
          <>
            <div
              className={cn(
                'pointer-events-none absolute left-3 top-3 max-w-[min(22rem,calc(100%-5rem))] rounded-card bg-blue-deep/80 px-4 py-3 text-white ring-1 ring-white/15 backdrop-blur-sm transition-opacity duration-150 sm:left-4 sm:top-4',
                info ? 'opacity-100' : 'opacity-80',
              )}
              aria-live="polite"
            >
              <p className="text-sm font-semibold leading-snug">{info ? info.name : model.title}</p>
              <p className="mt-0.5 text-[0.8125rem] leading-snug text-white/85">{info ? info.description : IDLE_HINT}</p>
            </div>

            <div
              role="group"
              aria-label="Zoom"
              className="absolute right-3 top-3 flex flex-col divide-y divide-white/15 overflow-hidden rounded-card bg-blue-deep/80 ring-1 ring-white/15 backdrop-blur-sm sm:right-4 sm:top-4"
            >
              <IconButton label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX}>
                <path d="M12 5v14M5 12h14" />
              </IconButton>
              <IconButton label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={zoom <= ZOOM_MIN}>
                <path d="M5 12h14" />
              </IconButton>
              <IconButton label="Reset view" onClick={() => viewer.current?.resetView()} disabled={zoom <= ZOOM_MIN}>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </IconButton>
            </div>

            <div className="absolute bottom-3 left-1/2 flex w-[min(30rem,calc(100%-1.5rem))] -translate-x-1/2 items-center gap-4 rounded-pill bg-blue-deep/80 py-2 pl-2 pr-5 ring-1 ring-white/15 backdrop-blur-sm sm:bottom-4">
              <button
                type="button"
                onClick={toggle}
                className="min-h-[44px] min-w-[7.5rem] rounded-pill bg-blue-bright px-5 text-[0.95rem] font-semibold text-blue-deep transition-colors duration-150 hover:bg-white focus-visible:outline-white"
              >
                {apart ? 'Reassemble' : 'Fly apart'}
              </button>
              <label className="flex min-w-0 flex-1 items-center">
                <span className="sr-only">Fly-apart amount</span>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={Math.round(progress * 1000)}
                  onChange={(e) => viewer.current?.setProgress(Number(e.target.value) / 1000)}
                  className="h-11 w-full cursor-pointer accent-[var(--color-blue-bright)] focus-visible:outline-white"
                />
              </label>
            </div>
          </>
        )}
      </div>

      <p className="mt-3 text-sm text-white/75">{model.caption}</p>

      {partsList ? (
        <details className="mt-4 rounded-card bg-white/5 ring-1 ring-white/10">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white focus-visible:outline-white">
            Parts shown in this model ({model.parts.length})
          </summary>
          <dl className="grid gap-x-6 gap-y-3 px-4 pb-4 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {model.parts.map((p) => (
              <div key={p.key}>
                <dt className="text-sm font-semibold text-white">{p.name}</dt>
                <dd className="text-sm text-white/80">{p.description}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </div>
  )
}
