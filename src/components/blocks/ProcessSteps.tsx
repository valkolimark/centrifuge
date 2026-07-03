// ProcessSteps: ordered process (e.g. Inspect → Quote → Rebuild → Balance → Test → Return).
export interface Step {
  title: string
  description?: string
}

export function ProcessSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="reveal flex gap-4 rounded-card border border-steel-300 bg-white p-5"
          style={{ ['--reveal-index' as string]: i }}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-navy font-heading font-bold text-white">
            {i + 1}
          </span>
          <div>
            <h3 className="text-base text-navy">{step.title}</h3>
            {step.description ? <p className="mt-1 text-sm text-steel-500">{step.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
