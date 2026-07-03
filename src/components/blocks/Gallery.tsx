import Image from 'next/image'

// Gallery: responsive image grid. Every image requires descriptive alt (DoD).
// Images below the fold lazy-load (next/image default).
export interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((img, i) => (
        <li key={img.src} className="reveal overflow-hidden rounded-card border border-steel-300 bg-steel-100">
          <figure>
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 640px) 50vw, 33vw"
              quality={60}
              loading={i < 3 ? 'eager' : 'lazy'}
              className="aspect-[4/3] w-full object-cover"
            />
            {img.caption ? (
              <figcaption className="px-3 py-2 text-xs text-steel-500">{img.caption}</figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  )
}
