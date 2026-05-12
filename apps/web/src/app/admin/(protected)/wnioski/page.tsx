import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'

export const metadata = { title: 'Wnioski' }

export default async function ApplicationsListPage({ searchParams }: { searchParams: Promise<{ status?: string; product?: string }> }) {
  const sp = await searchParams
  const supabase = createSupabaseServerClient()

  let q = supabase
    .from('applications')
    .select('id, product_type, status, submitted_at, ip_address, client_id, clients(first_name,last_name,email,phone)')
    .order('submitted_at', { ascending: false })
    .limit(200)
  if (sp.status) q = q.eq('status', sp.status)
  if (sp.product) q = q.eq('product_type', sp.product)

  const { data: apps } = await q

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Wnioski</h1>
        <p className="text-sm text-gray-600">{apps?.length ?? 0} wniosk(ów)</p>
      </div>

      <form className="card flex flex-col sm:flex-row gap-3">
        <select name="product" defaultValue={sp.product ?? ''} className="input-field flex-1">
          <option value="">Wszystkie produkty</option>
          {Object.entries(PRODUCT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ''} className="input-field flex-1">
          <option value="">Wszystkie statusy</option>
          <option value="submitted">Złożony</option>
          <option value="in_review">W analizie</option>
          <option value="processed">Przetworzony</option>
        </select>
        <button type="submit" className="btn-primary !py-3">Filtruj</button>
      </form>

      <div className="card overflow-x-auto">
        {!apps || apps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Brak wniosków.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2">Wnioskodawca</th>
                <th className="py-2">Email</th>
                <th className="py-2">Produkt</th>
                <th className="py-2">Status</th>
                <th className="py-2">Złożono</th>
                <th className="py-2">IP</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a: any) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{a.clients?.first_name} {a.clients?.last_name}</td>
                  <td className="py-3 text-gray-600">{a.clients?.email}</td>
                  <td className="py-3 text-xs">{PRODUCT_LABELS[a.product_type as ProductType] ?? a.product_type}</td>
                  <td className="py-3"><span className="badge-submitted">{a.status}</span></td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(a.submitted_at).toLocaleString('pl-PL')}</td>
                  <td className="py-3 text-xs text-gray-400 font-mono">{a.ip_address ?? '—'}</td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/klienci/${a.client_id}?tab=wnioski`} className="text-brand-600 text-xs font-semibold hover:underline">Otwórz →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
