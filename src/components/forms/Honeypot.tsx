// Honeypot: a hidden field bots tend to fill. Server-side validation rejects any submission
// where this is non-empty. The field name is deliberately NOT autofill-attractive — a name like
// "company_website" gets cascade-filled by Chrome/Safari/password-manager autofill, which
// silently dropped real leads as "spam". It also carries the standard password-manager ignore
// hints. Off-screen (not display:none) so some bots still see it.
export function Honeypot({ name = 'contact_time' }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={name}>Leave this field empty</label>
      <input
        id={name}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
      />
    </div>
  )
}
