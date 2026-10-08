// Runs after every verified Netlify Forms submission (alongside submission-created.mts).
// Buyer/Seller Guide leads from the jasonkloess.nashvilleluxurylist.com landing page
// ("buyer-guide-lead" / "seller-guide-lead" forms) are forwarded to the Compass CRM via Zapier.
//
// Set ZAPIER_CRM_WEBHOOK_URL in the site's environment variables to point at a different Zap.

export default {
  async formSubmitted(event: { data: Record<string, string> }) {
    const data = event.data ?? {}
    const type = data.lead_type
    if (type !== 'buyer' && type !== 'seller') return

    const webhook =
      Netlify.env.get('ZAPIER_CRM_WEBHOOK_URL') || 'https://hooks.zapier.com/hooks/catch/25124451/4m7pk3q/'

    const name = String(data.name ?? '').trim()
    const guide = type === 'buyer' ? 'Buyer' : 'Seller'
    const lead = {
      firstName: name.split(/\s+/)[0] || '',
      lastName: name.split(/\s+/).slice(1).join(' '),
      email: String(data.email ?? '').trim(),
      source: `Nashville Luxury List – ${guide} Guide`,
      tags: [`${type}-lead`, 'instagram-bio'],
      note: `Lead captured via jasonkloess.nashvilleluxurylist.com landing page. Downloaded ${guide} Guide.`,
      submittedAt: new Date().toISOString(),
    }
    if (!lead.email) return

    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    })
    if (!res.ok) console.error(`Zapier CRM webhook responded ${res.status}`)
  },
}
