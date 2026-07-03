// Compact brand mark shown in the admin nav header. The graphical CW logo on a
// small white chip so it reads on the dark navy sidebar.
// TODO(verify): replace with centrifuge.com's square favicon once the client
// supplies it (the live favicon is behind the site's captcha and unreachable).
export default function Icon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#fff',
        padding: '4px 7px',
        borderRadius: 6,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/cw-logo-black.webp" alt="Centrifuge World" style={{ height: 18, width: 'auto', display: 'block' }} />
    </span>
  )
}
