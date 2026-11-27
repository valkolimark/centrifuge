import { Section } from '@/components/ui/Section'
import { FlyApartExplorer } from '@/components/blocks/FlyApartExplorer'
import { FLYAPART_MODELS, type FlyApartModel, type FlyApartModelKey } from '@/lib/flyapart-models'

// Page section that hosts an interactive 3D fly-apart model. Wide (horizontal)
// machines get the viewer full width with the parts list folded underneath; tall
// (vertical) machines get the viewer beside the heading and an open parts list,
// so the tall canvas does not leave half the row empty.
export function FlyApartSection({
  model: modelKey,
  id,
  heading,
  intro,
}: {
  model: FlyApartModelKey
  /** Anchor id, so other pages can deep-link to the viewer. */
  id: string
  heading: string
  intro: string
}) {
  const model: FlyApartModel = FLYAPART_MODELS[modelKey]

  if (model.layout === 'tall') {
    return (
      <Section tone="deep" id={id} className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
          <div className="lg:order-2">
            <h2 className="text-white">{heading}</h2>
            <p className="mt-2 max-w-2xl text-white/85">{intro}</p>
            <dl className="mt-6 hidden gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid">
              {model.parts.map((p) => (
                <div key={p.key}>
                  <dt className="text-sm font-semibold text-white">{p.name}</dt>
                  <dd className="text-sm text-white/80">{p.description}</dd>
                </div>
              ))}
            </dl>
          </div>
          {/* Below lg the parts list folds under the viewer instead (FlyApartExplorer's own <details>). */}
          <FlyApartExplorer model={modelKey} className="lg:order-1" partsListClassName="lg:hidden" />
        </div>
      </Section>
    )
  }

  return (
    <Section tone="deep" id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-white">{heading}</h2>
          <p className="mt-2 text-white/85">{intro}</p>
        </div>
        <FlyApartExplorer model={modelKey} />
      </div>
    </Section>
  )
}
