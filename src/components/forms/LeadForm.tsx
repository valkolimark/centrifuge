'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { getFormConfig, type FormType } from '@/lib/forms/config'
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
export function LeadForm({
  type,
  prefill,
  className,
  compact = false,
}: {
  type: FormType
  prefill?: Partial<Record<string, string>>
  className?: string
  compact?: boolean
}) {
  const config = getFormConfig(type)
  const [state, setState] = useState<FormState>({ status: 'idle' })
  const [pending, startTransition] = useTransition()
  const [photos, setPhotos] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const [utm, setUtm] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const captured: Record<string, string> = {}
    params.forEach((v, k) => {
      if (k.startsWith('utm_') || k === 'gclid') captured[k] = v
    })
    if (Object.keys(captured).length) setUtm(JSON.stringify(captured))
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // Replace the raw file input contents with the client-compressed files.
    fd.delete('photos')
    photos.forEach((f) => fd.append('photos', f, f.name))
    startTransition(async () => {
      const res = await submitForm(state, fd)
      setState(res)
      if (res.status === 'success') {
        trackFormSubmit(type, typeof window !== 'undefined' ? window.location.pathname : undefined)
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
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn('relative grid gap-4', compact ? '' : 'sm:grid-cols-2', className)}
      noValidate
    >
      <input type="hidden" name="_type" value={type} />
      <input type="hidden" name="_page" value={typeof window !== 'undefined' ? window.location.pathname : ''} />
      <input type="hidden" name="_utm" value={utm} />
      <Honeypot />

      {/* Photos-first layout for the Send Photos form. */}
      {config.photosFirst && photosField ? (
        <div className="sm:col-span-2">
          <FileUpload onChange={setPhotos} />
        </div>
      ) : null}

      {scalarFields.map((field) => {
        const error = state.errors?.[field.key]
        const defaultValue = prefill?.[field.key]
        const span = field.type === 'textarea' ? 'sm:col-span-2' : ''
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
                defaultValue={defaultValue}
              />
            </div>
          )
        }
        if (field.type === 'textarea') {
          return (
            <div key={field.key} className={span}>
              <TextareaField label={field.label} name={field.key} required={field.required} error={error} hint={field.hint} defaultValue={defaultValue} />
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
              defaultValue={defaultValue}
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
  )
}
