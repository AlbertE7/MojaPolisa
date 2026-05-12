import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/utils'
import { sendApplicationEmails } from '@/lib/email/applications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = getClientIp(req.headers)

    const supabase = createSupabaseAdminClient()

    const { personal, ank, ankMeta, medical, beneficiaries, consents, product, calculatorData } = body
    if (!personal || !ank || !consents) {
      return NextResponse.json({ error: 'Niekompletny wniosek' }, { status: 400 })
    }

    // 1. Utwórz lub znajdź klienta po emailu/PESEL
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', personal.email)
      .maybeSingle()

    let clientId: string
    if (existing) {
      clientId = existing.id
      await supabase.from('clients').update({
        first_name: personal.first_name,
        last_name: personal.last_name,
        phone: personal.phone,
        birth_date: personal.birth_date,
        gender: personal.gender,
        pesel_type: personal.pesel_type,
        address: {
          street: personal.street,
          house_number: personal.house_number,
          apartment_number: personal.apartment_number,
          postal_code: personal.postal_code,
          city: personal.city,
        },
      }).eq('id', clientId)
    } else {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          first_name: personal.first_name,
          last_name: personal.last_name,
          email: personal.email,
          phone: personal.phone,
          birth_date: personal.birth_date,
          gender: personal.gender,
          pesel_type: personal.pesel_type,
          pesel: personal.pesel,  // TODO: w produkcji szyfrować przez encrypt_sensitive() funkcję SQL
          address: {
            street: personal.street,
            house_number: personal.house_number,
            apartment_number: personal.apartment_number,
            postal_code: personal.postal_code,
            city: personal.city,
          },
        })
        .select('id')
        .single()
      if (error) throw error
      clientId = newClient.id
    }

    // 2. Zapisz wniosek
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .insert({
        client_id: clientId,
        product_type: product,
        form_data: { personal, beneficiaries, calculatorData, consents },
        ank_data: ank,
        medical_data: medical ?? null,
        status: 'submitted',
        ip_address: ip,
      })
      .select('id')
      .single()
    if (appErr) throw appErr

    // 3. Zapisz rekord ANK (wymóg IDD)
    await supabase.from('ank_records').insert({
      client_id: clientId,
      application_id: app.id,
      product_type: product,
      answers: ank,
      accepted_at: ankMeta?.acceptedAt ?? new Date().toISOString(),
      ip_address: ip,
    })

    // 4. Wyślij emaile (client + agent)
    await sendApplicationEmails({
      clientId, applicationId: app.id, product, personal,
      beneficiaries, ank, medical, calculatorData, consents,
    })

    // 5. Powiadom agenta przez push (placeholder)
    // await sendPushToAgent(...)

    return NextResponse.json({ success: true, applicationId: app.id, clientId })
  } catch (err) {
    console.error('[applications] error', err)
    return NextResponse.json({ error: 'Błąd serwera. Spróbuj ponownie.' }, { status: 500 })
  }
}
