'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@mojapolisa/shared'
import { CalculatorDisclaimer } from '@mojapolisa/ui'
import { Slider } from './Slider'
import { Stepper } from './Stepper'

const CAR_BRANDS = ['Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo', 'Inna']

interface Inputs {
  registrationNumber: string
  brand: string
  model: string
  year: number
  engineCapacity: number
  vehicleValue: number
  vin: string
  driverAge: number
  licenseYears: number
  claimsLast3Years: 0 | 1 | 2 | 3
  currentInsurer: string
  bmDiscount: 0 | 10 | 20 | 30 | 40 | 50
  scope: 'oc' | 'oc_ac' | 'oc_ac_assistance' | 'full'
  deductible: 0 | 500 | 1000 | 1500
  windowsCoverage: boolean
  nnwDriver: boolean
}

export function CalculatorOcAc() {
  const [step, setStep] = useState(0)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrMsg, setOcrMsg] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Inputs>({
    registrationNumber: '', brand: '', model: '', year: 2020,
    engineCapacity: 1600, vehicleValue: 50000, vin: '',
    driverAge: 35, licenseYears: 10, claimsLast3Years: 0,
    currentInsurer: '', bmDiscount: 30, scope: 'oc_ac',
    deductible: 500, windowsCoverage: false, nnwDriver: false,
  })

  function patch(p: Partial<Inputs>) { setInputs((s) => ({ ...s, ...p })) }

  async function handleOcrUpload(file: File) {
    setOcrLoading(true); setOcrMsg(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/ocr/dowod-rejestracyjny', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        patch({
          brand: data.data.brand, model: data.data.model, year: data.data.year,
          engineCapacity: data.data.engineCapacity, vin: data.data.vin,
          registrationNumber: data.data.registrationNumber,
        })
        setOcrMsg(data.stub ? '✓ Dane wypełnione (demo OCR – po podłączeniu GCV będzie rozpoznawać Twój dokument)' : '✓ Dane rozpoznane')
      } else {
        setOcrMsg('Nie udało się rozpoznać dokumentu. Wypełnij dane ręcznie.')
      }
    } catch {
      setOcrMsg('Błąd uploadu. Wypełnij dane ręcznie.')
    } finally {
      setOcrLoading(false)
    }
  }

  const result = useMemo(() => {
    let ocBase = 800
    ocBase += Math.max(0, (35 - inputs.driverAge)) * 30
    ocBase += inputs.claimsLast3Years * 250
    ocBase *= (1 - inputs.bmDiscount / 100)
    ocBase += (inputs.engineCapacity / 100) * 8
    const ocLow = Math.round(ocBase * 0.85)
    const ocHigh = Math.round(ocBase * 1.25)

    let acBase = inputs.vehicleValue * 0.045
    acBase *= (1 - inputs.bmDiscount / 200)
    acBase -= inputs.deductible * 0.15
    if (inputs.windowsCoverage) acBase += 180
    if (inputs.nnwDriver) acBase += 90
    const acLow = Math.round(Math.max(400, acBase * 0.9))
    const acHigh = Math.round(acBase * 1.3)

    const includeAc = inputs.scope !== 'oc'
    const annualMid = (ocLow + ocHigh) / 2 + (includeAc ? (acLow + acHigh) / 2 : 0)
    const monthly = Math.round(annualMid / 12 * 1.05) // +5% za miesięczne raty
    return { ocLow, ocHigh, acLow, acHigh, annualMid: Math.round(annualMid), monthly, includeAc }
  }, [inputs])

  return (
    <div className="space-y-6">
      <Stepper steps={['Pojazd', 'Kierowca', 'Zakres', 'Wynik']} current={step} />
      <CalculatorDisclaimer />

      {step === 0 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 1 – Dane pojazdu</h2>

          <div className="bg-gold-50 border-2 border-dashed border-gold-300 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📄</div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-700 mb-1">Wgraj skan dowodu rejestracyjnego</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Automatycznie wypełnimy markę, model, rok, VIN i numer rejestracyjny.
                </p>
                <label className="inline-block">
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleOcrUpload(e.target.files[0])} disabled={ocrLoading} />
                  <span className="btn-gold !py-2 !px-4 text-sm cursor-pointer">
                    {ocrLoading ? 'Rozpoznaję…' : 'Wybierz plik (JPG/PNG/PDF)'}
                  </span>
                </label>
                {ocrMsg && <p className="text-xs text-brand-700 mt-3 font-medium">{ocrMsg}</p>}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Numer rejestracyjny</label>
              <input type="text" className="input-field uppercase" value={inputs.registrationNumber} onChange={(e) => patch({ registrationNumber: e.target.value.toUpperCase() })} placeholder="WA 12345" />
            </div>
            <div>
              <label className="label">VIN (opcjonalnie)</label>
              <input type="text" className="input-field uppercase" maxLength={17} value={inputs.vin} onChange={(e) => patch({ vin: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="label">Marka</label>
              <select className="input-field" value={inputs.brand} onChange={(e) => patch({ brand: e.target.value })}>
                <option value="">-- wybierz --</option>
                {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Model</label>
              <input type="text" className="input-field" value={inputs.model} onChange={(e) => patch({ model: e.target.value })} />
            </div>
          </div>

          <Slider label="Rok produkcji" value={inputs.year} min={1990} max={2025} step={1} onChange={(v) => patch({ year: v })} format={(v) => String(v)} />
          <Slider label="Pojemność silnika" value={inputs.engineCapacity} min={600} max={6500} step={100} onChange={(v) => patch({ engineCapacity: v })} format={(v) => `${v} cm³`} />
          <Slider label="Wartość pojazdu" value={inputs.vehicleValue} min={5000} max={500000} step={5000} onChange={(v) => patch({ vehicleValue: v })} format={formatCurrency} />

          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} disabled={!inputs.brand || !inputs.model} className="btn-primary">Dalej →</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 2 – Dane kierowcy</h2>

          <Slider label="Wiek głównego kierowcy" value={inputs.driverAge} min={18} max={85} step={1} onChange={(v) => patch({ driverAge: v })} format={(v) => `${v} lat`} />
          <Slider label="Staż prawa jazdy" value={inputs.licenseYears} min={0} max={60} step={1} onChange={(v) => patch({ licenseYears: v })} format={(v) => `${v} lat`} />

          <div>
            <label className="label">Liczba szkód z ostatnich 3 lat</label>
            <div className="grid grid-cols-4 gap-2">
              {([0, 1, 2, 3] as const).map((n) => (
                <button key={n} type="button" onClick={() => patch({ claimsLast3Years: n })} className={`py-3 rounded-lg border-2 font-semibold ${inputs.claimsLast3Years === n ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{n === 3 ? '3+' : n}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Aktualny ubezpieczyciel</label>
            <select className="input-field" value={inputs.currentInsurer} onChange={(e) => patch({ currentInsurer: e.target.value })}>
              <option value="">Pierwszy raz ubezpieczam</option>
              <option value="TU 1">TU 1</option>
              <option value="TU 2">TU 2</option>
              <option value="TU 3">TU 3</option>
              <option value="TU 4">TU 4</option>
              <option value="TU 5">TU 5</option>
              <option value="Inny">Inny</option>
            </select>
          </div>

          <div>
            <label className="label">Aktualna zniżka BM</label>
            <div className="grid grid-cols-6 gap-2">
              {([0, 10, 20, 30, 40, 50] as const).map((d) => (
                <button key={d} type="button" onClick={() => patch({ bmDiscount: d })} className={`py-3 rounded-lg border-2 text-sm font-semibold ${inputs.bmDiscount === d ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{d}%</button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Wstecz</button>
            <button type="button" onClick={() => setStep(2)} className="btn-primary">Dalej →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 3 – Zakres</h2>

          <div>
            <label className="label">Zakres ochrony</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {([
                { v: 'oc', l: 'Tylko OC' },
                { v: 'oc_ac', l: 'OC + AC' },
                { v: 'oc_ac_assistance', l: 'OC + AC + Assistance' },
                { v: 'full', l: 'Pełny pakiet' },
              ] as const).map((o) => (
                <button key={o.v} type="button" onClick={() => patch({ scope: o.v })} className={`py-3 px-4 rounded-lg border-2 font-semibold text-left ${inputs.scope === o.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{o.l}</button>
              ))}
            </div>
          </div>

          {inputs.scope !== 'oc' && (
            <>
              <div>
                <label className="label">Udział własny AC</label>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 500, 1000, 1500] as const).map((d) => (
                    <button key={d} type="button" onClick={() => patch({ deductible: d })} className={`py-3 rounded-lg border-2 text-sm font-semibold ${inputs.deductible === d ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{d === 0 ? '0 zł' : `${d} zł`}</button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer ${inputs.windowsCoverage ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <input type="checkbox" checked={inputs.windowsCoverage} onChange={(e) => patch({ windowsCoverage: e.target.checked })} className="accent-brand-600 w-5 h-5" />
                  <span className="font-medium">Ubezpieczenie szyb</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer ${inputs.nnwDriver ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <input type="checkbox" checked={inputs.nnwDriver} onChange={(e) => patch({ nnwDriver: e.target.checked })} className="accent-brand-600 w-5 h-5" />
                  <span className="font-medium">NNW kierowcy</span>
                </label>
              </div>
            </>
          )}

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
            <div className="text-4xl md:text-5xl font-bold">{formatCurrency(result.annualMid)} <span className="text-lg text-brand-100">/ rok</span></div>
            <p className="text-brand-100 text-sm mt-2">Lub {formatCurrency(result.monthly)} / miesiąc (raty)</p>
            <p className="text-xs text-brand-200 mt-3 italic">Skontaktuj się z agentem aby otrzymać dokładną ofertę.</p>
          </div>

          <div className="card space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Szacunkowe OC</span><span className="font-semibold">{formatCurrency(result.ocLow)} – {formatCurrency(result.ocHigh)} / rok</span></div>
            {result.includeAc && <div className="flex justify-between text-sm"><span className="text-gray-600">Szacunkowe AC</span><span className="font-semibold">{formatCurrency(result.acLow)} – {formatCurrency(result.acHigh)} / rok</span></div>}
            <div className="border-t pt-3 flex justify-between text-xs text-gray-500"><span>Różnica rocznie vs miesięcznie</span><span>{formatCurrency(result.monthly * 12 - result.annualMid)}</span></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">← Zmień parametry</button>
            <Link href={{ pathname: '/wniosek', query: { product: 'oc_ac', data: btoa(unescape(encodeURIComponent(JSON.stringify(inputs)))) } }} className="btn-primary flex-1">Chcę złożyć wniosek →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
