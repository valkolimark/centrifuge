'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { trackCtaClick } from '@/lib/analytics'
import {
  FLYAPART_DRACO_PATH,
  FLYAPART_MODELS,
  variantTag,
  type FlyApartModel,
  type FlyApartModelKey,
} from '@/lib/flyapart-models'
import type { FlyApartViewerHandle } from '@/lib/flyapart-viewer'

// Click-to-load interactive 3D fly-apart (same facade pattern as VideoFacade / MapFacade).
// The page ships only a poster image; three.js, the Draco decoder, and the model are
// fetched after the visitor clicks "Explore in 3D", so the block costs nothing against
// the Lighthouse budget. Models are registered in lib/flyapart-models.ts.
//
// Layout: part info sits in a strip ABOVE the canvas and every control in a strip BELOW
// it. Nothing is overlaid on the canvas, so the UI can never cover the model. Both strips
// render from the start (controls disabled until the model loads) and the info strip has
// a fixed height, so loading the model or hovering a part never shifts the page.
const IDLE_HINT = 'Drag to rotate. Click a part to identify it and + to zoom in on it. Double-click a part to view it on its own.'
const POSTER_HINT = 'Select Explore in 3D to load the interactive model.'
const ZOOM_STEP = 1.5
// Mirrors ZOOM_MIN / ZOOM_MAX in lib/flyapart-viewer.ts, which must not be imported statically.
const ZOOM_MIN = 1
const ZOOM_MAX = 6

type Status = 'idle' | 'loading' | 'ready' | 'error'

const ASPECT: Record<FlyApartModel['layout'], string> = {
  wide: 'aspect-[4/3] sm:aspect-[16/9]',
  tall: 'aspect-[4/5] lg:aspect-[3/4]',
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
  partsListClassName,
  className,
}: {
  model: FlyApartModelKey
  /** Extra classes for the collapsible parts list under the viewer (e.g. hide it where the page shows its own). */
  partsListClassName?: string
  className?: string
}) {
  const model: FlyApartModel = FLYAPART_MODELS[modelKey]
  const location = `${modelKey}_3d_explorer`
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [playingTo, setPlayingTo] = useState<0 | 1 | null>(null)
  const [focus, setFocus] = useState<{ key: string; unit: string | null } | null>(null)
  const [isolated, setIsolated] = useState<{ key: string; unit: string | null } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [variant, setVariant] = useState(model.variants?.options[0].key)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewer = useRef<FlyApartViewerHandle | null>(null)
  const tracked = useRef({ fly: false, zoom: false, isolate: false })

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
        parts: model.parts,
        variant,
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
        onFocus: (key, unit) => setFocus(key ? { key, unit } : null),
        onIsolate: (key, unit) => {
          setIsolated(key ? { key, unit } : null)
          if (key && !tracked.current.isolate) {
            tracked.current.isolate = true
            trackCtaClick('3D — Isolate part', location)
          }
        },
        onZoom: setZoom,
      })
    } catch {
      // WebGL unavailable or the chunk failed to load — keep the poster and say so.
      setStatus('error')
    }
  }

  const ready = status === 'ready'
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
  function chooseVariant(key: string, label: string) {
    if (key === variant) return
    setVariant(key)
    viewer.current?.setVariant(key)
    trackCtaClick(`3D — ${model.variants?.label}: ${label}`, location)
  }

  // The info strip describes the part under the pointer, else the isolated part, else the model.
  const shown = focus ?? isolated
  const info = shown ? model.parts.find((p) => p.key === shown.key) : undefined
  const infoTag = info ? variantTag(model, info) : undefined
  const infoUnit = info && shown?.unit ? `${info.unitName ?? 'Piece'} ${shown.unit}` : undefined

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-card border border-white/15 bg-blue-deep">
        {/* Info strip: fixed height so part names of different lengths never move the canvas. */}
        <div className="h-[6.25rem] overflow-hidden border-b border-white/10 px-4 py-3 text-white sm:h-[5.25rem]" aria-live="polite">
          <p className="text-sm font-semibold leading-snug">
            {info ? info.name : model.title}
            {infoUnit ? <span className="ml-2 font-normal text-white/85">{infoUnit}</span> : null}
            {infoTag ? (
              <span className="ml-2 rounded-pill bg-white/10 px-2 py-0.5 text-xs font-medium text-white/85">{infoTag}</span>
            ) : null}
          </p>
          <p className="mt-1 text-[0.8125rem] leading-snug text-white/85">
            {info ? info.description : ready ? IDLE_HINT : POSTER_HINT}
          </p>
        </div>

        <div
          className={cn('relative', ASPECT[model.layout])}
          style={{
            background:
              'radial-gradient(85% 75% at 50% 42%, color-mix(in srgb, var(--color-navy) 82%, var(--color-blue-mid)) 0%, var(--color-blue-deep) 72%)',
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
          ) : null}
        </div>

        {/* Control strip: everything the visitor operates, below the canvas. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 px-3 py-3">
          <div className="flex min-w-[15rem] flex-1 items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              disabled={!ready}
              className="min-h-[44px] min-w-[7.5rem] rounded-pill bg-blue-bright px-5 text-[0.95rem] font-semibold text-blue-deep transition-colors duration-150 hover:bg-white focus-visible:outline-white disabled:opacity-40 disabled:hover:bg-blue-bright"
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
                disabled={!ready}
                onChange={(e) => viewer.current?.setProgress(Number(e.target.value) / 1000)}
                className="h-11 w-full cursor-pointer accent-[var(--color-blue-bright)] focus-visible:outline-white disabled:cursor-default disabled:opacity-40"
              />
            </label>
          </div>

          {model.variants ? (
            <fieldset className="flex items-center gap-2" disabled={!ready}>
              <legend className="sr-only">{model.variants.label}</legend>
              <span aria-hidden="true" className="text-sm font-medium text-white/85">
                {model.variants.label}
              </span>
              <div className="flex overflow-hidden rounded-pill ring-1 ring-white/25">
                {model.variants.options.map((o) => (
                  <label
                    key={o.key}
                    className={cn(
                      'grid min-h-[44px] cursor-pointer place-items-center px-4 text-sm font-semibold transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-white',
                      variant === o.key ? 'bg-white text-navy' : 'text-white hover:bg-white/15',
                      !ready && 'cursor-default opacity-40',
                    )}
                  >
                    <input
                      type="radio"
                      name={`${modelKey}-variant`}
                      value={o.key}
                      checked={variant === o.key}
                      onChange={() => chooseVariant(o.key, o.label)}
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div role="group" aria-label="Zoom" className="ml-auto flex divide-x divide-white/15 overflow-hidden rounded-card ring-1 ring-white/25">
            <IconButton label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!ready || zoom <= ZOOM_MIN}>
              <path d="M5 12h14" />
            </IconButton>
            <IconButton label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={!ready || zoom >= ZOOM_MAX}>
              <path d="M12 5v14M5 12h14" />
            </IconButton>
            <IconButton label="Reset view" onClick={() => viewer.current?.resetView()} disabled={!ready || zoom <= ZOOM_MIN}>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </IconButton>
          </div>

          {/* Only while a part is isolated. It sits last in the strip, so the controls above never move. */}
          {isolated ? (
            <button
              type="button"
              onClick={() => viewer.current?.exitIsolation()}
              className="min-h-[44px] w-full rounded-button bg-white px-5 text-[0.95rem] font-semibold text-navy transition-colors duration-150 hover:bg-steel-100 focus-visible:outline-white"
            >
              <span aria-hidden="true">← </span>Back to machine
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm text-white/75">{model.caption}</p>

      <details className={cn('mt-4 rounded-card bg-white/5 ring-1 ring-white/10', partsListClassName)}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white focus-visible:outline-white">
          Parts shown in this model ({model.parts.length})
        </summary>
        <dl className="grid gap-x-6 gap-y-3 px-4 pb-4 pt-1 sm:grid-cols-2 lg:grid-cols-3">
          {model.parts.map((p) => {
            const tag = variantTag(model, p)
            return (
              <div key={p.key}>
                <dt className="text-sm font-semibold text-white">
                  {p.name}
                  {tag ? <span className="ml-2 text-xs font-medium text-white/70">({tag})</span> : null}
                </dt>
                <dd className="text-sm text-white/80">{p.description}</dd>
              </div>
            )
          })}
        </dl>
      </details>
    </div>
  )
}
