import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

/**
 * Rejestracja tokena FCM klienta.
 * W produkcji rozszerz schema o tabelę push_tokens (client_id, token, platform, created_at).
 * Tu stub – zapisuje token w notifications jako event 'token_registered'.
 */

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { data: link } = await admin.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  if (link) {
    await admin.from('notifications').insert({
      client_id: link.client_id,
      type: 'token_registered',
      title: 'Push aktywny',
      body: `Token: ${token.slice(0, 16)}...`,
    })
  }

  return NextResponse.json({ ok: true })
}
