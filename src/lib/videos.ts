// Centrifuge World YouTube channel (@centrifugeworld) videos, pulled from the
// channel RSS feed. Used on /resources/videos/ (facade grid) and the homepage
// feature video. Thumbnails come from YouTube (i.ytimg.com); the player loads
// only on click (VideoFacade).
import type { VideoSource } from '@/components/blocks/VideoFacade'

export interface ChannelVideo {
  id: string
  title: string
}

export const CHANNEL_URL = 'https://www.youtube.com/@centrifugeworld'

export const CHANNEL_VIDEOS: ChannelVideo[] = [
  { id: 'QWFCZQzj2CQ', title: 'Centrifuge Repair — Fly Through' },
  { id: 'khdHSyO8AxU', title: 'Centrifuge.com Short Shop Tour' },
  { id: '35uaycWvbi8', title: 'Westfalia MSE-500 Disc Stack Dairy Centrifuge — Bowl Balance' },
  { id: 'sysTqpEXoWc', title: 'Decanter Centrifuge Repair' },
  { id: '_0sHuLimB_c', title: 'Basket Centrifuge Repair' },
  { id: 'yybOQ92oiAk', title: 'Sharples P3400 — Centrifuge Repair' },
  { id: 'FNLfQKJwrpY', title: 'Alfa Laval CHPX 407 — Centrifuge Repair' },
  { id: 'OfoOIcuBSK4', title: 'Westfalia SB-14-06-076 — Centrifuge Repair' },
  { id: 'cMYpzI02_F0', title: 'Andritz D3LC30CHP — Centrifuge Repair' },
  { id: 'i1FLleg5gJY', title: 'Centrisys CS184HC (High Capacity) — Centrifuge Repair' },
  { id: 'e8W0YHTzTd0', title: 'Westfalia Centrifuge — Optimal Flow Rate' },
  { id: 'H_F5Oh064vg', title: '10,000 Gallon Reactor With Explosion-Proof Gearbox' },
  { id: 'IVzm5l_70qo', title: 'The Case of the Broken Centrifuge' },
  { id: 'ucnGBymQt54', title: 'We Buy Basket Centrifuges' },
  { id: 'yilb0hr8_9M', title: 'The Most Interesting Plant Manager in the World' },
]

export function toVideoSource(v: ChannelVideo): VideoSource {
  return {
    provider: 'youtube',
    id: v.id,
    title: v.title,
    poster: {
      // hqdefault always exists; facade is 16:9 and object-cover crops the bars.
      src: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      alt: `${v.title} — Centrifuge World`,
      width: 1280,
      height: 720,
    },
  }
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`
}
