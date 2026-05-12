import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { DocumentUploadForm } from '@/components/admin/DocumentUploadForm'

export const metadata = { title: 'Biblioteka dokumentów' }

export default async function LibraryPage() {
  const supabase = createSupabaseServerClient()
  const { data: docs } = await supabase
    .from('documents_library')
    .select('*')
    .order('uploaded_at', { ascending: false })

  const grouped = (docs ?? []).reduce<Record<string, typeof docs>>((acc, d: any) => {
    acc[d.product_type] = (acc[d.product_type] ?? []) as any
    ;(acc[d.product_type] as any).push(d)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Biblioteka dokumentów</h1>
        <p className="text-sm text-gray-600">OWU, KID, IPZ – auto-przypisywane do polis przy dodawaniu.</p>
      </div>

      <DocumentUploadForm />

      {Object.entries(PRODUCT_LABELS).map(([key, label]) => {
        const productDocs = (grouped[key] ?? []) as any[]
        return (
          <div key={key} className="card">
            <h2 className="font-bold text-brand-700 mb-3">{label} <span className="text-xs text-gray-500 font-normal">({productDocs.length})</span></h2>
            {productDocs.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Brak dokumentów dla tego produktu.</p>
            ) : (
              <ul className="space-y-2">
                {productDocs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.doc_type.toUpperCase()} · v{d.version} · {new Date(d.uploaded_at).toLocaleDateString('pl-PL')}</div>
                    </div>
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 text-xs hover:underline">Pobierz</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
