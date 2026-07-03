// Full brand lockup shown on the admin login screen.
export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width="52" height="52" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#00415A" />
        <circle cx="20" cy="20" r="12.5" stroke="#00B8FF" strokeWidth="2" opacity="0.7" />
        <circle cx="20" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="20" cy="20" r="2.6" fill="#E11900" />
        <path d="M20 4v5.5M20 30.5V36M4 20h5.5M30.5 20H36" stroke="#00B8FF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <strong style={{ fontSize: 22, fontWeight: 800, color: 'var(--theme-text)', letterSpacing: '-0.01em' }}>
          Centrifuge <span style={{ color: 'var(--cw-blue, #00719C)' }}>World</span>
        </strong>
        <span style={{ fontSize: 12.5, color: 'var(--cw-steel-500, #6B7A89)', letterSpacing: '0.02em' }}>
          Content Management · Since 1939
        </span>
      </span>
    </div>
  )
}
