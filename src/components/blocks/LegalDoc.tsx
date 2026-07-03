import type { ReactNode } from 'react'

// Simple legal document layout: title, effective date, a draft-review notice, and
// prose sections. Content authored as drafts pending client counsel review.
export interface LegalSection {
  heading: string
  body: ReactNode
}

export function LegalDoc({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: LegalSection[]
}) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1>{title}</h1>
      <p className="mt-2 text-sm text-steel-500">Last updated: {updated}</p>
      <div className="mt-4 rounded-card border border-steel-300 bg-steel-100 p-4 text-sm text-steel-700">
        This document is a draft provided for transparency and is pending review by legal counsel.
        It is not legal advice.
      </div>
      <div className="mt-8 space-y-8">
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="text-xl">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-3 space-y-3 text-steel-700 [&_a]:text-link [&_a]:underline [&_li]:ml-5 [&_li]:list-disc">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
