'use client'

import { useMemo, useState } from 'react'
import type { ProductType } from '@mojapolisa/shared'

interface Policy { id: string; product_type: ProductType; policy_number: string | null; label: string }
interface TuConfig { product_type: ProductType; claim_link: string | null; claim_phone: string | null }

const CHECKLISTS: Record<string, string[]> = {
  life: [
    'Dokument tożsamości (dowód/paszport)',
    'Numer polisy',
    'Opis zdarzenia ubezpieczeniowego',
    'Dokumentacja medyczna (karty leczenia, wyniki badań)',
    'Dane do przelewu (numer konta)',
    'Kontakt do lekarza prowadzącego',
  ],
  vehicle: [
    'Prawo jazdy',
    'Dowód rejestracyjny',
    'Notatka policyjna lub oświadczenie sprawcy',
    'Zdjęcia szkody (min. 4 zdjęcia)',
    'Numer polisy',
    'Dane kontaktowe świadków (jeśli są)',
  ],
  property: [
    'Dokumentacja fotograficzna szkody',
    'Opis zdarzenia (co, kiedy, jak)',
    'Protokół straży pożarnej/policji (jeśli dotyczy)',
    'Numer polisy',
    'Kosztorys naprawy lub wycena szkody',
  ],
}

function checklistKey(p: ProductType): keyof typeof CHECKLISTS {
  if (p === 'life_a' || p === 'life_b') return 'life'
  if (p === 'oc' || p === 'ac' || p === 'oc_ac') return 'vehicle'
  return 'property'
}

export function ClaimForm({ policies, tuConfigs, preselectedId }: { policies: Policy[]; tuConfigs: TuConfig[]; preselectedId?: string }) {
  const [policyId, setPolicyId] = useState(preselectedId ?? policies[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [event_date, setEventDate] = useState('')
  const [event_place, setEventPlace] = useState('')
  const [bank_account, setBankAccount] = useState('')
  const [contact_phone, setContactPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = policies.find((p) => p.id === policyId)
  const checklistType = selected ? checklistKey(selected.product_type) : 'life'
  const checklist = CHECKLISTS[checklistType] ?? []
  const tuCfg = useMemo(() => tuConfigs.find((c) => selected && c.product_type === selected.product_type), [tuConfigs, selected])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/claims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policyId, description, event_date, event_place, bank_account, contact_phone }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setSubmitting(false)
    }
  }

  if (policies.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-3">📋</div>
        <h3 className="text-lg font-bold text-brand-700 mb-2">Brak aktywnych polis</h3>
        <p className="text-sm text-gray-600">Zgłoszenie szkody jest możliwe wyłącznie dla aktywnych polis.</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-3">✅</div>
        <h2 className="text-2xl font-bold text-brand-700 mb-2">Zgłoszenie przyjęte</h2>
        <p className="text-gray-600 mb-4">Agent skontaktuje się z Tobą w ciągu 24h. Status polisy: „Szkoda w toku".</p>
        {tuCfg?.claim_phone && (
          <p className="text-sm text-gray-700">
            W razie pilnej sprawy: <strong>{tuCfg.claim_phone}</strong>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card">
        <label className="label">Wybierz polisę</label>
        <select className="input-field" value={policyId} onChange={(e) => setPolicyId(e.target.value)} required>
          {policies.map((p) => <option key={p.id} value={p.id}>{p.label} {p.policy_number ? `(${p.policy_number})` : ''}</option>)}
        </select>
      </div>

      {selected && (tuCfg?.claim_link || tuCfg?.claim_phone) && (
        <div className="card bg-brand-50 border-brand-200">
          <h3 className="font-bold text-brand-700 mb-2">Bezpośrednia ścieżka zgłoszenia</h3>
          {tuCfg?.claim_link && <p className="text-sm">Online: <a href={tuCfg.claim_link} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline break-all">{tuCfg.claim_link}</a></p>}
          {tuCfg?.claim_phone && <p className="text-sm mt-1">Infolinia: <strong>{tuCfg.claim_phone}</strong></p>}
          <p className="text-xs text-gray-500 italic mt-3">Możesz też zgłosić szkodę przez ten formularz – agent przejmie sprawę.</p>
        </div>
      )}

      {selected && (
        <div className="card">
          <h3 className="font-bold text-brand-700 mb-3">Checklista – co przygotować</h3>
          <ul className="space-y-2 text-sm">
            {checklist.map((item, i) => (
              <li key={i} className="flex gap-2">
                <input type="checkbox" className="accent-brand-600 mt-1" />
                <span>{item}{item === 'Numer polisy' && selected.policy_number && <span className="text-gray-500 ml-1">({selected.policy_number})</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="font-bold text-brand-700">Opis zdarzenia</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Data zdarzenia</label>
            <input type="date" className="input-field" value={event_date} onChange={(e) => setEventDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Miejsce zdarzenia</label>
            <input type="text" className="input-field" value={event_place} onChange={(e) => setEventPlace(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Opis</label>
          <textarea className="input-field" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Opisz dokładnie co się wydarzyło..." />
        </div>

        {checklistType === 'life' && (
          <div>
            <label className="label">Numer konta do przelewu</label>
            <input type="text" className="input-field font-mono" value={bank_account} onChange={(e) => setBankAccount(e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
          </div>
        )}

        <div>
          <label className="label">Telefon kontaktowy</label>
          <input type="tel" className="input-field" value={contact_phone} onChange={(e) => setContactPhone(e.target.value)} required />
        </div>
      </div>

      {error && <div className="card bg-red-50 border-red-200 text-red-800 text-sm">{error}</div>}

      <button type="submit" disabled={submitting} className="btn-primary w-full text-lg py-4">
        {submitting ? 'Wysyłam...' : '🚨 Zgłoś szkodę'}
      </button>
    </form>
  )
}
