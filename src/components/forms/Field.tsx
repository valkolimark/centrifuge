import { useId } from 'react'
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

// Accessible field primitives (task 1.4). Labeled, inline error via aria-describedby
// + aria-invalid, required marker. The Cycle 2 forms engine composes these.

const controlBase =
  'w-full rounded-button border border-steel-300 bg-white px-3 py-2.5 text-body ' +
  'placeholder:text-steel-500 focus-visible:border-blue min-h-[44px]'

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: (describedBy: string | undefined) => ReactNode
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = cn(hint && hintId, error && errorId) || undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-steel-700">
        {label}
        {required ? <span className="ml-0.5 text-error" aria-hidden="true">*</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mb-1 text-xs text-steel-500">
          {hint}
        </p>
      ) : null}
      {children(describedBy)}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface Base {
  id?: string
  label: string
  required?: boolean
  error?: string
  hint?: string
}

export function TextField({
  id,
  label,
  required,
  error,
  hint,
  ...props
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const rid = useId()
  const fieldId = id ?? rid
  return (
    <FieldShell id={fieldId} label={label} required={required} error={error} hint={hint}>
      {(describedBy) => (
        <input
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(controlBase, error && 'border-error')}
          {...props}
        />
      )}
    </FieldShell>
  )
}

export function TextareaField({
  id,
  label,
  required,
  error,
  hint,
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const rid = useId()
  const fieldId = id ?? rid
  return (
    <FieldShell id={fieldId} label={label} required={required} error={error} hint={hint}>
      {(describedBy) => (
        <textarea
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          rows={5}
          className={cn(controlBase, 'min-h-[120px]', error && 'border-error')}
          {...props}
        />
      )}
    </FieldShell>
  )
}

export function SelectField({
  id,
  label,
  required,
  error,
  hint,
  options,
  placeholder,
  ...props
}: Base & { options: { value: string; label: string }[]; placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const rid = useId()
  const fieldId = id ?? rid
  return (
    <FieldShell id={fieldId} label={label} required={required} error={error} hint={hint}>
      {(describedBy) => (
        <select
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(controlBase, error && 'border-error')}
          defaultValue=""
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}
