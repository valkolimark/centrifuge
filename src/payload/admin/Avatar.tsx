'use client'

// Sidebar/topbar profile avatar (UI-1 Phase F). Renders the user's uploaded photo
// inside a conic-gradient ring, falling back to initials. Registered at admin.avatar.
import { useAuth } from '@payloadcms/ui'

type MaybeMedia = { url?: string; sizes?: { avatar?: { url?: string } } } | string | null | undefined

function initials(name?: string, email?: string): string {
  const base = (name || email || '?').trim()
  const parts = base.split(/\s+/)
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export default function Avatar() {
  const { user } = useAuth()
  const avatar = (user as { avatar?: MaybeMedia; name?: string; email?: string } | null)?.avatar
  const url = typeof avatar === 'object' && avatar ? avatar.sizes?.avatar?.url || avatar.url : undefined

  return (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        padding: 2,
        background: 'conic-gradient(from 210deg, #3EC9F5, #2A6BFF, #8B6CFF, #3EC9F5)',
      }}
      aria-label="Profile"
    >
      <span style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'grid', placeItems: 'center', background: '#0D1832', color: '#EAF2FF', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display,sans-serif)' }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials((user as { name?: string })?.name, (user as { email?: string })?.email)
        )}
      </span>
    </span>
  )
}
