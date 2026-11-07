// /.netlify/functions/subscribe: the Friday List signup on /newsletter/.
//
// 1. Adds the email to the Mailchimp audience right away (or updates an existing subscriber) and
//    tags it. Someone who unsubscribed is never re-subscribed.
// 2. Also forwards the signup to the "NLL lead routing" Zap (ZAPIER_LEADS_WEBHOOK_URL), the same way
//    every other signup form on the site does, so it lands in the NLL Master Lead Log and starts the
//    welcome sequence:
//      - the email step goes as "vip-newsletter" (the newsletter form name the Zap already knows)
//      - the optional preferences step goes as "access-match" (timeline, price, areas), which the
//        Zap turns into a Compass CRM lead and an email alert to Jason, as /access/ step 2 did
//
// Environment: MAILCHIMP_API_KEY (required). MAILCHIMP_LIST_ID is optional; it defaults to the
// "Nashville Luxury List" audience.
//
// Accepts JSON (from the page script) or a plain form POST (visitors without JavaScript and AI
// agents), which is redirected back to the page.
import crypto from 'node:crypto'

const DEFAULT_LIST_ID = 'd6723831c0' // "Nashville Luxury List" audience
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Only these values can become tags, so nobody can write arbitrary tags into the audience.
const AREAS = ['Belle Meade', 'Green Hills', 'Forest Hills', 'Oak Hill', 'Brentwood', 'Franklin',
  "Leiper's Fork and College Grove", '12 South and Downtown', 'All of Middle Tennessee']
const PRICES = ['$1.5M to $2M', '$2M to $3M', '$3M to $5M', '$5M+']
const TIMELINES = ['Just watching', '0 to 3 months', '3 to 12 months', '12+ months']

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

async function forwardToZap(body: Record<string, unknown>) {
  const url = Netlify.env.get('ZAPIER_LEADS_WEBHOOK_URL')
  if (!url) return console.warn('ZAPIER_LEADS_WEBHOOK_URL is not set; signup sent to Mailchimp only')
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) console.error(`Leads webhook responded ${res.status}`)
  } catch (e) {
    console.error('Leads webhook failed', e)
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const isForm = (req.headers.get('content-type') || '').includes('application/x-www-form-urlencoded')
  let data: Record<string, any> = {}
  try {
    data = isForm ? Object.fromEntries(new URLSearchParams(await req.text())) : await req.json()
  } catch {
    return json({ error: 'Bad request' }, 400)
  }
  if (!data || typeof data !== 'object') return json({ error: 'Bad request' }, 400)

  const back = (q: string) => Response.redirect(new URL(`/newsletter/?${q}#join`, req.url).toString(), 303)

  // Honeypot: bots fill the hidden "company" field. Pretend it worked.
  if (data.company) return isForm ? back('joined=1') : json({ ok: true })

  const email = String(data.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return isForm ? back('error=email') : json({ error: 'Invalid email' }, 400)
  }

  const key = (Netlify.env.get('MAILCHIMP_API_KEY') || '').trim()
  const list = (Netlify.env.get('MAILCHIMP_LIST_ID') || '').trim() || DEFAULT_LIST_ID
  if (!key.includes('-')) {
    console.error('MAILCHIMP_API_KEY is not set')
    return isForm ? back('error=save') : json({ error: 'Signup is not configured yet' }, 500)
  }

  const dc = key.split('-').pop()
  const hash = crypto.createHash('md5').update(email).digest('hex')
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${list}/members/${hash}`
  const headers = {
    Authorization: 'Basic ' + Buffer.from('nll:' + key).toString('base64'),
    'Content-Type': 'application/json',
  }

  // Upsert: new emails are subscribed; existing subscribers are updated; anyone who unsubscribed
  // stays unsubscribed (status_if_new only applies to new members).
  const fname = String(data.fname || data.first_name || '').trim().slice(0, 50)
  const member: Record<string, unknown> = { email_address: email, status_if_new: 'subscribed' }
  if (fname) member.merge_fields = { FNAME: fname }

  const put = await fetch(base, { method: 'PUT', headers, body: JSON.stringify(member) })
  if (!put.ok) {
    const detail = await put.json().catch(() => ({}))
    console.error('Mailchimp upsert failed', put.status, detail.title, detail.detail)
    return isForm ? back('error=save') : json({ error: 'Could not save' }, 502)
  }

  // Tags
  const isPrefs = data.step === 'prefs'
  const tags = ['Friday List signup']
  const src = String(data.source || '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 30)
  if (!isPrefs && src) tags.push(`Source: ${src}`)
  const areas = (Array.isArray(data.areas) ? data.areas : []).filter((a: unknown) => AREAS.includes(a as string)) as string[]
  areas.forEach((a) => tags.push(`Area: ${a}`))
  const price = PRICES.includes(data.price) ? data.price : ''
  const timeline = TIMELINES.includes(data.timeline) ? data.timeline : ''
  const relocating = data.relocating === true || data.relocating === 'true'
  if (price) tags.push(`Price: ${price}`)
  if (timeline) tags.push(`Timeline: ${timeline}`)
  if (relocating) tags.push('Relocating')

  const tagRes = await fetch(`${base}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: tags.map((name) => ({ name, status: 'active' })) }),
  })
  if (!tagRes.ok) console.error('Mailchimp tagging failed', tagRes.status)

  // Lead log, welcome sequence and (for preferences) the CRM lead, via the existing Zap.
  const submitted_at = new Date().toISOString()
  if (!isPrefs) {
    await forwardToZap({
      form: 'vip-newsletter', lane: 'Buyer', email, first_name: fname, last_name: '', phone: '', sms_consent: 'No',
      timeline: '', timeline_stated_on: '', price_range: '', areas: '', address: '', goal: '', message: '',
      moving_from: '', financing: '', has_agent: '',
      source: `Friday List page${src ? ` – ${src}` : ''}`, utm_campaign: '', playbook_url: '', submitted_at,
    })
  } else if (areas.length || price || (timeline && timeline !== 'Just watching') || relocating) {
    await forwardToZap({
      form: 'access-match', lane: relocating ? 'Relocation' : 'Buyer', email, first_name: fname, last_name: '',
      phone: '', sms_consent: 'No', timeline, timeline_stated_on: timeline ? submitted_at.slice(0, 10) : '',
      price_range: price, areas: areas.join(', '), address: '', goal: '',
      message: relocating ? 'Relocating to Nashville' : '', moving_from: '', financing: '', has_agent: '',
      source: 'Friday List page – preferences', utm_campaign: '', playbook_url: '', submitted_at,
    })
  }

  return isForm ? back('joined=1') : json({ ok: true })
}
