// Hero images (S3) and YouTube videos mapped to service and brand pages. All S3
// URLs verified reachable; video ids are real @centrifugeworld channel videos.
const S3 = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads'

export interface HeroImage {
  src: string
  alt: string
  width: number
  height: number
}

function img(path: string, alt: string): HeroImage {
  return { src: `${S3}/${path}`, alt, width: 1600, height: 900 }
}

export const SERVICE_HERO: Record<string, HeroImage> = {
  'centrifuge-repair': img('2021/11/07192816/decanter-centrifuge-repair-hero-scaled.jpg', 'Decanter centrifuge on the Centrifuge World shop floor'),
  'centrifuge-rebuilds': img('2021/12/07192723/BIRD-HB-2500-RA-Rebuild-scaled.jpg', 'Bird HB-2500 centrifuge rebuild in the shop'),
  'decanter-centrifuge-repair': img('2020/02/07193227/large-decanter.jpg', 'Decanter centrifuge bowl and rotor close-up'),
  'basket-centrifuge-repair': img('2019/02/07193216/IMG_1548.jpeg', 'Basket centrifuge in the Centrifuge World shop'),
  'disc-stack-centrifuge-repair': img('2019/10/07193552/centrifuge-repair-1024x771-2.jpg', 'Disc-stack centrifuge repair in progress'),
  'pusher-peeler-centrifuge-repair': img('2021/12/07192739/IMG_8060-1.jpg', 'Centrifuge repair on the shop floor'),
  'field-service': img('2019/02/07193219/IMG_3518-rotated.jpeg', 'Centrifuge field service work'),
  'preventive-maintenance': img('2022/01/07192617/scroll-refurbished.jpg', 'Refurbished decanter scroll conveyor'),
  'centrifuge-inspections': img('2022/01/07192646/bearings-decanters-1-e1641483593312.jpg', 'Decanter centrifuge bearings during inspection'),
  'balancing-testing': img('2022/01/07192645/testing-decanter-centrifuge.jpg', 'Test-running a decanter centrifuge'),
  'parts-fabrication': img('2022/01/07192644/centrifuge-parts.jpg', 'Fabricated centrifuge parts'),
  'gearbox-repair': img('2021/12/07192720/Custom-decanter-1.jpg', 'Custom decanter centrifuge and gearbox work'),
  'centrifuge-rentals': img('2020/06/07193112/cw-quarantine.jpg', 'Industrial centrifuges in the Centrifuge World shop'),
}

export const SERVICE_VIDEO: Record<string, string> = {
  'centrifuge-repair': 'QWFCZQzj2CQ',
  'decanter-centrifuge-repair': 'sysTqpEXoWc',
  'basket-centrifuge-repair': '_0sHuLimB_c',
  'disc-stack-centrifuge-repair': '35uaycWvbi8',
  'balancing-testing': '35uaycWvbi8',
  'centrifuge-rebuilds': 'khdHSyO8AxU',
}

export const BRAND_VIDEO: Record<string, string> = {
  sharples: 'yybOQ92oiAk',
  'alfa-laval': 'FNLfQKJwrpY',
  westfalia: 'OfoOIcuBSK4',
  andritz: 'cMYpzI02_F0',
  centrisys: 'i1FLleg5gJY',
}

// Verified shop-image pool for brand heroes when a brand had no harvested image.
// (Images come from the client's public S3 bucket used by centrifuge.com.)
export const BRAND_HERO_POOL: HeroImage[] = [
  img('2021/11/07192816/decanter-centrifuge-repair-hero-scaled.jpg', 'Industrial centrifuge in the Centrifuge World shop'),
  img('2020/02/07193227/large-decanter.jpg', 'Decanter centrifuge bowl and rotor'),
  img('2019/10/07193552/centrifuge-repair-1024x771-2.jpg', 'Centrifuge repair in progress'),
  img('2021/12/07192723/BIRD-HB-2500-RA-Rebuild-scaled.jpg', 'Centrifuge rebuild in the shop'),
  img('2022/01/07192645/testing-decanter-centrifuge.jpg', 'Test-running a decanter centrifuge'),
  img('2022/01/07192617/scroll-refurbished.jpg', 'Refurbished centrifuge scroll conveyor'),
  img('2022/01/07192643/centrifuge-welding-e1641483520230.jpg', 'Centrifuge component fabrication'),
  img('2020/06/07193112/cw-quarantine.jpg', 'Industrial centrifuges in the shop'),
  img('2019/02/07193216/IMG_1548.jpeg', 'Centrifuge on the shop floor'),
  img('2019/02/07193219/IMG_3518-rotated.jpeg', 'Centrifuge repair work'),
  img('2021/12/07192720/Custom-decanter-1.jpg', 'Custom decanter centrifuge work'),
  img('2021/12/07192739/IMG_8060-1.jpg', 'Centrifuge repair on the shop floor'),
  img('2020/01/07193356/bird-centrifuge.jpg', 'Bird decanter centrifuge'),
  img('2022/01/07192646/bearings-decanters-1-e1641483593312.jpg', 'Decanter centrifuge bearings'),
]

// Deterministic fallback hero for a brand (stable + varied across brands).
export function fallbackBrandHero(slug: string): HeroImage {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return BRAND_HERO_POOL[h % BRAND_HERO_POOL.length]
}
