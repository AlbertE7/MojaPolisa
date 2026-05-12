import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, POLICY_STATUS_LABELS, PRODUCT_ICONS, type ProductType, type PolicyStatus } from '@mojapolisa/shared'

export const metadata = { title: 'Moje polisy' }

const STATUS_TO_BADGE: Record<PolicyStatus, string> = {
  submitted: 'badge-submitted', in_review: 'badge-in_review', ready: 'badge-ready',
  accepted: 'badge-accepted', active: 'badge-active', expired: 'badge-expired',
  claim_in_progress: 'badge-claim',
}

export default async function ClientDashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Pobierz powiązanego klienta przez auth_accounts
  const { data: link } = await supabase.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  const clientId = link?.client_id

  const policies = clientId
    ? (await supabase.from('policies').select('*').eq('client_id', clientId).order('created_at', { ascending: false })).data ?? []
    : []
  const notifications = clientId
    ? (await supabase.from('notifications').select('*').eq('client_id', clientId).is('opened_at', null).order('sent_at', { ascending: false }).limit(5)).data ?? []
    : []

  // Alerty CTA: polisy kończące się za 30/14/7 dni
  const today = Date.now()
  const expiringAlerts = policies
    .filter((p: any) => p.status === 'active' && p.end_date)
    .map((p: any) => {
      const days = Math.ceil((new Date(p.end_date).getTime() - today) / 86400000)
      return { policy: p, days }
    })
    .filter((x: any) => x.days >= 0 && x.days <= 30)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-700">Moje polisy</h1>
        <p className="text-sm text-gray-600">Witaj, {user.email}. Tu znajdziesz wszystkie swoje ubezpieczenia.</p>
      </div>

      {expiringAlerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {expiringAlerts.map(({ policy, days }: any) => (
            <Link key={policy.id} href={`/polisa/${policy.id}`} className="block card border-l-4 border-l-orange-400 hover:bg-orange-50/40">
              <strong className="text-orange-700">⏰ Twoje {PRODUCT_LABELS[policy.product_type as ProductType]?.toLowerCase()} kończy się za {days} dni</strong>
              <span className="text-sm text-gray-600 block mt-1">Sprawdź ofertę odnowienia →</span>
            </Link>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="card mb-6 bg-brand-50 border-brand-200">
          <h3 className="font-bold text-brand-700 mb-2">📨 Nowe powiadomienia</h3>
          <ul className="space-y-2">
            {notifications.map((n: any) => (
              <li key={n.id} className="text-sm">
                <strong>{n.title}:</strong> {n.body}
                <span className="text-xs text-gray-500 ml-2">{new Date(n.sent_at).toLocaleString('pl-PL')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link href="/kalkulator/wariant-a" className="card-hover text-center !p-4">
          <div className="text-2xl mb-2">🧮</div>
          <div className="text-sm font-semibold">Nowy kalkulator</div>
        </Link>
        <Link href="/szkoda" className="card-hover text-center !p-4">
          <div className="text-2xl mb-2">🚨</div>
          <div className="text-sm font-semibold">Zgłoś szkodę</div>
        </Link>
        <Link href="/czat" className="card-hover text-center !p-4">
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm font-semibold">Czat z agentem</div>
        </Link>
        <a href="https://finvita.pl/kontakt" target="_blank" rel="noopener noreferrer" className="card-hover text-center !p-4">
          <div className="text-2xl mb-2">📞</div>
          <div className="text-sm font-semibold">Kontakt</div>
        </a>
      </div>

      <h2 className="text-xl font-bold text-brand-700 mb-3">Polisy ({policies.length})</h2>
      {policies.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-brand-700 mb-2">Nie masz jeszcze żadnej polisy</h3>
          <p className="text-sm text-gray-600 mb-6">Skorzystaj z kalkulatora, aby złożyć pierwszy wniosek.</p>
          <Link href="/kalkulator/wariant-a" className="btn-primary">Rozpocznij kalkulator</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {policies.map((p: any) => (
            <Link key={p.id} href={`/polisa/${p.id}`} className="card-hover">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{PRODUCT_ICONS[p.product_type as ProductType] ?? '📋'}</div>
                  <div>
                    <div className="font-bold text-brand-700">{PRODUCT_LABELS[p.product_type as ProductType]}</div>
                    {p.policy_number && <div className="text-xs text-gray-500">Nr: {p.policy_number}</div>}
                    {p.end_date && <div className="text-xs text-gray-500">Ważna do: {p.end_date}</div>}
                  </div>
                </div>
                <span className={STATUS_TO_BADGE[p.status as PolicyStatus]}>
                  {POLICY_STATUS_LABELS[p.status as PolicyStatus]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
