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

// Default brand hero when the brand's own harvested images are unavailable.
export const BRAND_HERO_DEFAULT = img(
  '2020/02/07193227/large-decanter.jpg',
  'Industrial centrifuge repair at Centrifuge World',
)
