'use client'

import { Button } from '@/components/ui/Button'
import { TextField, TextareaField, SelectField } from '@/components/forms/Field'
import { FileUpload } from '@/components/forms/FileUpload'
import { Honeypot } from '@/components/forms/Honeypot'
import { Turnstile } from '@/components/forms/Turnstile'

// Non-functional demo of the form primitives for the style guide. The real,
// server-action-backed forms engine is built in Cycle 2.
export function FormDemo() {
  return (
    <form className="relative grid max-w-xl gap-4" onSubmit={(e) => e.preventDefault()}>
      <Honeypot />
      <TextField label="Name" name="name" required autoComplete="name" />
      <TextField label="Email" name="email" type="email" required autoComplete="email" />
      <TextField label="Phone" name="phone" type="tel" error="Enter a valid phone number" />
      <SelectField
        label="Equipment type"
        name="equipment"
        placeholder="Select equipment…"
        options={[
          { value: 'decanter', label: 'Decanter' },
          { value: 'basket', label: 'Basket' },
          { value: 'disc-stack', label: 'Disc Stack' },
        ]}
      />
      <TextareaField label="Message" name="message" hint="Tell us about the machine and the issue." />
      <FileUpload />
      <Turnstile />
      <Button type="submit">Submit (demo)</Button>
    </form>
  )
}
