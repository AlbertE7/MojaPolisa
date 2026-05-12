import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/logowanie', req.url))
  }

  const form = await req.formData()
  const note = String(form.get('note') ?? '')

  const admin = createSupabaseAdminClient()
  await admin.from('clients').update({ agent_notes: note }).eq('id', id)

  return NextResponse.redirect(new URL(`/admin/klienci/${id}?tab=notatki&saved=1`, req.url))
}
