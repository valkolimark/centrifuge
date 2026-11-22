import type { EmailLandingPicture } from './content'

// Serves the gated public files as-is (no next/image optimizer), so bytes stay identical.
export function LandingPicture({
  photo,
  className,
}: {
  photo: EmailLandingPicture
  className?: string
}) {
  const loading = photo.priority || photo.eager ? 'eager' : 'lazy'
  return (
    <picture>
      <source type="image/webp" srcSet={photo.webpSrcSet} sizes={photo.sizes} />
      <img
        className={className}
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        decoding="async"
        loading={loading}
        fetchPriority={photo.priority ? 'high' : 'auto'}
      />
    </picture>
  )
}
