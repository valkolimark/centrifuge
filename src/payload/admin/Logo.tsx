// Full brand lockup shown on the admin login screen. The graphical CW logo on a
// white chip so it reads on the admin's light or dark surfaces.
export default function Logo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          display: 'inline-flex',
          background: '#fff',
          padding: '16px 22px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgb(7 37 70 / 0.10)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/cw-logo-black.webp" alt="Centrifuge World" style={{ height: 48, width: 'auto', display: 'block' }} />
      </span>
      <span style={{ fontSize: 12.5, color: 'var(--cw-steel-500, #6B7A89)', letterSpacing: '0.02em' }}>
        Content Management · Since 1939
      </span>
    </div>
  )
}
