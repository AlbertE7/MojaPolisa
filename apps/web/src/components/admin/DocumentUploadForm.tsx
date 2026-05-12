'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'

export function DocumentUploadForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    product_type: 'life_a' as ProductType,
    doc_type: 'owu' as 'owu' | 'kid' | 'ipz',
    name: '',
    version: '1.0',
    file_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setMsg('✓ Dokument dodany')
      setForm({ ...form, name: '', file_url: '' })
      router.refresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-bold text-brand-700">Dodaj nowy dokument</h2>
      <p className="text-xs text-gray-500">
        W produkcji upload pliku PDF przez Supabase Storage. Tu na razie wklej URL do pliku.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Produkt</label>
          <select className="input-field" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value as ProductType })}>
            {Object.entries(PRODUCT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Typ dokumentu</label>
          <select className="input-field" value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value as any })}>
            <option value="owu">OWU</option>
            <option value="kid">KID</option>
            <option value="ipz">IPZ</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Nazwa</label>
          <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="np. OWU Wariant A 2025-01" />
        </div>
        <div>
          <label className="label">Wersja</label>
          <input type="text" className="input-field" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
        </div>
        <div>
          <label className="label">URL pliku PDF</label>
          <input type="url" className="input-field" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} required />
        </div>
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Zapisuję...' : 'Dodaj dokument'}
      </button>
    </form>
  )
}
