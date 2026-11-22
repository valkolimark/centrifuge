'use client'

import type { ReactNode } from 'react'
import { trackPhoneClick } from '@/lib/analytics'
import { phone } from '@/lib/site'
import { smsOf, telOf } from './config'

// tel:/sms: link from data/nap.json by role, firing the existing GA4 phone_click event.
export function TelLink({
  role,
  sms = false,
  className,
  id,
  children,
  tabIndex,
}: {
  role: string
  sms?: boolean
  className?: string
  id?: string
  children: ReactNode
  tabIndex?: number
}) {
  const p = phone(role as never)
  return (
    <a
      id={id}
      href={sms ? smsOf(p.number) : telOf(p.number)}
      className={className}
      tabIndex={tabIndex}
      data-phone-role={role}
      onClick={() => trackPhoneClick(sms ? `${role}_sms` : role, p.number)}
    >
      {children}
    </a>
  )
}
