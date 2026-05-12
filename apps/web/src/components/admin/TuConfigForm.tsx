'use client'

import { useState } from 'react'
import type { ProductType } from '@mojapolisa/shared'

interface Props { productType: ProductType; initialLink: string; initialPhone: string }

export function TuConfigForm({ productType, initialLink, initialPhone }: Props) {
  const [link, setLink] = useState(initialLink)
  const [phone, setPhone] = useState(initialPhone)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/tu-config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType, claim_link: link, claim_phone: phone }),
      })
      if (!res.ok) throw new Error(await res.text())
      setMsg('✓ Zapisano')
      setTimeout(() => setMsg(null), 2000)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div>
        <label className="label">Link do zgłoszenia szkody</label>
        <input type="url" className="input-field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="label">Infolinia</label>
        <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="np. 22 460 22 22" />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2 !px-4 text-sm">{saving ? 'Zapisuję...' : 'Zapisz'}</button>
        {msg && <span className="text-sm text-brand-600">{msg}</span>}
      </div>
    </div>
  )
}
