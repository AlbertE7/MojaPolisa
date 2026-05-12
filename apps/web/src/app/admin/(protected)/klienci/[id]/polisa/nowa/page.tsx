import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NewPolicyForm } from '@/components/admin/NewPolicyForm'

export const metadata = { title: 'Dodaj polisę' }

export default async function NewPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseServerClient()

  const [{ data: client }, { data: docs }] = await Promise.all([
    supabase.from('clients').select('id, first_name, last_name, email').eq('id', id).maybeSingle(),
    supabase.from('documents_library').select('*').eq('is_active', true),
  ])

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/klienci/${id}`} className="text-sm text-brand-600 hover:underline">← {client.first_name} {client.last_name}</Link>
        <h1 className="text-2xl font-bold text-brand-700 mt-1">Dodaj polisę</h1>
        <p className="text-sm text-gray-500">Dla: {client.email}</p>
      </div>

      <NewPolicyForm
        clientId={id}
        clientName={`${client.first_name} ${client.last_name}`}
        clientEmail={client.email ?? ''}
        documents={docs ?? []}
      />
    </div>
  )
}
