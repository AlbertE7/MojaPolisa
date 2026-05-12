import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/admin/logowanie', req.url))

  const form = await req.formData()
  const clientId = String(form.get('client_id') ?? '')
  const sender = String(form.get('sender') ?? 'agent') as 'client' | 'agent'
  const content = String(form.get('content') ?? '').trim()

  if (!clientId || !content) {
    return NextResponse.redirect(new URL(`/admin/klienci/${clientId}?tab=czat`, req.url))
  }

  const isAdmin = user.app_metadata?.role === 'admin'
  const admin = createSupabaseAdminClient()

  await admin.from('chat_messages').insert({
    client_id: clientId,
    sender: isAdmin ? 'agent' : 'client',
    content,
    read: false,
  })

  // Powiadomienie klienta (jeśli wysłano przez agenta)
  if (isAdmin) {
    await admin.from('notifications').insert({
      client_id: clientId,
      type: 'chat_message',
      title: 'Masz nową wiadomość od agenta',
      body: content.slice(0, 120),
    })
  }

  const redirectUrl = isAdmin
    ? `/admin/klienci/${clientId}?tab=czat`
    : `/czat`
  return NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 })
}
