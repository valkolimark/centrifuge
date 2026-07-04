// Compact brand mark shown in the admin breadcrumb/topbar — the CW globe favicon.
// Fixed aspect ratio + object-fit so it can never squish, regardless of the slot.
export default function Icon() {
  return (
    <span style={{ display: 'inline-grid', placeItems: 'center', width: 26, height: 26, flex: '0 0 26px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/cw-icon.png"
        alt="Centrifuge World"
        style={{ height: 26, width: 26, aspectRatio: '147 / 148', objectFit: 'contain', display: 'block' }}
      />
    </span>
  )
}
