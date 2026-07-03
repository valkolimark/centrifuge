// Registered at admin.components.providers so it wraps every admin screen
// (incl. login) and injects the Industrial Blue admin theme. Importing the CSS
// here is enough — Next bundles it into the admin stylesheet.
import './brand.css'

export default function BrandProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
