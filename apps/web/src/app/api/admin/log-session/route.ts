import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { email, success } = await req.json()
    const supabase = createSupabaseAdminClient()
    await supabase.from('admin_sessions').insert({
      email, success: !!success,
      ip_address: getClientIp(req.headers),
      user_agent: req.headers.get('user-agent') ?? '',
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[log-session]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
