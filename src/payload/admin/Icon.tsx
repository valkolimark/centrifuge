// Compact brand mark shown in the admin nav header. A centrifuge-rotor motif
// (concentric rings + bowl) in Industrial Blue.
export default function Icon() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-label="Centrifuge World" role="img">
      <rect width="40" height="40" rx="9" fill="#0B3A6B" />
      <circle cx="20" cy="20" r="12" stroke="#1E6FD9" strokeWidth="2" opacity="0.7" />
      <circle cx="20" cy="20" r="7.5" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="20" cy="20" r="2.4" fill="#F26A1B" />
      <path d="M20 4.5v5M20 30.5v5M4.5 20h5M30.5 20h5" stroke="#1E6FD9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
