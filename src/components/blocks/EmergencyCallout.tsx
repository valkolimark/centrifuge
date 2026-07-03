import { emergencyPhone } from '@/lib/site'
import { ButtonLink } from '@/components/ui/Button'

// EmergencyCallout: emergency-red band, 2-tap tel: reach from any page (DoD).
export function EmergencyCallout({
  heading = 'Centrifuge down? We respond 24/7.',
  body = 'On-call technicians and expedited shop turnaround keep your plant running. Call the emergency line now.',
}: {
  heading?: string
  body?: string
}) {
  return (
    <section className="bg-safety text-white">
      <div className="container-cw flex flex-col items-start gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-white">{heading}</h2>
          <p className="mt-2 text-white/90">{body}</p>
        </div>
        <ButtonLink
          href={`tel:${emergencyPhone.number}`}
          variant="on-emergency"
          size="lg"
          className="shrink-0"
        >
          Call {emergencyPhone.display}
        </ButtonLink>
      </div>
    </section>
  )
}
