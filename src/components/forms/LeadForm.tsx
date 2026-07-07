'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getFormConfig, type FormType } from '@/lib/forms/config'
import type { MachineSnapshot } from '@/lib/inventory-machine'
import { TextField, TextareaField, SelectField } from './Field'
import { FileUpload } from './FileUpload'
import { Honeypot } from './Honeypot'
import { Turnstile } from './Turnstile'
import { Button } from '@/components/ui/Button'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { submitForm, type FormState } from '@/app/(frontend)/actions/submit-form'
import { trackFormSubmit } from '@/lib/analytics'
import { emergencyPhone } from '@/lib/site'
import { cn } from '@/lib/cn'

// The forms engine's UI (task 2.1). One component renders any of the six form
// types from its config. Submits via a server action with client-compressed photos;
// shows a per-type success screen (emergency also surfaces the 24/7 phone).
//
// CYCLE-INV-1 Phase 3: an optional `machine` snapshot renders a context callout above the
// fields, pre-fills equipment/brand/model/message (controlled so "Remove" can clear them),
// and rides along as a hidden `_machine` field so the submitted lead keeps a durable snapshot.
export function LeadForm({
  type,
  prefill,
  machine: machineProp,
  className,
  compact = false,
}: {
  type: FormType
  prefill?: Partial<Record<string, string>>
  machine?: MachineSnapshot | null
  className?: string
  compact?: boolean
}) {
  const config = getFormConfig(type)
  const [state, setState] = useState<FormState>({ status: 'idle' })
  const [pending, startTransition] = useTransition()
  const [photos, setPhotos] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [utm, setUtm] = useState('')
  const [machine, setMachine] = useState<MachineSnapshot | null>(machineProp ?? null)
  // Keys pre-filled from a machine are rendered *controlled* so removing the machine can clear
  // them (the rest of the form stays uncontrolled and keeps whatever the user typed).
  const prefillKeys = useRef(new Set(Object.keys(prefill ?? {})))
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(prefill ?? {}).filter(([, v]) => v != null)) as Record<string, string>,
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const captured: Record<string, string> = {}
    params.forEach((v, k) => {
      if (k.startsWith('utm_') || k === 'gclid') captured[k] = v
    })
    if (Object.keys(captured).length) setUtm(JSON.stringify(captured))
  }, [])

  function removeMachine() {
    setMachine(null)
    setValues({}) // clears the pre-filled fields; they remain editable
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // Replace the raw file input contents with the client-compressed files.
    fd.delete('photos')
    photos.forEach((f) => fd.append('photos', f, f.name))
    startTransition(async () => {
      try {
        const res = await submitForm(state, fd)
        setState(res)
        if (res.status === 'success') {
          trackFormSubmit(type, typeof window !== 'undefined' ? window.location.pathname : undefined)
        }
      } catch {
        // Network/platform failure (e.g. body-size 413 on a large photo upload). Never let it
        // bubble to the error boundary and blank the page — show an inline, recoverable message.
        setState({
          status: 'error',
          message: 'We could not send your request — it may be too large. Try removing photos, or call us and we will help right away.',
        })
      }
    })
  }

  if (state.status === 'success') {
    return (
      <div className={cn('rounded-card border border-steel-300 bg-white p-6', className)} role="status">
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-pill bg-success text-white">✓</div>
        <h3 className="text-navy">{config.success.heading}</h3>
        <p className="mt-2 text-steel-700">{config.success.body}</p>
        {type === 'emergency_service' ? (
          <p className="mt-4 rounded-button bg-safety px-4 py-3 font-semibold text-white">
            Fastest response: call{' '}
            <PhoneLink role="emergency" className="text-white underline underline-offset-2">
              {emergencyPhone.display}
            </PhoneLink>
          </p>
        ) : null}
      </div>
    )
  }

  const photosField = config.fields.find((f) => f.type === 'file')
  const scalarFields = config.fields.filter((f) => f.type !== 'file')

  return (
    <div className={cn(className)}>
      {machine ? (
        <div className="mb-5 flex gap-4 rounded-card border-l-4 border-blue bg-steel-100 p-4">
          {machine.thumbnailUrl ? (
            <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-button bg-white sm:block">
              <Image src={machine.thumbnailUrl} alt={machine.title} fill sizes="96px" className="object-cover" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">Requesting this machine · {machine.inventoryId}</p>
            <p className="mt-0.5 font-semibold text-navy">{machine.title}</p>
            {machine.specsSnapshot.length ? (
              <p className="mt-1 line-clamp-1 text-xs text-steel-700">
                {machine.specsSnapshot.slice(0, 3).map((s) => `${s.label}: ${s.value}`).join(' · ')}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
              <Link href={`/inventory/${machine.slug}/`} className="text-link hover:underline">
                View listing →
              </Link>
              <button type="button" onClick={removeMachine} className="text-steel-500 hover:text-error">
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className={cn('relative grid gap-4', compact ? '' : 'sm:grid-cols-2')}
        noValidate
      >
        <input type="hidden" name="_type" value={type} />
        <input type="hidden" name="_page" value={typeof window !== 'undefined' ? window.location.pathname : ''} />
        <input type="hidden" name="_utm" value={utm} />
        {machine ? <input type="hidden" name="_machine" value={JSON.stringify(machine)} /> : null}
        <Honeypot />

        {/* Photos-first layout for the Send Photos form. */}
        {config.photosFirst && photosField ? (
          <div className="sm:col-span-2">
            <FileUpload onChange={setPhotos} />
          </div>
        ) : null}

        {scalarFields.map((field) => {
          const error = state.errors?.[field.key]
          const span = field.type === 'textarea' ? 'sm:col-span-2' : ''
          // Controlled iff this key was pre-filled (so Remove can clear it); else uncontrolled.
          const controlled = prefillKeys.current.has(field.key)
          const valueProps = controlled
            ? {
                value: values[field.key] ?? '',
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value })),
              }
            : { defaultValue: prefill?.[field.key] }
          if (field.type === 'select') {
            return (
              <div key={field.key} className={span}>
                <SelectField
                  label={field.label}
                  name={field.key}
                  required={field.required}
                  error={error}
                  placeholder={field.placeholder}
                  options={field.options ?? []}
                  {...valueProps}
                />
              </div>
            )
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.key} className={span}>
                <TextareaField label={field.label} name={field.key} required={field.required} error={error} hint={field.hint} {...valueProps} />
              </div>
            )
          }
          return (
            <div key={field.key} className={span}>
              <TextField
                label={field.label}
                name={field.key}
                type={field.type}
                required={field.required}
                error={error}
                autoComplete={field.autoComplete}
                {...valueProps}
              />
            </div>
          )
        })}

        {/* Photos at the end for non-photos-first forms. */}
        {!config.photosFirst && photosField ? (
          <div className="sm:col-span-2">
            <FileUpload onChange={setPhotos} />
          </div>
        ) : null}

        {state.status === 'error' && state.message ? (
          <p role="alert" className="sm:col-span-2 rounded-button bg-error/10 px-3 py-2 text-sm text-error">
            {state.message}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <Turnstile />
          <Button type="submit" size="lg" variant={type === 'emergency_service' ? 'emergency' : 'primary'} disabled={pending}>
            {pending ? 'Sending…' : config.submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
