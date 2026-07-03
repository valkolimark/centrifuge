import { JsonLd } from '@/components/JsonLd'
import { faqPageSchema, type QA } from '@/lib/schema'

// FAQAccordion: native <details>/<summary> (works with no JS, keyboard operable).
// When emitSchema is true it emits FAQPage schema covering exactly the rendered
// questions (per schema-map: only questions visible on the page).
export function FAQAccordion({ items, emitSchema = true }: { items: QA[]; emitSchema?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className="divide-y divide-steel-300 rounded-card border border-steel-300 bg-white">
      {emitSchema ? <JsonLd data={faqPageSchema(items)} /> : null}
      {items.map((qa) => (
        <details key={qa.question} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-navy [&::-webkit-details-marker]:hidden">
            {qa.question}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0 transition-transform duration-150 group-open:rotate-180"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="pb-4 text-steel-700">{qa.answer}</p>
        </details>
      ))}
    </div>
  )
}
