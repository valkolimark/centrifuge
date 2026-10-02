/* Direct public URL for a file in the media collection's Vercel Blob store — mirrors
 * @payloadcms/storage-vercel-blob's generateURL (no prefix configured). Links built from this
 * skip Payload's /api/media/file proxy, so they open without the app or the database. */
export function blobPublicUrl(filename?: string | null): string {
  if (!filename) return ''
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
  const base = process.env.STORAGE_VERCEL_BLOB_BASE_URL || (storeId ? `https://${storeId}.public.blob.vercel-storage.com` : '')
  return base ? `${base}/${encodeURIComponent(filename)}` : ''
}
