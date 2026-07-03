// StatsRow: quantitative proof points. Never invent numbers — values are passed in
// from verified site-settings / CLAUDE.md facts only (CLAUDE.md rule 1).
export interface Stat {
  value: string
  label: string
}

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="reveal rounded-card bg-white p-5 text-center"
          style={{ ['--reveal-index' as string]: i }}
        >
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="block font-heading text-3xl font-bold text-blue">{s.value}</span>
            <span className="mt-1 block text-sm text-steel-500">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
