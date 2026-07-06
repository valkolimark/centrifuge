// Compact brand mark shown in the admin breadcrumb/topbar — the CW globe favicon.
// Fixed aspect ratio + object-fit so it can never squish, regardless of the slot.
export default function Icon() {
  return (
    // Fill whatever slot Payload places this in (e.g. the 16px breadcrumb home link) rather
    // than forcing a fixed 26px, which overflowed and clipped on the header row. Capped so it
    // never balloons in a larger slot; object-fit keeps the globe's aspect ratio.
    <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', maxWidth: 26, maxHeight: 26 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/cw-icon.png"
        alt="Centrifuge World"
        style={{ width: '100%', height: '100%', aspectRatio: '147 / 148', objectFit: 'contain', display: 'block' }}
      />
    </span>
  )
}
