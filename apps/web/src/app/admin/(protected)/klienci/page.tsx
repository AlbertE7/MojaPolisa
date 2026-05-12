import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Klienci' }

interface SearchParams { q?: string; status?: string }

export default async function ClientsListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('clients')
    .select('id, first_name, last_name, email, phone, pesel_type, created_at, last_login, policies(id,status,product_type)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (sp.q) {
    const q = `%${sp.q}%`
    query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q}`)
  }

  const { data: clients } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">Klienci</h1>
          <p className="text-sm text-gray-600">{clients?.length ?? 0} klient(ów)</p>
        </div>
        <a href="/api/admin/clients/export" className="btn-secondary !py-2 !px-4 text-sm">Eksport CSV</a>
      </div>

      <form className="card flex flex-col sm:flex-row gap-3">
        <input type="text" name="q" defaultValue={sp.q ?? ''} placeholder="Szukaj: imię, nazwisko, email, telefon..." className="input-field flex-1" />
        <button type="submit" className="btn-primary !py-3">Szukaj</button>
      </form>

      <div className="card overflow-x-auto">
        {!clients || clients.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Brak klientów.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2">Klient</th>
                <th className="py-2">Email</th>
                <th className="py-2">Telefon</th>
                <th className="py-2">Polisy</th>
                <th className="py-2">Ostatnie logowanie</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium">{c.first_name} {c.last_name}</div>
                    <div className="text-xs text-gray-500">{c.pesel_type === 'UA' ? '🇺🇦 UA' : '🇵🇱 PL'}</div>
                  </td>
                  <td className="py-3 text-gray-600">{c.email}</td>
                  <td className="py-3 text-gray-600">{c.phone}</td>
                  <td className="py-3">
                    <span className="font-semibold">{c.policies?.length ?? 0}</span>
                    {c.policies && c.policies.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({c.policies.filter((p: any) => p.status === 'active').length} aktywnych)
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{c.last_login ? new Date(c.last_login).toLocaleString('pl-PL') : '—'}</td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/klienci/${c.id}`} className="text-brand-600 text-xs font-semibold hover:underline">Otwórz →</Link>
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
