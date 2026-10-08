// Runs automatically after every verified Netlify Forms submission.
// Newsletter signups ("vip-newsletter") are forwarded to a Zapier Catch Hook,
// whose Zap adds/updates the subscriber in Mailchimp.
//
// Set ZAPIER_NEWSLETTER_WEBHOOK_URL in the site's environment variables.
export default async (req: Request) => {
  const { payload } = await req.json()
  if (payload?.form_name !== 'vip-newsletter') return new Response('ignored')

  const webhook = Netlify.env.get('ZAPIER_NEWSLETTER_WEBHOOK_URL')
  if (!webhook) {
    console.warn('ZAPIER_NEWSLETTER_WEBHOOK_URL is not set; newsletter signup kept in Netlify Forms only')
    return new Response('no webhook configured')
  }

  const data = payload.data ?? {}
  const subscriber = {
    email: String(data.email ?? payload.email ?? '').trim().toLowerCase(),
    first_name: String(data.first_name ?? '').trim(),
    last_name: String(data.last_name ?? '').trim(),
    area_of_interest: data.area_of_interest || 'All of Middle Tennessee',
    price_point: data.price_point || 'Any price',
    timeline: data.timeline || 'Just exploring',
    source: data.source || 'Website',
    submitted_at: payload.created_at ?? new Date().toISOString(),
  }
  if (!subscriber.email) return new Response('missing email')

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriber),
  })
  if (!res.ok) {
    console.error(`Zapier webhook responded ${res.status}`)
    return new Response('webhook failed', { status: 502 })
  }
  return new Response('forwarded')
}
