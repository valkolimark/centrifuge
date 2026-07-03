// Server-side Cloudflare Turnstile verification (task 2.1). When the secret key is
// absent (Cycle 1/2 placeholder env), verification is skipped in non-production so
// forms remain testable; in production a missing/failed token is rejected.
export async function verifyTurnstile(token: string | undefined, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // Not configured: allow outside production, block in production.
    return process.env.NODE_ENV !== 'production'
  }
  if (!token) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
