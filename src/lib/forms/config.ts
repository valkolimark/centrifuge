// Forms engine config (Cycle 2, task 2.1). Six form types are configurations over
// one engine + one shared field library. NAP/brand data comes from /data via site.ts.
import { brands } from '@/lib/site'
import type { FormType } from '@/lib/analytics'

export type { FormType }

// ── Shared field library ──────────────────────────────────────
export type FieldKey =
  | 'name'
  | 'company'
  | 'email'
  | 'phone'
  | 'location'
  | 'equipment'
  | 'brand'
  | 'model'
  | 'serviceNeeded'
  | 'urgency'
  | 'condition'
  | 'askingPrice'
  | 'whatHappened'
  | 'message'
  | 'photos'

export const EQUIPMENT_OPTIONS = [
  { value: 'decanter', label: 'Decanter' },
  { value: 'basket', label: 'Basket' },
  { value: 'disc-stack', label: 'Disc Stack' },
  { value: 'pusher', label: 'Pusher' },
  { value: 'peeler', label: 'Peeler' },
  { value: 'gearbox', label: 'Gearbox' },
  { value: 'other', label: 'Other' },
]

export const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency – down now' },
  { value: 'this-week', label: 'This week' },
  { value: 'planning', label: 'Planning ahead' },
]

export const CONDITION_OPTIONS = [
  { value: 'running', label: 'Running / operational' },
  { value: 'idle', label: 'Idle but complete' },
  { value: 'parts', label: 'For parts / incomplete' },
  { value: 'unknown', label: 'Unknown' },
]

// Brand select fed from oem-brands.json + "Not sure" (CLAUDE.md rule 4).
export const BRAND_OPTIONS = [
  ...brands.map((b) => ({ value: b.slug, label: b.name })),
  { value: 'not-sure', label: 'Not sure' },
]

export interface FieldConfig {
  key: FieldKey
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'file'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  autoComplete?: string
  hint?: string
}

const FIELD: Record<FieldKey, FieldConfig> = {
  name: { key: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
  company: { key: 'company', label: 'Company', type: 'text', autoComplete: 'organization' },
  email: { key: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  phone: { key: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
  location: { key: 'location', label: 'Location / City', type: 'text', autoComplete: 'address-level2' },
  equipment: { key: 'equipment', label: 'Equipment type', type: 'select', options: EQUIPMENT_OPTIONS, placeholder: 'Select equipment…' },
  brand: { key: 'brand', label: 'Brand', type: 'select', options: BRAND_OPTIONS, placeholder: 'Select a brand…' },
  model: { key: 'model', label: 'Model', type: 'text' },
  serviceNeeded: { key: 'serviceNeeded', label: 'Service needed', type: 'text' },
  urgency: { key: 'urgency', label: 'Urgency', type: 'select', options: URGENCY_OPTIONS, placeholder: 'Select urgency…' },
  condition: { key: 'condition', label: 'Condition', type: 'select', options: CONDITION_OPTIONS, placeholder: 'Select condition…' },
  askingPrice: { key: 'askingPrice', label: 'Asking price (optional)', type: 'text' },
  whatHappened: { key: 'whatHappened', label: 'What happened?', type: 'textarea', hint: 'Briefly — symptoms, noises, when it went down.' },
  message: { key: 'message', label: 'Message', type: 'textarea' },
  photos: { key: 'photos', label: 'Photos', type: 'file' },
}

export interface FormConfig {
  type: FormType
  title: string
  submitLabel: string
  /** Ordered field keys shown for this form type. */
  fields: FieldConfig[]
  /** Fields locked to a fixed value (e.g. emergency urgency). */
  locked?: Partial<Record<FieldKey, string>>
  emailSubjectPrefix?: string
  photosFirst?: boolean
  success: { heading: string; body: string }
}

function f(...keys: FieldKey[]): FieldConfig[] {
  return keys.map((k) => FIELD[k])
}

export const FORMS: Record<FormType, FormConfig> = {
  request_quote: {
    type: 'request_quote',
    title: 'Request a Quote',
    submitLabel: 'Request my quote',
    fields: f('name', 'company', 'email', 'phone', 'location', 'equipment', 'brand', 'model', 'serviceNeeded', 'urgency', 'message', 'photos'),
    success: {
      heading: 'Thanks — your quote request is in.',
      body: 'A centrifuge specialist will review your details and follow up shortly. For anything urgent, call our team.',
    },
  },
  emergency_service: {
    type: 'emergency_service',
    title: 'Emergency Service',
    submitLabel: 'Send emergency request',
    // Max 5 visible fields per spec; urgency locked to Emergency.
    fields: f('name', 'phone', 'company', 'equipment', 'whatHappened'),
    locked: { urgency: 'emergency' },
    emailSubjectPrefix: '[EMERGENCY] ',
    success: {
      heading: 'Emergency request received.',
      body: 'We are on it. For the fastest response, call the 24/7 line now.',
    },
  },
  free_inspection: {
    type: 'free_inspection',
    title: 'Free Inspection',
    submitLabel: 'Request an inspection',
    fields: f('name', 'company', 'email', 'phone', 'location', 'equipment', 'brand', 'model', 'message'),
    success: {
      heading: 'Inspection request received.',
      body: 'We will reach out to schedule your centrifuge inspection.',
    },
  },
  sell_centrifuge: {
    type: 'sell_centrifuge',
    title: 'Sell Your Centrifuge',
    submitLabel: 'Submit machine details',
    fields: f('name', 'company', 'email', 'phone', 'equipment', 'brand', 'model', 'condition', 'askingPrice', 'message', 'photos'),
    success: {
      heading: 'Thanks — we received your machine details.',
      body: 'Our team will review and get back to you with next steps.',
    },
  },
  contact: {
    type: 'contact',
    title: 'Contact Us',
    submitLabel: 'Send message',
    fields: f('name', 'company', 'email', 'phone', 'message'),
    success: {
      heading: 'Message sent.',
      body: 'Thanks for reaching out — we will get back to you shortly.',
    },
  },
  send_photos: {
    type: 'send_photos',
    title: 'Send Photos for Review',
    submitLabel: 'Send photos',
    photosFirst: true,
    fields: f('photos', 'name', 'phone', 'email', 'brand', 'model', 'message'),
    success: {
      heading: 'Photos received.',
      body: 'Our technicians will review your photos and follow up.',
    },
  },
}

export function getFormConfig(type: FormType): FormConfig {
  return FORMS[type]
}
