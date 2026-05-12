'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  calculateInvestmentGrowth,
  formatCurrency,
  IKE_LIMIT_2025,
  IKZE_LIMIT_2025,
} from '@mojapolisa/shared'
import { CalculatorDisclaimer } from '@mojapolisa/ui'
import { Slider } from './Slider'

type Variant = 'standard' | 'ike' | 'ikze'
type TaxBracket = 12 | 32

export function CalculatorInvestment() {
  const [monthly, setMonthly] = useState(500)
  const [years, setYears] = useState<10 | 15 | 20 | 25 | 30>(20)
  const [variant, setVariant] = useState<Variant>('ike')
  const [tax, setTax] = useState<TaxBracket>(12)

  const growth = useMemo(() => calculateInvestmentGrowth(monthly, years), [monthly, years])
  const totalContributed = monthly * 12 * years
  const annualContribution = monthly * 12

  const taxBenefit = useMemo(() => {
    if (variant === 'ikze') {
      const eligible = Math.min(annualContribution, IKZE_LIMIT_2025)
      return Math.round(eligible * (tax / 100))
    }
    return 0
  }, [variant, annualContribution, tax])

  const effectiveAnnualCost = annualContribution - taxBenefit
  const limitWarning =
    variant === 'ike' && annualContribution > IKE_LIMIT_2025
      ? `Twoja roczna wpłata (${formatCurrency(annualContribution)}) przekracza limit IKE 2025 (${formatCurrency(IKE_LIMIT_2025)}).`
      : variant === 'ikze' && annualContribution > IKZE_LIMIT_2025
        ? `Twoja roczna wpłata (${formatCurrency(annualContribution)}) przekracza limit IKZE 2025 (${formatCurrency(IKZE_LIMIT_2025)}).`
        : null

  return (
    <div className="space-y-6">
      <CalculatorDisclaimer />

      <div className="card space-y-6">
        <h2 className="text-xl font-bold text-brand-700">Twoje wpłaty</h2>

        <Slider label="Miesięczna wpłata" value={monthly} min={200} max={5000} step={50} onChange={setMonthly} format={formatCurrency} />

        <div>
          <label className="label">Okres oszczędzania</label>
          <div className="grid grid-cols-5 gap-2">
            {([10, 15, 20, 25, 30] as const).map((y) => (
              <button key={y} type="button" onClick={() => setYears(y)} className={`py-3 rounded-lg border-2 font-semibold ${years === y ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{y} lat</button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Wariant</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {([
              { v: 'standard', l: 'Standard', d: 'Bez korzyści podatkowych' },
              { v: 'ike', l: 'IKE', d: 'Zysk wolny od podatku Belki' },
              { v: 'ikze', l: 'IKZE', d: 'Odliczenie od podatku' },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => setVariant(o.v)} className={`py-3 px-3 rounded-lg border-2 text-left ${variant === o.v ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                <div className={`font-semibold ${variant === o.v ? 'text-brand-700' : 'text-gray-700'}`}>{o.l}</div>
                <div className="text-xs text-gray-500">{o.d}</div>
              </button>
            ))}
          </div>
        </div>

        {variant === 'ikze' && (
          <div>
            <label className="label">Twoja skala podatkowa</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTax(12)} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${tax === 12 ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>12%</button>
              <button type="button" onClick={() => setTax(32)} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${tax === 32 ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>32%</button>
            </div>
          </div>
        )}

        {limitWarning && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-3 text-sm">
            {limitWarning} Limity 2025: IKE {formatCurrency(IKE_LIMIT_2025)}, IKZE {formatCurrency(IKZE_LIMIT_2025)}.
          </div>
        )}

        {variant === 'ikze' && taxBenefit > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <div className="font-bold text-green-800 mb-1">Twoja korzyść podatkowa</div>
            <div className="text-green-700">
              Odzyskasz <strong>{formatCurrency(taxBenefit)}</strong> rocznie w zeznaniu PIT.
              <br />
              Realny koszt po uldze: <strong>{formatCurrency(effectiveAnnualCost)}</strong> / rok.
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-2">Potencjalna wartość po {years} latach</h2>
        <p className="text-sm text-gray-500 mb-4">Łącznie wpłacisz: {formatCurrency(totalContributed)}</p>

        <div className="space-y-3">
          {([
            { l: 'Konserwatywny', r: '3%', v: growth.conservative, color: 'bg-blue-100 text-blue-800' },
            { l: 'Zrównoważony', r: '6%', v: growth.balanced, color: 'bg-brand-100 text-brand-800' },
            { l: 'Dynamiczny', r: '9%', v: growth.dynamic, color: 'bg-gold-100 text-gold-800' },
          ]).map((s) => (
            <div key={s.l} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-bold text-gray-900">{s.l}</div>
                <div className="text-xs text-gray-500">{s.r} średnio rocznie</div>
              </div>
              <div className="text-xl font-bold text-brand-700">{formatCurrency(s.v)}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 italic mt-4">
          Historyczne wyniki funduszy nie gwarantują przyszłych stóp zwrotu. Wyniki po odliczeniu opłat.
        </p>
      </div>

      <Link href="https://finvita.pl/kontakt" target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
        Chcę wiedzieć więcej – skontaktuje się ze mną agent →
      </Link>
    </div>
  )
}
