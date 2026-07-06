// Sidebar header (UI-1): CW logo lockup pinned to the top-left of the nav, linking
// back to the Mission Control dashboard. Registered at admin.components.beforeNavLinks.
export default function NavHeader() {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- /admin is the Payload app root; full navigation required
    <a
      href="/admin"
      aria-label="Mission Control dashboard"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '14px 12px 12px',
        marginBottom: 6,
        borderBottom: '1px solid var(--cw-line, #1b2c55)',
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          flex: '0 0 38px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: 11,
          background: 'radial-gradient(circle at 30% 25%, rgba(62,201,245,.25), rgba(13,24,50,.9))',
          border: '1px solid #2a4380',
          boxShadow: '0 0 18px rgba(62,201,245,.25)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/cw-icon.png" alt="" style={{ width: 26, height: 26, aspectRatio: '147/148', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 6px rgba(62,201,245,.5))' }} />
      </span>
      <span style={{ lineHeight: 1.05 }}>
        <span style={{ fontFamily: "var(--font-display), 'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.4px', background: 'linear-gradient(90deg,#EAF2FF 20%,#3EC9F5 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', display: 'block' }}>
          CENTRIFUGE
        </span>
        <span style={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 500, fontSize: 9.5, letterSpacing: '4px', color: '#3EC9F5', textTransform: 'lowercase', display: 'block' }}>
          world · control
        </span>
      </span>
    </a>
  )
}
