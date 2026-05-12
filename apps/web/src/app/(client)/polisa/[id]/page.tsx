import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, POLICY_STATUS_LABELS, type ProductType, type PolicyStatus, formatCurrency, PAYMENT_FREQUENCY_LABELS } from '@mojapolisa/shared'
import { RequestAcceptanceButton } from '@/components/client/RequestAcceptanceButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Szczegóły polisy' }

export default async function PolicyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: policy } = await supabase.from('policies').select('*').eq('id', id).maybeSingle()
  if (!policy) notFound()

  const { data: tuConfig } = await supabase.from('tu_config').select('*').eq('product_type', policy.product_type).maybeSingle()

  const status: PolicyStatus = policy.status
  const history = Array.isArray(policy.status_history) ? policy.status_history : []
  const isReady = status === 'ready'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">← Moje polisy</Link>
        <h1 className="text-2xl font-bold text-brand-700 mt-1">{PRODUCT_LABELS[policy.product_type as ProductType]}</h1>
        {policy.policy_number && <p className="text-sm text-gray-500">Polisa nr {policy.policy_number}</p>}
      </div>

      {isReady && <RequestAcceptanceButton policyId={policy.id} />}

      <div className="card">
        <h2 className="text-lg font-bold text-brand-700 mb-3">Status</h2>
        <span className={`badge-${status === 'claim_in_progress' ? 'claim' : status}`}>{POLICY_STATUS_LABELS[status]}</span>

        {history.length > 0 && (
          <ol className="mt-4 space-y-2 text-sm border-l-2 border-brand-100 pl-4">
            {history.map((h: any, i: number) => (
              <li key={i}>
                <span className="font-medium text-brand-700">{POLICY_STATUS_LABELS[h.status as PolicyStatus] ?? h.status}</span>
                <span className="text-xs text-gray-500 ml-2">{new Date(h.changed_at).toLocaleString('pl-PL')}</span>
                {h.note && <div className="text-xs text-gray-500">{h.note}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-brand-700 mb-3">Szczegóły</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Okres ochrony" value={`${policy.start_date ?? '—'} → ${policy.end_date ?? '—'}`} />
          <Row label="Składka" value={policy.premium ? formatCurrency(policy.premium) : '—'} />
          <Row label="Częstotliwość" value={policy.frequency ? PAYMENT_FREQUENCY_LABELS[policy.frequency as keyof typeof PAYMENT_FREQUENCY_LABELS] : '—'} />
          {policy.admin_note && <Row label="Notatka od agenta" value={policy.admin_note} />}
          {policy.payment_link && <Row label="Płatność online" value={<a href={policy.payment_link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Zapłać →</a>} />}
        </dl>
      </div>

      {(policy.documents?.length > 0 || policy.custom_pdfs?.length > 0) && (
        <div className="card">
          <h2 className="text-lg font-bold text-brand-700 mb-3">Dokumenty</h2>
          <ul className="space-y-2">
            {[...(policy.documents ?? []), ...(policy.custom_pdfs ?? [])].map((d: any, i: number) => (
              <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{d.name}</div>
                  {d.doc_type && <div className="text-xs text-gray-500">{d.doc_type.toUpperCase()}</div>}
                </div>
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 text-xs hover:underline">Pobierz PDF →</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Link href={`/szkoda?policy=${policy.id}`} className="btn-secondary">🚨 Zgłoś szkodę</Link>
        <Link href="/czat" className="btn-secondary">💬 Czat z agentem</Link>
      </div>

      {tuConfig && (tuConfig.claim_link || tuConfig.claim_phone) && (
        <div className="card bg-brand-50 border-brand-200 text-sm">
          <h3 className="font-bold text-brand-700 mb-2">Bezpośrednia ścieżka zgłoszenia szkody</h3>
          {tuConfig.claim_link && <p>Online: <a href={tuConfig.claim_link} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline break-all">{tuConfig.claim_link}</a></p>}
          {tuConfig.claim_phone && <p>Infolinia: <strong>{tuConfig.claim_phone}</strong></p>}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 pb-2 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-right">{value || '—'}</dd>
    </div>
  )
}
