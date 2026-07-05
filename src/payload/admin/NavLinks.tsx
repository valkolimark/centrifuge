/* Adds a "Leads & Quotes" entry to the admin nav (UI-2 §7) so the full-screen workspace
   at /admin/leads-quotes is reachable. Registered at admin.components.afterNavLinks. */
export default function NavLinks() {
  return (
    <a
      href="/admin/leads-quotes"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        margin: '2px 8px',
        borderRadius: 9,
        color: 'var(--cw-ink, #EAF2FF)',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 13.5,
        border: '1px solid rgba(62,201,245,.28)',
        background: 'linear-gradient(90deg,rgba(42,107,255,.18),rgba(62,201,245,.06))',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3EC9F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      Leads &amp; Quotes
    </a>
  )
}
