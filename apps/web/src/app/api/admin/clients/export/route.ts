import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email, phone, pesel_type, created_at')
    .order('created_at', { ascending: false })

  const header = 'id,first_name,last_name,email,phone,pesel_type,created_at'
  const rows = (data ?? []).map((c) =>
    [c.id, c.first_name, c.last_name, c.email, c.phone, c.pesel_type, c.created_at]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="klienci-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
