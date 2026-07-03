'use client'

import type { ReactNode } from 'react'
import { phone, type PhoneRole } from '@/lib/site'
import { trackPhoneClick } from '@/lib/analytics'
import { cn } from '@/lib/cn'

// tel: link that fires the GA4 phone_click event. Numbers always come from
// nap.json via the `role` key — never hand-typed.
export function PhoneLink({
  role,
  className,
  children,
  showRole = false,
}: {
  role: string
  className?: string
  children?: ReactNode
  showRole?: boolean
}) {
  const p: PhoneRole = phone(role as never)
  return (
    <a
      href={`tel:${p.number}`}
      className={cn('font-semibold', className)}
      onClick={() => trackPhoneClick(role, p.number)}
      data-phone-role={role}
    >
      {children ?? p.display}
      {showRole ? <span className="block text-sm font-normal opacity-80">{p.role}</span> : null}
    </a>
  )
}

export function EmailLink({
  email,
  className,
  children,
}: {
  email: string
  className?: string
  children?: ReactNode
}) {
  // trackEmailClick is imported lazily to keep this file's client bundle small.
  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={() => import('@/lib/analytics').then((m) => m.trackEmailClick(email))}
    >
      {children ?? email}
    </a>
  )
}
