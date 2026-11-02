// IndexNow: tells Bing (which feeds ChatGPT search and Copilot), Yandex, Seznam, Naver and Yep about new,
// changed and removed pages right after each production deploy, so they're recrawled the same day instead
// of whenever the crawler next comes by. That includes the weekly newsletter posts the Mailchimp import
// publishes and the record pages rebuilt from Compass.
//
// How it works: after a production deploy succeeds, it reads the live sitemap, fetches every page and
// fingerprints it (SHA-256 of the HTML). Fingerprints from the last successful submission are kept in
// Netlify Blobs, so only pages that are new, changed or gone from the sitemap are submitted. The first run
// submits every page. If IndexNow rejects the request, the fingerprints aren't saved and the same pages are
// retried on the next deploy.
//
// The key below is public by design: IndexNow checks it against the key file at the site root
// (/39f9dcd187fa411e825c44e589a27502.txt). To rotate it, rename that file and change KEY.
import { getStore } from '@netlify/blobs'
import type { DeploySucceededEvent } from '@netlify/functions'

const SITE = 'https://www.nashvilleluxurylist.com'
const HOST = new URL(SITE).host
const KEY = '39f9dcd187fa411e825c44e589a27502'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MANIFEST = 'manifest'

type Manifest = { updated: string; pages: Record<string, string> }

const sha256 = async (text: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

const get = (url: string) =>
  fetch(url, { headers: { 'User-Agent': 'NashvilleLuxuryList-IndexNow/1.0' }, signal: AbortSignal.timeout(10_000) })

export async function sitemapUrls(): Promise<string[]> {
  const res = await get(`${SITE}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
  return [...new Set(urls)].filter((u) => new URL(u).host === HOST)
}

// Fingerprints each page; pages that fail to load are left out so they're retried next time.
export async function fingerprints(urls: string[], concurrency = 8): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const queue = [...urls]
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const res = await get(url)
        if (res.ok) out[url] = await sha256(await res.text())
        else console.warn(`IndexNow: ${url} returned ${res.status}; skipped`)
      } catch (e) {
        console.warn(`IndexNow: ${url} failed (${(e as Error).message}); skipped`)
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return out
}

export function changedUrls(previous: Record<string, string>, current: Record<string, string>, sitemap: string[]) {
  const changed = Object.keys(current).filter((u) => previous[u] !== current[u])
  const removed = Object.keys(previous).filter((u) => !sitemap.includes(u))
  return { changed, removed }
}

export async function submit(urlList: string[]) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(20_000),
  })
  return { ok: res.status === 200 || res.status === 202, status: res.status, body: await res.text().catch(() => '') }
}

export default {
  async deploySucceeded(event: DeploySucceededEvent) {
    // Only live production deploys of the main site. Deploy previews, branch deploys and the
    // jasonkloess.nashvilleluxurylist.com project (built from this same repo) are skipped.
    if (event.deploy.context !== 'production') return
    const siteHost = event.site?.url ? new URL(event.site.url).host : ''
    if (siteHost && siteHost !== HOST) return

    const store = getStore({ name: 'indexnow', consistency: 'strong' })
    const previous = ((await store.get(MANIFEST, { type: 'json' })) as Manifest | null)?.pages ?? {}
    const sitemap = await sitemapUrls()
    const current = await fingerprints(sitemap)
    const { changed, removed } = changedUrls(previous, current, sitemap)
    const urlList = [...changed, ...removed].slice(0, 10_000)

    if (!urlList.length) {
      console.log(`IndexNow: no page changes in deploy ${event.deploy.id}`)
      return
    }
    const result = await submit(urlList)
    if (!result.ok) {
      console.error(`IndexNow: submission rejected (${result.status}) ${result.body.slice(0, 300)}; will retry next deploy`)
      return
    }
    // Keep fingerprints for pages that loaded; carry over old ones for pages that didn't, so they aren't
    // reported as changed again just because one fetch failed.
    const pages: Record<string, string> = {}
    for (const u of sitemap) if (current[u] ?? previous[u]) pages[u] = current[u] ?? previous[u]
    await store.setJSON(MANIFEST, { updated: new Date().toISOString(), pages } satisfies Manifest)
    console.log(`IndexNow: submitted ${changed.length} new/changed and ${removed.length} removed URLs (HTTP ${result.status})`)
  },
}
