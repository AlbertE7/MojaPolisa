import Link from 'next/link'
import { headers } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { getClientIp } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Akceptacja polisy' }

export default async function AcceptancePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createSupabaseAdminClient()
  const h = await headers()
  const ip = getClientIp(h)

  const { data: intent } = await admin
    .from('policy_acceptance_intents')
    .select('id, policy_id, client_id, confirmed_at, expires_at, policies(product_type, policy_number, start_date, end_date)')
    .eq('token', token)
    .maybeSingle()

  if (!intent) {
    return <Layout><Card title="Nieprawidłowy link" desc="Ten link akceptacji nie istnieje lub został usunięty." /></Layout>
  }

  if (new Date(intent.expires_at) < new Date()) {
    return <Layout><Card title="Link wygasł" desc="Link akceptacji był ważny 7 dni. Skontaktuj się z agentem, aby otrzymać nowy." /></Layout>
  }

  // Jeśli jeszcze niepotwierdzony – potwierdź teraz
  if (!intent.confirmed_at) {
    await admin
      .from('policy_acceptance_intents')
      .update({ confirmed_at: new Date().toISOString(), ip_address: ip })
      .eq('id', intent.id)
  }

  const p = (intent.policies as any) ?? {}
  const productLabel = PRODUCT_LABELS[p.product_type as ProductType] ?? p.product_type

  return (
    <Layout>
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-brand-700 mb-3">Polisa zaakceptowana</h1>
        <p className="text-gray-600 mb-2">Dziękujemy za akceptację. Twoje potwierdzenie zostało zarejestrowane.</p>
        <p className="text-xs text-gray-500 mb-8">Agent prowadzący zmieni finalny status polisy w systemie. Otrzymasz powiadomienie, gdy polisa będzie aktywna.</p>

        <div className="bg-brand-50 border border-brand-200 rounded-lg p-5 text-left mb-6">
          <div className="text-sm space-y-2">
            <div><span className="text-gray-500">Produkt:</span> <strong>{productLabel}</strong></div>
            <div><span className="text-gray-500">Numer polisy:</span> <strong>{p.policy_number}</strong></div>
            <div><span className="text-gray-500">Okres ochrony:</span> <strong>{p.start_date} → {p.end_date}</strong></div>
            <div><span className="text-gray-500">Data akceptacji:</span> <strong>{new Date(intent.confirmed_at ?? new Date()).toLocaleString('pl-PL')}</strong></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">Przejdź do moich polis</Link>
          <Link href="/" className="btn-secondary">Strona główna</Link>
        </div>
      </div>
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gold-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">{children}</div>
    </div>
  )
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-3">⚠️</div>
      <h1 className="text-2xl font-bold text-brand-700 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{desc}</p>
      <Link href="/" className="btn-primary">Strona główna</Link>
    </div>
  )
}
