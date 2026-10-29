// Safety net for the site favicon. Every page should carry the icon tags itself (copy them from
// index.html), but if a new page is uploaded without them, they're added here before </head>.
// Pages that already have a rel="icon" tag pass through untouched.
import type { Config, Context } from '@netlify/edge-functions'

const ICON_TAGS = [
  '<link rel="icon" href="/favicon.ico" sizes="any">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32.png">',
  '<link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon/icon-192.png">',
  '<link rel="apple-touch-icon" href="/assets/images/favicon/apple-touch-icon.png">',
].join('\n')

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') return
  const res = await context.next()
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res

  const html = await res.text()
  if (/<link[^>]+rel=["']?(shortcut )?icon/i.test(html) || !/<\/head>/i.test(html)) {
    return new Response(html, res)
  }
  const headers = new Headers(res.headers)
  headers.delete('content-length')
  return new Response(html.replace(/<\/head>/i, `${ICON_TAGS}\n</head>`), { status: res.status, headers })
}

export const config: Config = {
  path: '/*',
  excludedPath: ['/assets/*', '/images/*', '/.netlify/*', '/favicon.ico', '/*.xml', '/*.txt'],
}
