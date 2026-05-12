import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { Suspense } from 'react'
import { ClaimForm } from '@/components/client/ClaimForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Zgłoś szkodę' }

export default async function ClaimPage({ searchParams }: { searchParams: Promise<{ policy?: string }> }) {
  const sp = await searchParams
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: link } = await supabase.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  if (!link) redirect('/logowanie')

  const { data: policies } = await supabase
    .from('policies').select('id, product_type, policy_number, status')
    .eq('client_id', link.client_id)
    .in('status', ['active', 'accepted'])

  const { data: tuConfigs } = await supabase.from('tu_config').select('*')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-brand-700 mb-3">Zgłoś szkodę</h1>
      <p className="text-gray-600 mb-6">Wybierz polisę i postępuj zgodnie z checklistą.</p>

      <Suspense fallback={<div className="card">Ładowanie...</div>}>
        <ClaimForm
          policies={(policies ?? []).map((p) => ({ ...p, label: PRODUCT_LABELS[p.product_type as ProductType] }))}
          tuConfigs={tuConfigs ?? []}
          preselectedId={sp.policy}
        />
      </Suspense>
    </div>
  )
}
