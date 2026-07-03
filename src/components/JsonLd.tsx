// Single JSON-LD emitter. Pass one schema object or an array; renders one
// <script type="application/ld+json"> per graph. `<` is escaped to < so a
// string value can never break out of the script element.
import { Fragment } from 'react'

type Json = Record<string, unknown>

function serialize(data: Json): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: { data: Json | Json[] }) {
  const graphs = Array.isArray(data) ? data : [data]
  return (
    <Fragment>
      {graphs.map((g, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(g) }}
        />
      ))}
    </Fragment>
  )
}
