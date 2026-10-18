// Runs automatically after every verified Netlify Forms submission.
//
// 1. Newsletter signups ("vip-newsletter"), Off-Market Access step 1 ("off-market-access")
//    and Relocation Playbook requests ("relocation-playbook")
//    go to the Zapier Catch Hook that adds/updates the subscriber in Mailchimp.
//    Env: ZAPIER_NEWSLETTER_WEBHOOK_URL
// 2. Every lead form (see LEAD_FORMS) also goes to the lead-routing Catch Hook, which writes the
//    Master Lead Log, creates the Compass CRM contact, tags Mailchimp, sends the instant text
//    (only when sms_consent = Yes) and alerts Jason.
//    Env: ZAPIER_LEADS_WEBHOOK_URL
const NEWSLETTER_FORMS = new Set(['vip-newsletter', 'off-market-access', 'relocation-playbook'])
const LEAD_FORMS: Record<string, string> = {
  'off-market-access': 'Buyer',
  'access-match': 'Buyer',
  'relocation-playbook': 'Relocation',
}

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

  if (NEWSLETTER_FORMS.has(form)) {
    const webhook = Netlify.env.get('ZAPIER_NEWSLETTER_WEBHOOK_URL')
    if (webhook) {
      jobs.push(post(webhook, {
        email,
        first_name: clean(data.first_name),
        last_name: clean(data.last_name),
        area_of_interest: data.area_of_interest || 'All of Middle Tennessee',
        price_point: data.price_point || 'Any price',
        timeline: data.timeline || 'Just exploring',
        source: data.source || 'Website',
        submitted_at,
      }, 'Newsletter'))
    } else {
      console.warn('ZAPIER_NEWSLETTER_WEBHOOK_URL is not set; signup kept in Netlify Forms only')
    }
  }

  if (form in LEAD_FORMS) {
    const webhook = Netlify.env.get('ZAPIER_LEADS_WEBHOOK_URL')
    if (webhook) {
      jobs.push(post(webhook, {
        form,
        lane: clean(data.lane) || LEAD_FORMS[form],
        email,
        first_name: clean(data.first_name),
        last_name: clean(data.last_name),
        phone: clean(data.phone),
        sms_consent: clean(data.sms_consent) === 'Yes' ? 'Yes' : 'No',
        timeline: clean(data.timeline),
        timeline_stated_on: submitted_at.slice(0, 10),
        price_range: clean(data.price_range),
        areas: clean(data.areas),
        moving_from: clean(data.moving_from),
        financing: clean(data.financing),
        has_agent: clean(data.has_agent),
        source: clean(data.source) || 'Website',
        utm_campaign: clean(data.utm_campaign),
        submitted_at,
      }, 'Leads'))
    } else {
      console.warn('ZAPIER_LEADS_WEBHOOK_URL is not set; lead kept in Netlify Forms only')
    }
  }

  if (!jobs.length) return new Response('ignored')
  const results = await Promise.all(jobs)
  return results.every(Boolean) ? new Response('forwarded') : new Response('webhook failed', { status: 502 })
}
