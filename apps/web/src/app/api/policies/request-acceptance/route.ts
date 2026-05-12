import { NextResponse, type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { sendEmail } from '@/lib/email/resend'
import { shell, button } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { policyId } = await req.json()
  const admin = createSupabaseAdminClient()

  // Sprawdź czy polisa należy do zalogowanego usera
  const { data: link } = await admin.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  if (!link) return NextResponse.json({ error: 'No client account' }, { status: 403 })

  const { data: policy } = await admin
    .from('policies')
    .select('id, client_id, product_type, status, policy_number, clients(email, first_name)')
    .eq('id', policyId)
    .maybeSingle()

  if (!policy || policy.client_id !== link.client_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (policy.status !== 'ready') {
    return NextResponse.json({ error: 'Policy is not in ready state' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')
  await admin.from('policy_acceptance_intents').insert({
    policy_id: policy.id, client_id: policy.client_id, token,
    email_sent_at: new Date().toISOString(),
  })

  const client = (policy.clients as any) ?? {}
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://finvita.pl'
  const acceptUrl = `${appUrl}/akceptacja/${token}`
  const productLabel = PRODUCT_LABELS[policy.product_type as ProductType]

  await sendEmail({
    to: client.email,
    subject: `Akceptacja polisy ${productLabel}`,
    html: shell('Akceptacja polisy', `
      <h1 style="font-size:22px;color:#1e3a8a">Akceptacja polisy</h1>
      <p>Cześć ${client.first_name},</p>
      <p>Aby zaakceptować polisę <strong>${productLabel}</strong> (nr ${policy.policy_number ?? '—'}), kliknij przycisk poniżej.</p>
      <div style="margin:24px 0">${button(acceptUrl, '✓ Zaakceptuj polisę')}</div>
      <p style="font-size:12px;color:#6b7280">Link wygasa za 7 dni. Po Twojej akceptacji agent ustawi finalny status polisy w systemie.</p>
    `),
  })

  return NextResponse.json({ ok: true })
}
