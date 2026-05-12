import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient()

  const [
    { count: totalClients },
    { count: activePolicies },
    { count: todayApplications },
    { count: unreadMessages },
    { count: activeClaims },
    { count: expiringSoon },
    { data: recentApps },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('applications').select('*', { count: 'exact', head: true })
      .gte('submitted_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true })
      .eq('read', false).eq('sender', 'client'),
    supabase.from('policies').select('*', { count: 'exact', head: true }).eq('status', 'claim_in_progress'),
    supabase.from('policies').select('*', { count: 'exact', head: true })
      .lte('end_date', new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10))
      .eq('status', 'active'),
    supabase.from('applications')
      .select('id, product_type, status, submitted_at, client_id, clients(first_name,last_name,email)')
      .order('submitted_at', { ascending: false }).limit(10),
  ])

  const stats = [
    { label: 'Klienci', value: totalClients ?? 0, icon: '👥', href: '/admin/klienci' },
    { label: 'Aktywne polisy', value: activePolicies ?? 0, icon: '🛡️', href: '/admin/klienci?status=active' },
    { label: 'Wnioski dzisiaj', value: todayApplications ?? 0, icon: '📋', href: '/admin/wnioski' },
    { label: 'Nieprzeczytane wiadomości', value: unreadMessages ?? 0, icon: '💬', href: '/admin/czat', urgent: (unreadMessages ?? 0) > 0 },
    { label: 'Szkody w toku', value: activeClaims ?? 0, icon: '🚨', href: '/admin/klienci?status=claim_in_progress', urgent: (activeClaims ?? 0) > 0 },
    { label: 'Kończą się w 30 dni', value: expiringSoon ?? 0, icon: '⏰', href: '/admin/klienci?status=expiring', urgent: (expiringSoon ?? 0) > 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Dashboard</h1>
        <p className="text-sm text-gray-600">Przegląd aktywności w systemie.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`card-hover ${s.urgent ? 'ring-2 ring-orange-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{s.icon}</span>
              <span className={`text-3xl font-bold ${s.urgent ? 'text-orange-600' : 'text-brand-700'}`}>{s.value}</span>
            </div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-brand-700 mb-4">Najnowsze wnioski</h2>
        {!recentApps || recentApps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Brak wniosków.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="py-2">Klient</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Produkt</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Złożono</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{a.clients?.first_name} {a.clients?.last_name}</td>
                    <td className="py-3 text-gray-600">{a.clients?.email}</td>
                    <td className="py-3 text-xs">{PRODUCT_LABELS[a.product_type as ProductType] ?? a.product_type}</td>
                    <td className="py-3"><span className="badge-submitted">{a.status}</span></td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(a.submitted_at).toLocaleString('pl-PL')}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/klienci/${a.client_id}`} className="text-brand-600 text-xs font-semibold hover:underline">Otwórz →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
