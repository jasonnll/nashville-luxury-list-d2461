// Runs automatically after every verified Netlify Forms submission.
//
// Every signup and lead form below is posted to the "NLL lead routing" Zap (ZAPIER_LEADS_WEBHOOK_URL).
// The Zap logs it in the NLL Master Lead Log and decides the rest by form name:
//   - vip-newsletter, off-market-access: added to Mailchimp as a new subscriber (never re-subscribes
//     someone who unsubscribed) and tagged, so the Off-Market Access welcome sequence starts
//   - access-match, relocation-playbook, home-valuation: also added to Mailchimp, plus a Compass CRM lead
//     and an email alert to Jason
//
// Signups from the site-wide off-market popup (off-market-access with a "Popup" source) are also sent
// straight to the Compass CRM Zap (ZAPIER_CRM_WEBHOOK_URL, same Zap as guide-lead-crm.mts).
const LEAD_FORMS: Record<string, string> = {
  'vip-newsletter': 'Buyer',
  'off-market-access': 'Buyer',
  'access-match': 'Buyer',
  'relocation-playbook': 'Relocation',
  'home-valuation': 'Seller',
}

const CRM_WEBHOOK_FALLBACK = 'https://hooks.zapier.com/hooks/catch/25124451/4m7pk3q/'

const PLAYBOOK_URL = 'https://www.nashvilleluxurylist.com/assets/guides/nashville-relocation-playbook-2026.pdf'

const clean = (v: unknown) => String(v ?? '').trim()

async function post(url: string, body: unknown, label: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) console.error(`${label} webhook responded ${res.status}`)
  return res.ok
}

export default async (req: Request) => {
  const { payload } = await req.json()
  const form = clean(payload?.form_name)
  const data = payload?.data ?? {}
  const email = clean(data.email ?? payload?.email).toLowerCase()
  if (!email) return new Response('missing email')
  const submitted_at = payload?.created_at ?? new Date().toISOString()

  const jobs: Promise<boolean>[] = []

  if (form in LEAD_FORMS) {
    const webhook = Netlify.env.get('ZAPIER_LEADS_WEBHOOK_URL')
    if (webhook) {
      jobs.push(post(webhook, {
        form,
        lane: clean(data.lane) || LEAD_FORMS[form],
        email,
        first_name: clean(data.first_name) || clean(data.name).split(/\s+/)[0] || '',
        last_name: clean(data.last_name) || (clean(data.first_name) ? '' : clean(data.name).split(/\s+/).slice(1).join(' ')),
        phone: clean(data.phone),
        sms_consent: clean(data.sms_consent) === 'Yes' ? 'Yes' : 'No',
        timeline: clean(data.timeline),
        timeline_stated_on: submitted_at.slice(0, 10),
        price_range: clean(data.price_range) || clean(data.price_point),
        areas: clean(data.areas) || clean(data.area_of_interest),
        address: clean(data.address),
        goal: clean(data.goal),
        message: clean(data.message),
        moving_from: clean(data.moving_from),
        financing: clean(data.financing),
        has_agent: clean(data.has_agent),
        source: clean(data.source) || 'Website',
        utm_campaign: clean(data.utm_campaign),
        // Link for the Zap's "email the playbook" step on relocation-playbook leads
        playbook_url: form === 'relocation-playbook' ? PLAYBOOK_URL : '',
        submitted_at,
      }, 'Leads'))
    } else {
      console.warn('ZAPIER_LEADS_WEBHOOK_URL is not set; lead kept in Netlify Forms only')
    }
  }

  if (form === 'off-market-access' && clean(data.source).startsWith('Popup')) {
    jobs.push(post(Netlify.env.get('ZAPIER_CRM_WEBHOOK_URL') || CRM_WEBHOOK_FALLBACK, {
      firstName: clean(data.first_name),
      lastName: clean(data.last_name),
      email,
      source: 'Nashville Luxury List – Off-Market Weekly Popup',
      tags: ['buyer-lead', 'off-market-weekly', 'website-popup'],
      note: `Joined the weekly off-market email list from the website popup (${clean(data.source).replace(/^Popup – /, '') || '/'}).`,
      submittedAt: submitted_at,
    }, 'Compass CRM'))
  }

  if (!jobs.length) return new Response('ignored')
  const results = await Promise.all(jobs)
  return results.every(Boolean) ? new Response('forwarded') : new Response('webhook failed', { status: 502 })
}
