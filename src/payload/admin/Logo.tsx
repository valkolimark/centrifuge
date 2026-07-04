// Mission Control brand lockup (login screen + sidebar). The swirl icon sits in a
// fixed square with a preserved 147/148 aspect ratio so it never squishes; the
// wordmark uses the display font with a cyan gradient.
export default function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <span
        style={{
          width: 52,
          height: 52,
          flex: '0 0 52px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: 13,
          background: 'radial-gradient(circle at 30% 25%, rgba(62,201,245,.25), rgba(13,24,50,.9))',
          border: '1px solid #2a4380',
          boxShadow: '0 0 22px rgba(62,201,245,.28)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/cw-icon.png"
          alt="Centrifuge World"
          style={{ width: 36, height: 'auto', aspectRatio: '147 / 148', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(62,201,245,.55))' }}
        />
      </span>
      <span style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: "var(--font-display), 'Chakra Petch', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.4px',
            background: 'linear-gradient(90deg,#EAF2FF 20%,#3EC9F5 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'block',
          }}
        >
          CENTRIFUGE
        </span>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 500, fontSize: 12, letterSpacing: '5px', color: '#3EC9F5', textTransform: 'lowercase', display: 'block', marginTop: 1 }}>
          world
        </span>
        <span style={{ fontSize: 9, letterSpacing: '1.5px', color: '#5A6E96', textTransform: 'uppercase', marginTop: 3, display: 'block' }}>
          Estd 1939 · Mission Control
        </span>
      </span>
    </span>
  )
}
