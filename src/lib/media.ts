// Curated real shop/rebuild photography, served directly from the client's public
// S3 bucket (WP Offload Media) and optimized on the fly by next/image. Serving from
// the bucket keeps these large assets out of the repo and leverages existing infra.
// The full asset migration (all pages, model-numbered alts) lands in Cycle 2/3 via
// the Payload media library.
export const S3_UPLOADS = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads'
export const S3_HOST = 'centrifuge-im.s3.amazonaws.com'

export interface Photo {
  src: string
  alt: string
  width: number
  height: number
}

export const photos = {
  shopHero: {
    src: `${S3_UPLOADS}/2021/11/07192816/decanter-centrifuge-repair-hero-scaled.jpg`,
    alt: 'Decanter centrifuge rebuild on the Centrifuge World shop floor',
    width: 1600,
    height: 900,
  } as Photo,
  before: {
    src: `${S3_UPLOADS}/2021/12/07192727/before.jpg`,
    alt: 'Worn decanter centrifuge before rebuild, staged in the yard',
    width: 1200,
    height: 800,
  } as Photo,
  after: {
    src: `${S3_UPLOADS}/2021/12/07192728/after.jpg`,
    alt: 'The same decanter centrifuge rebuilt and polished in the shop',
    width: 1200,
    height: 800,
  } as Photo,
  // Homepage feature video (YouTube — provided by the client).
  homeVideo: {
    provider: 'youtube' as const,
    id: 'QWFCZQzj2CQ',
    title: 'Centrifuge World — industrial centrifuge repair & rebuilds',
    poster: {
      // The video's own YouTube thumbnail (16:9 maxres).
      src: 'https://i.ytimg.com/vi/QWFCZQzj2CQ/maxresdefault.jpg',
      alt: 'Centrifuge World — centrifuge repair fly-through',
      width: 1280,
      height: 720,
    },
  },
  gallery: [
    {
      src: `${S3_UPLOADS}/2022/01/07192617/scroll-refurbished.jpg`,
      alt: 'Refurbished decanter scroll conveyor',
      width: 800,
      height: 600,
    },
    {
      src: `${S3_UPLOADS}/2022/01/07192643/centrifuge-welding-e1641483520230.jpg`,
      alt: 'Hard-surfacing and welding a centrifuge component',
      width: 800,
      height: 600,
    },
    {
      src: `${S3_UPLOADS}/2022/01/07192645/testing-decanter-centrifuge.jpg`,
      alt: 'Test-running a decanter centrifuge before return',
      width: 800,
      height: 600,
    },
  ] as Photo[],
}
