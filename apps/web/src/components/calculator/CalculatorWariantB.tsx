'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@mojapolisa/shared'
import { CalculatorDisclaimer } from '@mojapolisa/ui'
import { Slider } from './Slider'
import { Toggle } from './Toggle'

interface Filar {
  enabled: boolean
  variant: string
  sum: number
}

interface Inputs {
  age: number
  filar1: Filar
  filar2: Filar
  filar3: Filar
  filar4: Filar
}

const VARIANT_RATES: Record<string, number> = {
  // Filar 1 – życie (per 1000 SU/mies.)
  accident_only: 0.05,
  credit: 0.18,
  full: 0.32,
  // Filar 2 – uszkodzenie ciała / niezdolność do pracy
  accident: 0.4,
  credit_accident: 0.55,
  full_disability: 0.8,
  // Filar 3 – poważne zachorowanie
  oncological: 0.1,
  basic: 0.16,
  extended: 0.28,
  // Filar 4 – zdrowie dziecka
  injury: 0.6,
  illness_20: 0.85,
  full_child: 1.2,
}

function ageFactor(age: number): number {
  if (age <= 30) return 1.0
  if (age <= 40) return 1.3
  if (age <= 50) return 1.8
  return 2.5
}

export function CalculatorWariantB() {
  const [inputs, setInputs] = useState<Inputs>({
    age: 30,
    filar1: { enabled: false, variant: 'full', sum: 200000 },
    filar2: { enabled: false, variant: 'full_disability', sum: 100000 },
    filar3: { enabled: false, variant: 'basic', sum: 100000 },
    filar4: { enabled: false, variant: 'illness_20', sum: 50000 },
  })

  const result = useMemo(() => {
    const f = ageFactor(inputs.age)
    const sum = (filar: Filar) => {
      if (!filar.enabled) return 0
      const rate = VARIANT_RATES[filar.variant] ?? 0.2
      return Math.round((filar.sum / 1000) * rate * f * 100) / 100
    }
    const f1 = sum(inputs.filar1)
    const f2 = sum(inputs.filar2)
    const f3 = sum(inputs.filar3)
    const f4 = sum(inputs.filar4)
    return { f1, f2, f3, f4, total: Math.round((f1 + f2 + f3 + f4) * 100) / 100 }
  }, [inputs])

  function patchFilar<K extends 'filar1' | 'filar2' | 'filar3' | 'filar4'>(k: K, v: Partial<Filar>) {
    setInputs((s) => ({ ...s, [k]: { ...s[k], ...v } }))
  }

  return (
    <div className="space-y-6">
      <CalculatorDisclaimer />

      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Twoje dane</h2>
        <Slider label="Wiek" value={inputs.age} min={18} max={70} step={1} onChange={(v) => setInputs((s) => ({ ...s, age: v }))} format={(v) => `${v} lat`} />
      </div>

      {/* FILAR 1 */}
      <Toggle label="Filar 1 – Życie" description="Ubezpieczenie życia w 3 wariantach zakresu" enabled={inputs.filar1.enabled} onChange={(v) => patchFilar('filar1', { enabled: v })}>
        <div>
          <label className="label">Wariant</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {([
              { v: 'accident_only', l: 'Tylko wypadek' },
              { v: 'credit', l: 'Pod kredyt' },
              { v: 'full', l: 'Pełne' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => patchFilar('filar1', { variant: o.v })} className={`py-2 rounded-lg border-2 text-sm font-semibold ${inputs.filar1.variant === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{o.l}</button>
            ))}
          </div>
        </div>
        <Slider label="Suma ubezpieczenia" value={inputs.filar1.sum} min={50000} max={1000000} step={10000} onChange={(v) => patchFilar('filar1', { sum: v })} format={formatCurrency} hint={`Składka poglądowa: ${formatCurrency(result.f1)}/mies.`} />
      </Toggle>

      {/* FILAR 2 */}
      <Toggle label="Filar 2 – Uszkodzenie ciała / niezdolność do pracy" description="Ochrona w razie wypadku lub trwałej niezdolności" enabled={inputs.filar2.enabled} onChange={(v) => patchFilar('filar2', { enabled: v })}>
        <div>
          <label className="label">Wariant</label>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            {([
              { v: 'accident', l: 'Uszkodzenie ciała (wypadek)' },
              { v: 'credit_accident', l: 'Niezdolność pod kredyt' },
              { v: 'full_disability', l: 'Niezdolność + utrata samodzielności' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => patchFilar('filar2', { variant: o.v })} className={`py-2 px-2 rounded-lg border-2 font-semibold ${inputs.filar2.variant === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{o.l}</button>
            ))}
          </div>
        </div>
        <Slider label="Suma ubezpieczenia" value={inputs.filar2.sum} min={20000} max={500000} step={10000} onChange={(v) => patchFilar('filar2', { sum: v })} format={formatCurrency} hint={`Składka poglądowa: ${formatCurrency(result.f2)}/mies.`} />
      </Toggle>

      {/* FILAR 3 */}
      <Toggle label="Filar 3 – Poważne zachorowanie" description="Onkologia, kardiologia, choroby przewlekłe" enabled={inputs.filar3.enabled} onChange={(v) => patchFilar('filar3', { enabled: v })}>
        <div>
          <label className="label">Wariant zakresu</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {([
              { v: 'oncological', l: 'Onkologiczny' },
              { v: 'basic', l: 'Podstawowy (12 chorób)' },
              { v: 'extended', l: 'Rozszerzony (50 chorób)' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => patchFilar('filar3', { variant: o.v })} className={`py-2 rounded-lg border-2 text-xs font-semibold ${inputs.filar3.variant === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{o.l}</button>
            ))}
          </div>
        </div>
        <Slider label="Suma ubezpieczenia" value={inputs.filar3.sum} min={20000} max={500000} step={10000} onChange={(v) => patchFilar('filar3', { sum: v })} format={formatCurrency} hint={`Składka poglądowa: ${formatCurrency(result.f3)}/mies.`} />
      </Toggle>

      {/* FILAR 4 */}
      <Toggle label="Filar 4 – Zdrowie dziecka (opcjonalnie)" description="Ochrona zdrowia dziecka" enabled={inputs.filar4.enabled} onChange={(v) => patchFilar('filar4', { enabled: v })}>
        <div>
          <label className="label">Wariant zakresu</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {([
              { v: 'injury', l: 'Uszkodzenie ciała' },
              { v: 'illness_20', l: '20 chorób' },
              { v: 'full_child', l: '20 chorób + uszczerbek' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => patchFilar('filar4', { variant: o.v })} className={`py-2 rounded-lg border-2 text-xs font-semibold ${inputs.filar4.variant === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{o.l}</button>
            ))}
          </div>
        </div>
        <Slider label="Suma ubezpieczenia" value={inputs.filar4.sum} min={10000} max={200000} step={10000} onChange={(v) => patchFilar('filar4', { sum: v })} format={formatCurrency} hint={`Składka poglądowa: ${formatCurrency(result.f4)}/mies.`} />
      </Toggle>

      <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-2xl p-8 sticky bottom-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-brand-100 text-sm uppercase tracking-wide">Twoja składka</p>
            <div className="text-4xl font-bold">{formatCurrency(result.total)} <span className="text-lg font-normal text-brand-100">/ mies.</span></div>
          </div>
          <Link
            href={{ pathname: '/wniosek', query: { product: 'life_b', data: btoa(unescape(encodeURIComponent(JSON.stringify(inputs)))) } }}
            className="btn-gold"
          >
            Złóż wniosek →
          </Link>
        </div>
      </div>
    </div>
  )
}
