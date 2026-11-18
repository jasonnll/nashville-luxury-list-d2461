// Runs automatically after every verified Netlify Forms submission.
//
// Every signup and lead form below is posted to the "NLL lead routing" Zap (ZAPIER_LEADS_WEBHOOK_URL).
// The Zap logs it in the NLL Master Lead Log and decides the rest by form name:
//   - vip-newsletter, off-market-access: added to Mailchimp as a new subscriber (never re-subscribes
//     someone who unsubscribed) and tagged, so the Off-Market Access welcome sequence starts
//   - access-match, relocation-playbook, home-valuation: also added to Mailchimp, plus a Compass CRM lead
//     and an email alert to Jason
//   - relocation-guide (every form on /relocation/guide/): forwarded to the Zap as "relocation-playbook", so it
//     gets the same Relocation lane: Playbook emailed, Mailchimp + relocation tag, Compass CRM lead, alert to Jason.
//     The guide page it came from is kept in `source` (e.g. "Relocation Guide – Move Math") and tool context
//     (matched neighborhoods, estimate, move date) arrives in `areas` / `message`.
//
// Music & entertainment inquiries (/music/, "music-entertainment" form) go only to the Compass CRM Zap,
// tagged by who filled it in (artist, manager, business manager, attorney...). They are never added to
// Mailchimp or the newsletter, since these clients and their teams expect discretion.
// athlete-inquiry (the /athletes/ private inquiry form) goes ONLY to the Compass CRM Zap, never to Mailchimp.
//
// Signups from the site-wide off-market popup (off-market-access with a "Popup" source) are also sent
// straight to the Compass CRM Zap (ZAPIER_CRM_WEBHOOK_URL, same Zap as guide-lead-crm.mts).
const LEAD_FORMS: Record<string, string> = {
  'vip-newsletter': 'Buyer',
  'off-market-access': 'Buyer',
  'access-match': 'Buyer',
  'relocation-playbook': 'Relocation',
  'relocation-guide': 'Relocation',
  'home-valuation': 'Seller',
  'seller-estimate': 'Seller',
}

// Forms the Zap should treat as another form it already routes (same lane, tags, Compass lead and emails)
const ZAP_FORM_ALIAS: Record<string, string> = {
  'relocation-guide': 'relocation-playbook',
  // Home value estimate + net proceeds tools: same Seller lane, home-value tag, Compass lead and alert
  'seller-estimate': 'home-valuation',
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
      const zapForm = ZAP_FORM_ALIAS[form] || form
      jobs.push(post(webhook, {
        form: zapForm,
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
        playbook_url: zapForm === 'relocation-playbook' ? PLAYBOOK_URL : '',
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

  if (form === 'music-entertainment') {
    const name = clean(data.name)
    const role = clean(data.role) || 'Unknown'
    const roleTag = role.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')
    const nda = clean(data.nda_requested) === 'Yes'
    const lines = [
      `Confidential music & entertainment inquiry from /music/.`,
      `Role: ${role}`,
      clean(data.company) && `Company: ${clean(data.company)}`,
      clean(data.client_code) && `Client / code name: ${clean(data.client_code)}`,
      clean(data.goal) && `Looking to: ${clean(data.goal)}`,
      clean(data.price_range) && `Price range: ${clean(data.price_range)}`,
      clean(data.timeline) && `Timing: ${clean(data.timeline)}`,
      clean(data.phone) && `Phone: ${clean(data.phone)}`,
      nda && `NDA REQUESTED: send before the client is named.`,
      clean(data.message) && `Notes: ${clean(data.message)}`,
      clean(data.utm_campaign) && `Campaign: ${clean(data.utm_campaign)}`,
    ].filter(Boolean)
    jobs.push(post(Netlify.env.get('ZAPIER_CRM_WEBHOOK_URL') || CRM_WEBHOOK_FALLBACK, {
      firstName: clean(data.first_name) || name.split(/\s+/)[0] || '',
      lastName: clean(data.last_name) || name.split(/\s+/).slice(1).join(' '),
      email,
      phone: clean(data.phone),
      source: 'Nashville Luxury List – Music & Entertainment',
      tags: ['music-entertainment', `role-${roleTag}`, 'confidential', ...(nda ? ['nda-requested'] : []),
             /artist|talent/i.test(role) ? 'buyer-lead' : 'referral-partner'],
      note: lines.join('\n'),
      submittedAt: submitted_at,
    }, 'Compass CRM'))
  }

  // Private inquiries from the /athletes/ page go straight to the Compass CRM Zap only. They are deliberately
  // NOT sent to the leads Zap, so they never reach Mailchimp or the shared Master Lead Log (the page promises
  // they are never added to a mailing list or shared).
  if (form === 'athlete-inquiry') {
    const first = clean(data.first_name)
    const last = clean(data.last_name)
    const need = clean(data.need)
    const lane = /sell/i.test(need) && /buy/i.test(need) ? 'buyer-seller' : /sell/i.test(need) ? 'seller' : /lease/i.test(need) && !/buy/i.test(need) ? 'lease' : 'buyer'
    const lines = [
      `PRIVATE athlete / sports-pro inquiry from nashvilleluxurylist.com/athletes/. Handle discreetly.`,
      `Role: ${clean(data.role) || '-'}`,
      `Looking to: ${need || '-'}`,
      `Timeline: ${clean(data.timeline) || '-'}`,
      `Price range: ${clean(data.price_range) || '-'}`,
      `Phone: ${clean(data.phone) || '-'}`,
      `Preferred contact: ${clean(data.contact_pref) || '-'}`,
      `NDA requested: ${clean(data.nda_requested) === 'Yes' ? 'YES' : 'No'}`,
      `SMS consent: ${clean(data.sms_consent) === 'Yes' ? 'Yes' : 'No'}`,
      clean(data.message) ? `Message: ${clean(data.message)}` : '',
      clean(data.utm_campaign) ? `Campaign: ${clean(data.utm_source)} / ${clean(data.utm_campaign)}` : '',
    ].filter(Boolean)
    jobs.push(post(Netlify.env.get('ZAPIER_CRM_WEBHOOK_URL') || CRM_WEBHOOK_FALLBACK, {
      firstName: first,
      lastName: last,
      email,
      phone: clean(data.phone),
      source: 'Nashville Luxury List – Pro Athletes Private Inquiry',
      tags: ['athlete-lead', 'private-client', `${lane}-lead`, ...(clean(data.nda_requested) === 'Yes' ? ['nda-requested'] : [])],
      note: lines.join('\n'),
      submittedAt: submitted_at,
    }, 'Compass CRM'))
  }

  if (!jobs.length) return new Response('ignored')
  const results = await Promise.all(jobs)
  return results.every(Boolean) ? new Response('forwarded') : new Response('webhook failed', { status: 502 })
}
