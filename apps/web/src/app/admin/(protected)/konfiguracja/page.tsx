import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { TuConfigForm } from '@/components/admin/TuConfigForm'

export const metadata = { title: 'Konfiguracja TU' }

export default async function ConfigPage() {
  const supabase = createSupabaseServerClient()
  const { data: configs } = await supabase.from('tu_config').select('*').order('product_type')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Konfiguracja TU</h1>
        <p className="text-sm text-gray-600">
          Linki do zgłaszania szkód i infolinie towarzystw ubezpieczeniowych – konfigurowalne per typ polisy.
          Klient nie widzi nazw TU, tylko linki i numery telefonów.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(PRODUCT_LABELS).map(([key, label]) => {
          const cfg = configs?.find((c) => c.product_type === key)
          return (
            <div key={key} className="card">
              <h2 className="font-bold text-brand-700 mb-3">{label}</h2>
              <TuConfigForm
                productType={key as ProductType}
                initialLink={cfg?.claim_link ?? ''}
                initialPhone={cfg?.claim_phone ?? ''}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
