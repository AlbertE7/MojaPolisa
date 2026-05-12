'use client'

import { useState } from 'react'

export interface Beneficiary {
  first_name: string
  last_name: string
  pesel?: string
  birth_date?: string
  relation: string
  share: number
}

interface Props {
  onSubmit: (b: Beneficiary[]) => void
  onSkip?: () => void
}

const RELATIONS = ['Małżonek/małżonka', 'Dziecko', 'Rodzic', 'Rodzeństwo', 'Inna osoba bliska']

export function BeneficiaryForm({ onSubmit, onSkip }: Props) {
  const [wantsBeneficiary, setWantsBeneficiary] = useState<boolean | null>(null)
  const [list, setList] = useState<Beneficiary[]>([{ first_name: '', last_name: '', relation: 'Małżonek/małżonka', share: 100 }])

  function patch(i: number, p: Partial<Beneficiary>) {
    setList((s) => s.map((b, idx) => (idx === i ? { ...b, ...p } : b)))
  }
  function add() {
    const remaining = 100 - list.reduce((a, b) => a + b.share, 0)
    setList([...list, { first_name: '', last_name: '', relation: 'Dziecko', share: Math.max(0, remaining) }])
  }
  function remove(i: number) {
    setList(list.filter((_, idx) => idx !== i))
  }

  const totalShare = list.reduce((a, b) => a + b.share, 0)
  const valid = totalShare === 100 && list.every((b) => b.first_name && b.last_name)

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-1">Uposażeni</h2>
        <p className="text-sm text-gray-600 mb-4">
          Możesz wskazać konkretne osoby, którym przypadnie świadczenie. Jeśli pominiesz ten krok,
          świadczenie zostanie wypłacone według zasad <strong>dziedziczenia ustawowego</strong>
          (kodeks cywilny).
        </p>

        {wantsBeneficiary === null && (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => setWantsBeneficiary(true)}
              className="card-hover !p-5 text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-brand-700">Wskaż uposażonych</div>
              <div className="text-xs text-gray-500 mt-1">Konkretne osoby otrzymają świadczenie</div>
            </button>
            <button
              type="button"
              onClick={() => onSkip?.()}
              className="card-hover !p-5 text-left"
            >
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-bold text-brand-700">Pomiń – prawo spadkowe</div>
              <div className="text-xs text-gray-500 mt-1">Wypłata według dziedziczenia ustawowego</div>
            </button>
          </div>
        )}
      </div>

      {wantsBeneficiary !== true ? null : <>

      {list.map((b, i) => (
        <div key={i} className="card">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-brand-700">Uposażony {i + 1}</h3>
            {list.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-sm text-red-600 hover:underline">Usuń</button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Imię</label><input type="text" className="input-field" value={b.first_name} onChange={(e) => patch(i, { first_name: e.target.value })} /></div>
            <div><label className="label">Nazwisko</label><input type="text" className="input-field" value={b.last_name} onChange={(e) => patch(i, { last_name: e.target.value })} /></div>
            <div>
              <label className="label">PESEL (lub data urodzenia)</label>
              <input type="text" inputMode="numeric" maxLength={11} className="input-field" value={b.pesel ?? ''} onChange={(e) => patch(i, { pesel: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div>
              <label className="label">Data urodzenia (jeśli brak PESEL)</label>
              <input type="date" className="input-field" value={b.birth_date ?? ''} onChange={(e) => patch(i, { birth_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Stopień pokrewieństwa</label>
              <select className="input-field" value={b.relation} onChange={(e) => patch(i, { relation: e.target.value })}>
                {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">% udział</label>
              <input type="number" min={1} max={100} className="input-field" value={b.share} onChange={(e) => patch(i, { share: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary w-full">+ Dodaj kolejnego uposażonego</button>

      <div className={`card text-sm font-semibold flex justify-between ${totalShare === 100 ? 'bg-green-50 text-green-800 border-green-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>
        <span>Suma udziałów</span>
        <span>{totalShare}%</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button type="button" onClick={() => setWantsBeneficiary(null)} className="btn-secondary sm:w-auto">
          ← Zmień decyzję
        </button>
        <button type="button" onClick={() => valid && onSubmit(list)} disabled={!valid} className="btn-primary flex-1 text-lg py-4">
          Dalej – ankieta medyczna →
        </button>
      </div>
      </>}
    </div>
  )
}
