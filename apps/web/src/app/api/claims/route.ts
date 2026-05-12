import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { sendEmail, AGENT_EMAIL } from '@/lib/email/resend'
import { shell, fieldRow, fieldTable } from '@/lib/email/templates'
import { getClientIp } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = createSupabaseAdminClient()
  const ip = getClientIp(req.headers)

  // Powiązanie z klientem
  const { data: link } = await admin.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  if (!link) return NextResponse.json({ error: 'No client account' }, { status: 403 })

  const { data: policy } = await admin
    .from('policies')
    .select('id, product_type, policy_number, status_history, clients(first_name,last_name,email,phone)')
    .eq('id', body.policy_id)
    .maybeSingle()

  if (!policy) return NextResponse.json({ error: 'Policy not found' }, { status: 404 })

  // Zmień status na "claim_in_progress"
  const now = new Date().toISOString()
  const history = Array.isArray(policy.status_history) ? policy.status_history : []
  await admin
    .from('policies')
    .update({
      status: 'claim_in_progress',
      status_history: [...history, { status: 'claim_in_progress', changed_at: now, note: `Zgłoszenie szkody przez klienta. IP: ${ip}` }],
    })
    .eq('id', policy.id)

  const client = (policy.clients as any) ?? {}
  const productLabel = PRODUCT_LABELS[policy.product_type as ProductType]
  const fullName = `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()

  // Email do klienta (potwierdzenie)
  await sendEmail({
    to: client.email,
    subject: `Potwierdzenie zgłoszenia szkody – ${productLabel}`,
    html: shell('Zgłoszenie szkody przyjęte', `
      <h1 style="font-size:22px;color:#1e3a8a">Zgłoszenie szkody przyjęte</h1>
      <p>Cześć ${client.first_name},</p>
      <p>Twoje zgłoszenie zostało zarejestrowane. Agent skontaktuje się z Tobą w ciągu 24h.</p>
      ${fieldTable(
        fieldRow('Polisa', `${productLabel} ${policy.policy_number ? `(${policy.policy_number})` : ''}`) +
        fieldRow('Data zdarzenia', body.event_date) +
        fieldRow('Miejsce', body.event_place) +
        fieldRow('Telefon kontaktowy', body.contact_phone) +
        fieldRow('Status polisy', 'Szkoda w toku')
      )}
    `),
  })

  // Email do agenta (pełne dane)
  await sendEmail({
    to: AGENT_EMAIL,
    subject: `🚨 ZGŁOSZENIE SZKODY – ${fullName} – ${productLabel}`,
    html: shell('Zgłoszenie szkody', `
      <h1 style="font-size:22px;color:#dc2626">🚨 Zgłoszenie szkody</h1>
      <p>Klient zgłosił szkodę. Skontaktuj się z nim w ciągu 24h.</p>
      ${fieldTable(
        fieldRow('Klient', fullName) +
        fieldRow('Email', client.email) +
        fieldRow('Telefon kontaktowy', body.contact_phone) +
        fieldRow('Polisa', `${productLabel} ${policy.policy_number ? `(${policy.policy_number})` : ''}`) +
        fieldRow('Data zdarzenia', body.event_date) +
        fieldRow('Miejsce', body.event_place) +
        fieldRow('Konto do przelewu', body.bank_account) +
        fieldRow('IP zgłoszenia', ip)
      )}
      <h3 style="margin-top:24px;color:#1e3a8a">Opis zdarzenia</h3>
      <p style="background:#f9fafb;padding:12px;border-radius:6px;white-space:pre-wrap">${(body.description ?? '').replace(/[<>&"]/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c))}</p>
    `),
    replyTo: client.email,
  })

  // Powiadomienie
  await admin.from('notifications').insert({
    client_id: link.client_id,
    type: 'claim_submitted',
    title: 'Zgłoszenie szkody przyjęte',
    body: `Twoje zgłoszenie szkody zostało zarejestrowane. Status: Szkoda w toku.`,
  })

  return NextResponse.json({ ok: true })
}
