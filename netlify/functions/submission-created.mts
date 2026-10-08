// Runs automatically whenever a verified Netlify Forms submission is created.
// Forwards Buyer/Seller Guide leads from /guides/ to the Compass CRM via Zapier.

interface FormPayload {
  form_name: string
  data: Record<string, string>
  created_at: string
}

const GUIDE_FORMS: Record<string, 'buyer' | 'seller'> = {
  'buyer-guide-lead': 'buyer',
  'seller-guide-lead': 'seller',
}

export default async (req: Request) => {
  const { payload } = (await req.json()) as { payload: FormPayload }
  const type = GUIDE_FORMS[payload.form_name]
  if (!type) return new Response('Ignored')

  const webhookUrl =
    process.env.ZAPIER_CRM_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/25124451/4m7pk3q/'

  const name = (payload.data.name || '').trim()
  const guide = type === 'buyer' ? 'Buyer' : 'Seller'
  const lead = {
    firstName: name.split(/\s+/)[0] || '',
    lastName: name.split(/\s+/).slice(1).join(' '),
    email: (payload.data.email || '').trim(),
    source: `Nashville Luxury List – ${guide} Guide`,
    tags: [`${type}-lead`, 'instagram-bio'],
    note: `Lead captured via nashvilleluxurylist.com landing page. Downloaded ${guide} Guide.`,
    submittedAt: payload.created_at,
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })

  if (!res.ok) {
    console.error(`Zapier CRM webhook failed: ${res.status}`)
    return new Response('CRM push failed', { status: 502 })
  }

  return new Response('OK')
}
