'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

// Click-to-load video facade (spec Cycle 5 pattern, used early on the homepage).
// Renders a static poster; on interaction it injects the provider iframe. No
// third-party video JS loads until the user clicks. Pair with a VideoObject
// JSON-LD emitted by the page for SEO.
export interface VideoSource {
  provider: 'sproutvideo' | 'youtube' | 'vimeo'
  /** Provider embed id (e.g. SproutVideo video id, YouTube id). */
  id: string
  title: string
  poster: { src: string; alt: string; width: number; height: number }
}

function embedUrl(v: VideoSource): string {
  switch (v.provider) {
    case 'sproutvideo':
      return `https://videos.sproutvideo.com/embed/${v.id}?autoPlay=true`
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`
    case 'vimeo':
      return `https://player.vimeo.com/video/${v.id}?autoplay=1`
  }
}

export function VideoFacade({ video, className }: { video: VideoSource; className?: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className={cn('relative overflow-hidden rounded-card border border-steel-300 bg-blue-deep', className)}
      style={{ aspectRatio: `${video.poster.width} / ${video.poster.height}` }}
    >
      {playing ? (
        <iframe
          src={embedUrl(video)}
          title={video.title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play video: ${video.title}`}
        >
          <Image
            src={video.poster.src}
            alt={video.poster.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-blue-deep/25" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill bg-white/95 text-navy shadow-lg transition-transform group-hover:scale-105">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
