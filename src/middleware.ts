import { NextResponse, type NextRequest } from 'next/server'
import redirects from './lib/redirects-data.json'

// 301 redirect layer (task 1.6). Source is data/redirects.csv + generated OEM
// slugs, compiled to redirects-data.json by scripts/build-redirects.ts. In Cycle 6
// the Payload `redirects` collection becomes the editable source and re-emits it.
// Targets are already final, so every legacy URL resolves in a single 301 hop.

const map = redirects as Record<string, string>

function normalize(pathname: string): string {
  let s = pathname
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s.toLowerCase()
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const target = map[normalize(pathname)]
  if (target && normalize(target) !== normalize(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = target
    url.search = search
    return NextResponse.redirect(url, 301)
  }
  return NextResponse.next()
}

export const config = {
  // Skip Next internals, API, admin, and files with an extension.
  matcher: ['/((?!_next/|api/|admin|favicon.ico|robots.txt|sitemap|.*\\.[\\w]+$).*)'],
}
