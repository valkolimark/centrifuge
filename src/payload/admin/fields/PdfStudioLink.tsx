'use client'

// Entry point shown on the Media edit view (UI-1 Phase E): links a PDF upload to
// the full-screen PDF Studio workspace. Only renders for PDF mime types.
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

export default function PdfStudioLink() {
  const { id } = useDocumentInfo()
  const mime = (useFormFields(([f]) => f?.mimeType?.value) as string) || ''
  if (!id || !mime.includes('pdf')) return null

  return (
    <a
      href={`/pdf-studio/${id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 14px',
        borderRadius: 10,
        background: 'linear-gradient(90deg,#2A6BFF,#3EC9F5)',
        color: '#041018',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: '0 0 22px rgba(62,201,245,.28)',
      }}
    >
      📄 Open in PDF Studio
    </a>
  )
}
