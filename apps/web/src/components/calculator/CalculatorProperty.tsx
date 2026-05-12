'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@mojapolisa/shared'
import { CalculatorDisclaimer } from '@mojapolisa/ui'
import { Slider } from './Slider'
import { Stepper } from './Stepper'

interface Inputs {
  propertyType: 'apartment' | 'house' | 'house_under_construction'
  postalCode: string
  area: number
  buildYear: number
  propertyValue: number
  furnitureValue: number
  scope: 'walls' | 'walls_furniture' | 'full'
}

export function CalculatorProperty() {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<Inputs>({
    propertyType: 'apartment', postalCode: '', area: 60,
    buildYear: 2010, propertyValue: 400000, furnitureValue: 30000,
    scope: 'walls_furniture',
  })

  function patch(p: Partial<Inputs>) { setInputs((s) => ({ ...s, ...p })) }

  const result = useMemo(() => {
    const typeMultiplier = { apartment: 1.0, house: 1.4, house_under_construction: 1.8 }[inputs.propertyType]
    const ageMultiplier = inputs.buildYear < 1990 ? 1.3 : inputs.buildYear < 2010 ? 1.1 : 1.0

    let base = inputs.propertyValue * 0.0014 * typeMultiplier * ageMultiplier
    if (inputs.scope === 'walls_furniture') base += inputs.furnitureValue * 0.008
    if (inputs.scope === 'full') base += inputs.furnitureValue * 0.012 + 250

    const annual = Math.round(base)
    return { annual, monthly: Math.round(annual / 12 * 1.05) }
  }, [inputs])

  return (
    <div className="space-y-6">
      <Stepper steps={['Typ', 'Adres i metraż', 'Wartości', 'Wynik']} current={step} />
      <CalculatorDisclaimer />

      {step === 0 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 1 – Typ nieruchomości</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              { v: 'apartment', l: 'Mieszkanie', i: '🏢' },
              { v: 'house', l: 'Dom', i: '🏠' },
              { v: 'house_under_construction', l: 'Dom w budowie', i: '🏗️' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => patch({ propertyType: o.v })} className={`py-6 rounded-lg border-2 font-semibold ${inputs.propertyType === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                <div className="text-3xl mb-2">{o.i}</div>
                {o.l}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} className="btn-primary">Dalej →</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 2 – Adres i metraż</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Kod pocztowy</label>
              <input type="text" className="input-field" maxLength={6} value={inputs.postalCode} onChange={(e) => patch({ postalCode: e.target.value })} placeholder="00-000" />
            </div>
            <Slider label="Metraż" value={inputs.area} min={20} max={500} step={5} onChange={(v) => patch({ area: v })} format={(v) => `${v} m²`} />
          </div>
          <Slider label="Rok budowy" value={inputs.buildYear} min={1920} max={2025} step={1} onChange={(v) => patch({ buildYear: v })} format={(v) => String(v)} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Wstecz</button>
            <button type="button" onClick={() => setStep(2)} className="btn-primary">Dalej →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 3 – Wartości</h2>
          <Slider label="Wartość nieruchomości" value={inputs.propertyValue} min={50000} max={3000000} step={10000} onChange={(v) => patch({ propertyValue: v })} format={formatCurrency} />
          <Slider label="Wartość wyposażenia" value={inputs.furnitureValue} min={0} max={500000} step={5000} onChange={(v) => patch({ furnitureValue: v })} format={formatCurrency} />

          <div>
            <label className="label">Zakres ochrony</label>
            <div className="grid gap-2">
              {([
                { v: 'walls', l: 'Mury', d: 'Ogień, woda, klęski żywiołowe' },
                { v: 'walls_furniture', l: 'Mury + wyposażenie', d: 'Ochrona ścian + ruchomości domowych' },
                { v: 'full', l: 'Pełny pakiet', d: '+ OC w życiu prywatnym, zalanie, kradzież' },
              ] as const).map((o) => (
                <button key={o.v} type="button" onClick={() => patch({ scope: o.v })} className={`py-3 px-4 rounded-lg border-2 text-left ${inputs.scope === o.v ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`font-semibold ${inputs.scope === o.v ? 'text-brand-700' : 'text-gray-700'}`}>{o.l}</div>
                  <div className="text-xs text-gray-500">{o.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Wstecz</button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary">Pokaż wynik →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-2xl p-8">
            <p className="text-brand-100 text-sm uppercase tracking-wide mb-2">Szacunkowa składka</p>
            <div className="text-5xl font-bold">{formatCurrency(result.annual)} <span className="text-lg text-brand-100">/ rok</span></div>
            <p className="text-brand-100 text-sm mt-2">Lub {formatCurrency(result.monthly)} / miesiąc</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">← Zmień parametry</button>
            <Link href={{ pathname: '/wniosek', query: { product: 'property', data: btoa(unescape(encodeURIComponent(JSON.stringify(inputs)))) } }} className="btn-primary flex-1">Chcę złożyć wniosek →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
