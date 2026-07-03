import { emergencyPhone, hours } from '@/lib/site'
import { PhoneLink } from '@/components/ui/PhoneLink'

// Always-visible utility bar. Safety-orange 24/7 emergency line + office hours.
// Safety orange is reserved for this and emergency CTAs only (CLAUDE.md).
export function EmergencyBar() {
  return (
    <div className="bg-safety text-white">
      <div className="container-cw flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-sm font-medium">
        <p className="flex items-center gap-2">
          <span aria-hidden="true">⚠</span>
          <span>
            24/7 Emergency Service:{' '}
            <PhoneLink role="emergency" className="underline underline-offset-2 text-white">
              {emergencyPhone.display}
            </PhoneLink>
          </span>
        </p>
        <p className="hidden sm:block opacity-95">
          {hours.office.display} · {hours.oncall.display}
        </p>
      </div>
    </div>
  )
}
