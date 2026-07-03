// TrustBar: the four proof points. Values are seeded into site-settings in Payload
// (Cycle 1.2) but the defaults come from CLAUDE.md business facts.
const DEFAULT_ITEMS = [
  { value: 'Since 1939', label: 'Trusted expertise' },
  { value: '3 US Facilities', label: 'Houston · Chicago area' },
  { value: '45+ Brands', label: 'OEM equipment serviced' },
  { value: '24/7', label: 'Emergency service' },
]

export function TrustBar({ items = DEFAULT_ITEMS }: { items?: { value: string; label: string }[] }) {
  return (
    <div className="border-y border-steel-300 bg-white">
      <div className="container-cw grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.value} className="text-center">
            <p className="font-heading text-xl font-bold text-navy md:text-2xl">{it.value}</p>
            <p className="mt-1 text-sm text-steel-500">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
