import { NextResponse, type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { sendEmail } from '@/lib/email/resend'
import { shell, fieldRow, fieldTable, button } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const admin = createSupabaseAdminClient()

  // 1. Utwórz polisę ze statusem "ready" (gotowa do akceptacji)
  const now = new Date().toISOString()
  const { data: policy, error } = await admin
    .from('policies')
    .insert({
      client_id: body.client_id,
      product_type: body.product_type,
      policy_number: body.policy_number,
      start_date: body.start_date,
      end_date: body.end_date,
      premium: body.premium,
      frequency: body.frequency,
      status: body.notify_client ? 'ready' : 'in_review',
      status_history: [{ status: body.notify_client ? 'ready' : 'in_review', changed_at: now, note: 'Utworzono w panelu admina' }],
      documents: body.documents ?? [],
      payment_link: body.payment_link || null,
      admin_note: body.admin_note || null,
    })
    .select('id, client_id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!body.notify_client) {
    return NextResponse.json({ success: true, policyId: policy.id })
  }

  // 2. Utwórz token akceptacji (Moduł 3 update – akceptacja przez email)
  const token = randomBytes(32).toString('hex')
  await admin.from('policy_acceptance_intents').insert({
    policy_id: policy.id, client_id: policy.client_id, token,
    email_sent_at: now,
  })

  // 3. Pobierz klienta
  const { data: client } = await admin
    .from('clients').select('first_name, last_name, email').eq('id', policy.client_id).maybeSingle()
  if (!client) return NextResponse.json({ success: true, policyId: policy.id, warning: 'client not found' })

  // 4. Wyślij email do klienta z linkiem akceptacji
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://finvita.pl'
  const acceptUrl = `${appUrl}/akceptacja/${token}`
  const productLabel = PRODUCT_LABELS[body.product_type as ProductType]

  const html = shell(
    'Twoja polisa jest gotowa',
    `
      <h1 style="font-size:22px;color:#1e3a8a;margin:0 0 12px">🎉 Twoja polisa jest gotowa</h1>
      <p style="font-size:14px">Cześć ${client.first_name},</p>
      <p style="font-size:14px">
        Przygotowaliśmy dla Ciebie polisę <strong>${productLabel}</strong>.
        Aby ją zaakceptować, kliknij poniższy przycisk. Po Twojej akceptacji agent
        ustawi finalny status polisy.
      </p>
      <div style="margin:24px 0">${button(acceptUrl, '✓ Zaakceptuj polisę')}</div>

      <h2 style="font-size:16px;color:#1e3a8a;margin:24px 0 8px">Szczegóły polisy</h2>
      ${fieldTable(
        fieldRow('Produkt', productLabel) +
        fieldRow('Numer polisy', body.policy_number) +
        fieldRow('Okres ochrony', `${body.start_date} → ${body.end_date}`) +
        fieldRow('Składka', `${body.premium} PLN (${body.frequency})`)
      )}

      ${body.admin_note ? `<p style="background:#fef3c7;padding:12px;border-radius:6px;font-size:13px;margin:16px 0"><strong>Notatka:</strong> ${body.admin_note}</p>` : ''}
      ${body.payment_link ? `<p style="font-size:13px">Link do płatności: <a href="${body.payment_link}" style="color:#1e3a8a">${body.payment_link}</a></p>` : ''}

      <p style="font-size:11px;color:#6b7280;margin-top:24px">
        Link akceptacji jest ważny 7 dni. Jeśli nie składałeś(aś) wniosku, zignoruj tę wiadomość.
      </p>
    `
  )

  await sendEmail({
    to: client.email,
    subject: `🎉 Twoja polisa ${productLabel} jest gotowa`,
    html,
  })

  // 5. Dodaj powiadomienie w aplikacji
  await admin.from('notifications').insert({
    client_id: policy.client_id,
    type: 'policy_ready',
    title: 'Twoja polisa jest gotowa',
    body: `${productLabel} czeka na Twoją akceptację. Sprawdź swój email.`,
  })

  return NextResponse.json({ success: true, policyId: policy.id, acceptToken: token })
}
