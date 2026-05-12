'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'

interface Doc { id: string; product_type: string; doc_type: string; name: string; file_url: string }

interface Props {
  clientId: string
  clientName: string
  clientEmail: string
  documents: Doc[]
}

export function NewPolicyForm({ clientId, clientName, clientEmail, documents }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    product_type: 'life_a' as ProductType,
    policy_number: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    premium: '',
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'semi-annual' | 'annual',
    payment_link: '',
    admin_note: '',
  })
  const [notify, setNotify] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError(null)
    try {
      const autoDocs = documents.filter((d) => d.product_type === form.product_type)
      const res = await fetch('/api/policies/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          ...form,
          premium: form.premium ? Number(form.premium) : null,
          documents: autoDocs.map((d) => ({ id: d.id, name: d.name, doc_type: d.doc_type, file_url: d.file_url })),
          notify_client: notify,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push(`/admin/klienci/${clientId}?tab=polisy`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd zapisu polisy')
    } finally {
      setSubmitting(false)
    }
  }

  const autoDocs = documents.filter((d) => d.product_type === form.product_type)
  const isLife = form.product_type === 'life_a' || form.product_type === 'life_b'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <label className="label">Typ produktu</label>
          <select className="input-field" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value as ProductType })}>
            {Object.entries(PRODUCT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Numer polisy</label>
            <input type="text" className="input-field" value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} required />
          </div>
          <div>
            <label className="label">Składka (PLN)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value })} required />
          </div>
          <div>
            <label className="label">Data początku ochrony</label>
            <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Data końca ochrony</label>
            <input type="date" className="input-field" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Częstotliwość składki</label>
            <select className="input-field" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}>
              <option value="monthly">Miesięczna</option>
              <option value="quarterly">Kwartalna</option>
              <option value="semi-annual">Półroczna</option>
              <option value="annual">Roczna</option>
            </select>
          </div>
          <div>
            <label className="label">Link do płatności (opcjonalnie)</label>
            <input type="url" className="input-field" value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="label">Notatka do klienta (pojawi się w szczegółach polisy)</label>
          <textarea className="input-field" rows={3} value={form.admin_note} onChange={(e) => setForm({ ...form, admin_note: e.target.value })} />
        </div>
      </div>

      {isLife && (
        <div className="card bg-brand-50 border-brand-200">
          <h3 className="font-bold text-brand-700 mb-2">Auto-przypisanie dokumentów</h3>
          {autoDocs.length === 0 ? (
            <p className="text-sm text-orange-700">
              Brak dokumentów w bibliotece dla {PRODUCT_LABELS[form.product_type]}.
              <a href="/admin/biblioteka" className="underline ml-1">Wgraj OWU/KID →</a>
            </p>
          ) : (
            <ul className="text-sm space-y-1">
              {autoDocs.map((d) => (
                <li key={d.id} className="flex items-center gap-2"><span className="text-green-600">✓</span> {d.name} <span className="text-xs text-gray-500">({d.doc_type.toUpperCase()})</span></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!isLife && (
        <div className="card">
          <h3 className="font-bold text-brand-700 mb-2">Upload własnego PDF</h3>
          <p className="text-xs text-gray-500 mb-3">Dla OC/AC/Majątek dodaj polisę i OWU. Plik zostanie zapisany w Storage.</p>
          <input type="file" multiple accept="application/pdf" className="text-sm" />
          <p className="text-xs text-orange-600 italic mt-2">Pełen upload działa po skonfigurowaniu Supabase Storage – stub.</p>
        </div>
      )}

      <label className="card flex gap-3 items-start cursor-pointer">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-brand-600 w-5 h-5 mt-1" />
        <div>
          <div className="font-semibold">Wyślij powiadomienie do klienta</div>
          <div className="text-xs text-gray-500">Email + push: „Twoja polisa jest gotowa". Status → „Polisa gotowa".</div>
        </div>
      </label>

      {error && <div className="card bg-red-50 border-red-200 text-red-800 text-sm">{error}</div>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">Anuluj</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? 'Zapisuję...' : notify ? 'Zapisz i wyślij' : 'Zapisz bez wysyłki'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Klient: <strong>{clientName}</strong> · {clientEmail}
      </p>
    </form>
  )
}
