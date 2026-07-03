import { hours, type Location } from '@/lib/site'
import { PhoneLink } from '@/components/ui/PhoneLink'

// LocationCard: NAP rendered from nap.json only (byte-for-byte, tested in Cycle 2/4).
// Houston uses the "Houston (Rosharon), TX" naming pattern via loc.label + note.
export function LocationCard({ loc }: { loc: Location }) {
  return (
    <div className="reveal rounded-card border border-steel-300 bg-white p-5">
      <h3 className="text-lg text-navy">{loc.label}</h3>
      <address className="mt-2 not-italic text-sm text-steel-700">
        {loc.streetAddress}
        <br />
        {loc.addressLocality}, {loc.addressRegion} {loc.postalCode}
      </address>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-steel-500">Phone:</dt>
          <dd>
            <PhoneLink role={loc.phone} className="text-link" showRole />
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-steel-500">Hours:</dt>
          <dd className="text-steel-700">
            {hours.office.display} · {hours.oncall.display}
          </dd>
        </div>
      </dl>
    </div>
  )
}
