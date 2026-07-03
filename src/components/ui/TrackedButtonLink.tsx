'use client'

import { ButtonLink } from './Button'
import { trackCtaClick, trackPhoneClick } from '@/lib/analytics'
import type { ComponentProps } from 'react'

// ButtonLink that fires a GA4 event on click (Definition of Done: cta_click /
// phone_click). Use for hero CTAs and other tracked buttons in server components.
type Props = ComponentProps<typeof ButtonLink> & {
  ctaLabel: string
  ctaLocation?: string
  phoneRole?: string
  phoneNumber?: string
}

export function TrackedButtonLink({ ctaLabel, ctaLocation, phoneRole, phoneNumber, ...props }: Props) {
  function onClick() {
    if (phoneRole && phoneNumber) trackPhoneClick(phoneRole, phoneNumber)
    else trackCtaClick(ctaLabel, ctaLocation)
  }
  return <ButtonLink {...props} onClick={onClick} />
}
