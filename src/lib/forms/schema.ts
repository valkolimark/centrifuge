import { z } from 'zod'
import { getFormConfig, type FormType, type FieldKey } from './config'

// Server-side validation for a submission (task 2.1). Builds a zod object from the
// form type's field config: required fields must be present, email/phone are
// format-checked, and the honeypot must be empty.
const emailField = z.string().trim().email('Enter a valid email address')
const phoneField = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .regex(/[0-9()+\-.\s]{7,}/, 'Enter a valid phone number')

function fieldSchema(key: FieldKey, required: boolean, type: string) {
  let base: z.ZodTypeAny
  if (type === 'email') base = required ? emailField : emailField.or(z.literal(''))
  else if (type === 'tel') base = required ? phoneField : phoneField.or(z.literal(''))
  else {
    const s = z.string().trim().max(5000)
    base = required ? s.min(1, 'This field is required') : s.optional().or(z.literal(''))
  }
  return base
}

export function buildFormSchema(type: FormType) {
  const config = getFormConfig(type)
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of config.fields) {
    if (field.type === 'file') continue // files handled separately
    shape[field.key] = fieldSchema(field.key, !!field.required, field.type)
  }
  return z.object(shape).passthrough()
}

export interface ValidationResult {
  ok: boolean
  data?: Record<string, string>
  errors?: Record<string, string>
}

export function validateSubmission(type: FormType, raw: Record<string, unknown>): ValidationResult {
  // Honeypot: any value → silent reject (treated as spam).
  if (typeof raw.company_website === 'string' && raw.company_website.trim() !== '') {
    return { ok: false, errors: { _spam: 'rejected' } }
  }
  const schema = buildFormSchema(type)
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? '_form')
      if (!errors[k]) errors[k] = issue.message
    }
    return { ok: false, errors }
  }
  return { ok: true, data: parsed.data as Record<string, string> }
}
