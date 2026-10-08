// jasonkloess.nashvilleluxurylist.com and www.nashvilleluxurylist.com are two Netlify projects
// built from this same repo. On the jasonkloess subdomain, the homepage is the lead-gen landing
// page in /jasonkloess/ instead of the main site's homepage. Every other host passes through.
import type { Config } from '@netlify/edge-functions'

const LANDING_HOST = 'jasonkloess.nashvilleluxurylist.com'

// Same policy as netlify.toml, plus the Calendly booking embed used on the landing page.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://fonts.googleapis.com https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
  'frame-src https://calendly.com',
  "frame-ancestors 'none'",
].join('; ')

export default async (req: Request) => {
  const url = new URL(req.url)
  if (url.hostname !== LANDING_HOST) return
  if (req.method !== 'GET' && req.method !== 'HEAD') return

  // /jasonkloess/ isn't on this function's path, so this fetch goes straight to the static page.
  const res = await fetch(new URL('/jasonkloess/', url), { method: req.method, headers: req.headers })
  const headers = new Headers(res.headers)
  headers.set('Content-Security-Policy', CSP)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  return new Response(res.body, { status: res.status, headers })
}

export const config: Config = {
  path: ['/', '/index.html'],
}
