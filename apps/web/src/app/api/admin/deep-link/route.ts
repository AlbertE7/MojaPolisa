import { NextResponse, type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId } = await req.json()
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 48 * 3600 * 1000).toISOString()

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('clients')
    .update({ deep_link_token: token, deep_link_expires: expires })
    .eq('id', clientId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://finvita.pl'}/mojapolisa?token=${token}`
  return NextResponse.json({ url, expires })
}
