'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

// FileUpload (task 1.4): client-side image compression to <=1MB per image, max 6.
// Uses canvas re-encode; large photos from phones shrink before upload. The Cycle 2
// forms engine reads the compressed File list off this component's state. The 1MB target
// keeps a full 6-photo upload (~6MB) within the Server Action / platform body limit.
const MAX_FILES = 6
const MAX_BYTES = 1 * 1024 * 1024

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= MAX_BYTES) return file
  const bitmap = await createImageBitmap(file)
  const maxDim = 2000
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  for (const quality of [0.8, 0.6, 0.45]) {
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' })
    }
  }
  return file
}

export function FileUpload({
  name = 'photos',
  label = 'Photos (optional)',
  onChange,
}: {
  name?: string
  label?: string
  onChange?: (files: File[]) => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  async function handleFiles(list: FileList | null) {
    if (!list) return
    setError(undefined)
    setBusy(true)
    try {
      const incoming = Array.from(list)
      const room = MAX_FILES - files.length
      if (incoming.length > room) setError(`Maximum ${MAX_FILES} photos — extra files were skipped.`)
      const compressed = await Promise.all(incoming.slice(0, room).map(compressImage))
      const next = [...files, ...compressed]
      setFiles(next)
      onChange?.(next)
    } finally {
      setBusy(false)
    }
  }

  function remove(i: number) {
    const next = files.filter((_, idx) => idx !== i)
    setFiles(next)
    onChange?.(next)
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-steel-700">
        {label} <span className="text-steel-500">(up to {MAX_FILES}, ≤1MB each after compression)</span>
      </label>
      <input
        type="file"
        name={name}
        accept="image/*"
        multiple
        disabled={busy || files.length >= MAX_FILES}
        onChange={(e) => handleFiles(e.target.files)}
        className={cn(
          'block w-full rounded-button border border-dashed border-steel-300 bg-white p-3 text-sm',
          'file:mr-3 file:rounded-button file:border-0 file:bg-steel-100 file:px-3 file:py-1.5 file:text-navy',
        )}
      />
      {busy ? <p className="mt-1 text-sm text-steel-500">Compressing…</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-error">
          {error}
        </p>
      ) : null}
      {files.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded bg-steel-100 px-2 py-1">
              <span className="truncate">
                {f.name} · {(f.size / 1024).toFixed(0)} KB
              </span>
              <button type="button" onClick={() => remove(i)} className="text-error">
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
