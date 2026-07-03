// Honeypot: a hidden field bots tend to fill. Server-side validation rejects any
// submission where this is non-empty (Cycle 2 forms engine). Hidden from AT and
// keyboard, off-screen (not display:none so some bots still see it).
export function Honeypot({ name = 'company_website' }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={name}>Leave this field empty</label>
      <input id={name} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
}
