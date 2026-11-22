import type { ReactNode } from 'react'
import type { EmailLandingPicture } from './content'
import { LandingPicture } from './LandingPicture'

// Hero for the Nov 23/25/30 email landings. Photos sit in rounded rectangle
// frames (gated r7c). No blob or liquid photo mask.
function Title({ slug, title }: { slug: string; title: string }) {
  if (slug === 'centrifuge-balancing') {
    return <>Centrifuge Vibrating? Ask About <em>Balancing</em></>
  }
  if (slug === 'centrifuge-247-thanksgiving') {
    return <>Centrifuge Down Over Thanksgiving? <em>24/7</em> Service</>
  }
  if (slug === 'decanter-bowl-rebuild-before-after') {
    return <>Decanter Bowls <em>Before</em> and <em>After</em> Rebuild</>
  }
  return <>{title}</>
}

export function LiquidHero({
  slug,
  title,
  lede,
  photos,
  actions,
}: {
  slug: string
  title: string
  lede: string
  photos: EmailLandingPicture[]
  actions: ReactNode
}) {
  const isPair = photos.length === 2
  return (
    <div className={`el-hero${isPair ? ' has-pair' : ''}`}>
      <div className="el-hero-wrap">
        <div>
          <h1 className={title.length > 40 ? 'long' : undefined}>
            <Title slug={slug} title={title} />
          </h1>
          <span className="el-h1-rule" aria-hidden="true" />
          <p className="el-lede">{lede}</p>
          <div className="el-ctas">{actions}</div>
        </div>
        {isPair ? (
          <div className="el-photo el-two">
            <div className="el-pair" role="group" aria-label="Before and after photos">
              {photos.map((p) => (
                <figure key={p.src}>
                  <div className="el-frame">
                    <LandingPicture photo={p} className="el-r7-img" />
                  </div>
                </figure>
              ))}
            </div>
          </div>
        ) : (
          photos[0] && (
            <div className="el-photo">
              <figure>
                <div className="el-frame">
                  <LandingPicture photo={photos[0]} className="el-r7-img" />
                </div>
              </figure>
            </div>
          )
        )}
      </div>
    </div>
  )
}
