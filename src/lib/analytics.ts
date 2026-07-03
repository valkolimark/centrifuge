'use client'

// GA4/GTM event helper (task 1.6). Pushes the Definition-of-Done events to the
// GTM dataLayer. GTM itself is loaded after-interactive via @next/third-parties
// in the root layout. Safe to call before GTM loads — events queue on dataLayer.

type DataLayerObject = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: DataLayerObject[]
  }
}

export type GA4Event =
  | { event: 'form_submit'; form_type: FormType; page_source?: string }
  | { event: 'phone_click'; phone_role: string; phone_number: string }
  | { event: 'email_click'; email: string }
  | { event: 'cta_click'; cta_label: string; cta_location?: string }

export type FormType =
  | 'request_quote'
  | 'emergency_service'
  | 'free_inspection'
  | 'sell_centrifuge'
  | 'contact'
  | 'send_photos'

export function trackEvent(payload: GA4Event): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

// Convenience wrappers used by components.
export const trackPhoneClick = (phone_role: string, phone_number: string) =>
  trackEvent({ event: 'phone_click', phone_role, phone_number })

export const trackEmailClick = (email: string) =>
  trackEvent({ event: 'email_click', email })

export const trackCtaClick = (cta_label: string, cta_location?: string) =>
  trackEvent({ event: 'cta_click', cta_label, cta_location })

export const trackFormSubmit = (form_type: FormType, page_source?: string) =>
  trackEvent({ event: 'form_submit', form_type, page_source })
