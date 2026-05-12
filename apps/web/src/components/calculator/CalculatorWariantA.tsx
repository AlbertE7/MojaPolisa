'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  calculateLifeA,
  calculateBmi,
  formatCurrency,
  type LifeAInputs,
  type LifeARiders,
} from '@mojapolisa/shared'
import { CalculatorDisclaimer } from '@mojapolisa/ui'
import { Slider } from './Slider'
import { Toggle } from './Toggle'
import { Stepper } from './Stepper'

const DEFAULT_RIDERS: LifeARiders = {
  accidentalDeath: { enabled: false, sum: 40000 },
  surgery: { enabled: false, sum: 20000 },
  permanentDisabilityAccident: { enabled: false, sum: 100000 },
  hospitalization: { enabled: false, dailyBenefit: 300 },
  disabilityPension: { enabled: false, monthlyBenefit: 833 },
  permanentIncapacity: { enabled: false, sum: 500000 },
  cancerDiagnosis: { enabled: false, sum: 50000 },
  cancerTreatment: { enabled: false, sum: 50000 },
  seriousIllness: { enabled: false, sum: 100000, variant: 'oncological' },
  treatmentAbroad: { enabled: false, variant: 'I' },
  medicalOpinion: { enabled: false, variant: 'individual' },
  eConsultations: { enabled: false, variant: 'individual' },
  medicalAssistance: { enabled: false, variant: 'standard' },
  yourHealth: { enabled: false, variant: 'individual' },
  premiumWaiver: { enabled: false },
}

export function CalculatorWariantA() {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<LifeAInputs>({
    age: 30,
    gender: 'M',
    height: 178,
    weight: 78,
    smoker: false,
    occupation: '',
    sumInsured: 300000,
    term: 35,
    sumVariant: 'fixed',
    terminalIllness: true,
    frequency: 'monthly',
    riders: DEFAULT_RIDERS,
  })

  const bmi = useMemo(() => calculateBmi(inputs.height, inputs.weight), [inputs.height, inputs.weight])
  const result = useMemo(() => calculateLifeA(inputs), [inputs])
  const ageInvalid = inputs.age > 60 || inputs.age < 18

  function patch(p: Partial<LifeAInputs>) { setInputs((s) => ({ ...s, ...p })) }
  function patchRider<K extends keyof LifeARiders>(k: K, val: Partial<LifeARiders[K]>) {
    setInputs((s) => ({ ...s, riders: { ...s.riders, [k]: { ...s.riders[k], ...val } } }))
  }

  return (
    <div className="space-y-6">
      <Stepper steps={['Dane podstawowe', 'Umowa główna', 'Umowy dodatkowe', 'Wynik']} current={step} />
      <CalculatorDisclaimer />

      {step === 0 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 1 – Dane podstawowe</h2>

          {ageInvalid && inputs.age > 60 && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 text-sm">
              Dla osób powyżej 60 roku życia oferta wymaga indywidualnej kalkulacji.
              {' '}
              <a href="https://finvita.pl/kontakt" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                Skontaktuj się z agentem →
              </a>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Slider label="Wiek" value={inputs.age} min={18} max={70} step={1} onChange={(v) => patch({ age: v })} format={(v) => `${v} lat`} />
            <div>
              <label className="label">Płeć</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => patch({ gender: 'M' })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.gender === 'M' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Mężczyzna</button>
                <button type="button" onClick={() => patch({ gender: 'K' })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.gender === 'K' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Kobieta</button>
              </div>
            </div>
            <Slider label="Wzrost" value={inputs.height} min={140} max={210} step={1} onChange={(v) => patch({ height: v })} format={(v) => `${v} cm`} />
            <Slider label="Waga" value={inputs.weight} min={40} max={180} step={1} onChange={(v) => patch({ weight: v })} format={(v) => `${v} kg`} hint={`BMI: ${bmi}${bmi >= 30 ? ' (wpływa na ocenę ryzyka)' : ''}`} />
          </div>

          <div>
            <label className="label">Palenie tytoniu w ciągu ostatniego roku</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => patch({ smoker: true })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.smoker ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Tak</button>
              <button type="button" onClick={() => patch({ smoker: false })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${!inputs.smoker ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Nie</button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="occupation">Zawód</label>
            <input id="occupation" type="text" className="input-field" value={inputs.occupation} onChange={(e) => patch({ occupation: e.target.value })} placeholder="np. programista, nauczyciel, kierowca..." />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(1)} disabled={ageInvalid} className="btn-primary">
              Dalej →
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-brand-700">Krok 2 – Umowa główna</h2>

          <Slider label="Suma ubezpieczenia" value={inputs.sumInsured} min={50000} max={1000000} step={10000} onChange={(v) => patch({ sumInsured: v })} format={formatCurrency} />

          <div>
            <label className="label">Okres ubezpieczenia</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25, 30, 35].map((y) => (
                <button key={y} type="button" onClick={() => patch({ term: y })} className={`py-2 rounded-lg border-2 text-sm font-semibold ${inputs.term === y ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{y} lat</button>
              ))}
              <button type="button" onClick={() => patch({ term: 'whole_life' })} className={`py-2 rounded-lg border-2 text-sm font-semibold col-span-2 ${inputs.term === 'whole_life' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Na całe życie</button>
            </div>
          </div>

          <div>
            <label className="label">Wariant sumy</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => patch({ sumVariant: 'fixed' })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.sumVariant === 'fixed' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Stała</button>
              <button type="button" onClick={() => patch({ sumVariant: 'decreasing' })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.sumVariant === 'decreasing' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Malejąca</button>
            </div>
          </div>

          <div>
            <label className="label">Choroba śmiertelna w zakresie <span className="text-xs text-gray-500">(nie zwiększa składki)</span></label>
            <div className="flex gap-2">
              <button type="button" onClick={() => patch({ terminalIllness: true })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${inputs.terminalIllness ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Tak</button>
              <button type="button" onClick={() => patch({ terminalIllness: false })} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${!inputs.terminalIllness ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Nie</button>
            </div>
          </div>

          <div>
            <label className="label">Częstotliwość płatności</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { v: 'monthly', l: 'Miesięczna', d: '' },
                { v: 'quarterly', l: 'Kwartalna', d: '−1%' },
                { v: 'semi-annual', l: 'Półroczna', d: '−2,5%' },
                { v: 'annual', l: 'Roczna', d: '−5%' },
              ] as const).map((opt) => (
                <button key={opt.v} type="button" onClick={() => patch({ frequency: opt.v })} className={`py-3 rounded-lg border-2 text-sm font-semibold ${inputs.frequency === opt.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                  <div>{opt.l}</div>
                  {opt.d && <div className="text-xs text-gold-500 font-bold">{opt.d}</div>}
                </button>
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
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-brand-700 mb-2">Krok 3 – Umowy dodatkowe</h2>
            <p className="text-sm text-gray-600">Wybierz tyle, ile potrzebujesz. Każda umowa zwiększa zakres ochrony.</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wide">Ryzyka wypadkowe</h3>

            <Toggle label="Śmierć w wyniku wypadku" description="Składka poglądowa: ~0,14 zł/mies. per 1000 zł SU" enabled={inputs.riders.accidentalDeath.enabled} onChange={(v) => patchRider('accidentalDeath', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.accidentalDeath.sum} min={10000} max={500000} step={10000} onChange={(v) => patchRider('accidentalDeath', { sum: v })} format={formatCurrency} />
            </Toggle>

            <Toggle label="Operacja chirurgiczna (611 operacji w tabeli)" description="Pula odnawia się co roku. Składka poglądowa: ~1,25 zł/mies. per 1000 zł SU" enabled={inputs.riders.surgery.enabled} onChange={(v) => patchRider('surgery', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.surgery.sum} min={5000} max={100000} step={5000} onChange={(v) => patchRider('surgery', { sum: v })} format={formatCurrency} />
            </Toggle>

            <Toggle label="Trwały uszczerbek + Pakiet Wsparcie+" description="Świadczenie od 1% uszczerbku. Assistance rehabilitacyjny. ~0,80 zł/mies. per 1000 zł SU" enabled={inputs.riders.permanentDisabilityAccident.enabled} onChange={(v) => patchRider('permanentDisabilityAccident', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.permanentDisabilityAccident.sum} min={10000} max={500000} step={10000} onChange={(v) => patchRider('permanentDisabilityAccident', { sum: v })} format={formatCurrency} />
            </Toggle>

            <Toggle label="Pobyt w szpitalu (od 1 dnia)" description="Maks. 92 dni/rok. Pierwszy dzień jeśli hospitalizacja min. 12 godzin." enabled={inputs.riders.hospitalization.enabled} onChange={(v) => patchRider('hospitalization', { enabled: v })}>
              <Slider label="Świadczenie dzienne" value={inputs.riders.hospitalization.dailyBenefit} min={100} max={1000} step={50} onChange={(v) => patchRider('hospitalization', { dailyBenefit: v })} format={(v) => `${v} PLN/dzień`} />
            </Toggle>

            <Toggle label="Poważna utrata zdrowia (renta wypadkowa)" description="Comiesięczna renta jeśli utrata zdrowia ≥60%, do końca okresu ubezpieczenia." enabled={inputs.riders.disabilityPension.enabled} onChange={(v) => patchRider('disabilityPension', { enabled: v })}>
              <Slider label="Świadczenie miesięczne" value={inputs.riders.disabilityPension.monthlyBenefit} min={500} max={5000} step={100} onChange={(v) => patchRider('disabilityPension', { monthlyBenefit: v })} format={(v) => `${v} PLN/mies.`} />
            </Toggle>

            <Toggle label="Trwała niezdolność do pracy" description="Jednorazowe świadczenie. TNP orzeczona na min. 2 lata. ~0,12 zł/mies. per 1000 zł SU" enabled={inputs.riders.permanentIncapacity.enabled} onChange={(v) => patchRider('permanentIncapacity', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.permanentIncapacity.sum} min={50000} max={1000000} step={50000} onChange={(v) => patchRider('permanentIncapacity', { sum: v })} format={formatCurrency} />
            </Toggle>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wide">Ryzyka zdrowotne / onkologiczne</h3>

            <Toggle label="Nowotwór – zdiagnozowanie" description="Złośliwy 100% SU / łagodny mózgu 100% / in situ 20% / łagodny 10%" enabled={inputs.riders.cancerDiagnosis.enabled} onChange={(v) => patchRider('cancerDiagnosis', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.cancerDiagnosis.sum} min={10000} max={500000} step={10000} onChange={(v) => patchRider('cancerDiagnosis', { sum: v })} format={formatCurrency} />
            </Toggle>

            <Toggle label="Nowotwór złośliwy – leczenie" description="Radioterapia, chemioterapia lub operacja onkologiczna. Maks. 100% SU rocznie." enabled={inputs.riders.cancerTreatment.enabled} onChange={(v) => patchRider('cancerTreatment', { enabled: v })}>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.cancerTreatment.sum} min={10000} max={500000} step={10000} onChange={(v) => patchRider('cancerTreatment', { sum: v })} format={formatCurrency} />
            </Toggle>

            <Toggle label="Poważne zachorowanie" description="Wybierz wariant zakresu chorób." enabled={inputs.riders.seriousIllness.enabled} onChange={(v) => patchRider('seriousIllness', { enabled: v })}>
              <div>
                <label className="label">Wariant zakresu</label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {([
                    { v: 'oncological', l: '7 chorób onko' },
                    { v: 'cardio', l: '16 chorób' },
                    { v: 'extended', l: '64 choroby' },
                  ] as const).map((opt) => (
                    <button key={opt.v} type="button" onClick={() => patchRider('seriousIllness', { variant: opt.v })} className={`py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.seriousIllness.variant === opt.v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>{opt.l}</button>
                  ))}
                </div>
              </div>
              <Slider label="Suma ubezpieczenia" value={inputs.riders.seriousIllness.sum} min={10000} max={500000} step={10000} onChange={(v) => patchRider('seriousIllness', { sum: v })} format={formatCurrency} />
            </Toggle>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wide">Usługi medyczne</h3>

            <Toggle label="Leczenie za granicą" description="Nowotwory, neurochirurgia, kardiochirurgia, transplantologia. Europa (bez CH i RU)." enabled={inputs.riders.treatmentAbroad.enabled} onChange={(v) => patchRider('treatmentAbroad', { enabled: v })}>
              <div>
                <label className="label">Pakiet</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => patchRider('treatmentAbroad', { variant: 'I' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.treatmentAbroad.variant === 'I' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Indywidualny I (~27 zł/mies.)</button>
                  <button type="button" onClick={() => patchRider('treatmentAbroad', { variant: 'II' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.treatmentAbroad.variant === 'II' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Indywidualny II</button>
                </div>
              </div>
            </Toggle>

            <Toggle label="Ekspercka Opinia Medyczna" description="2 opinie/rok. Analiza dokumentacji medycznej. Od ~22 zł/mies." enabled={inputs.riders.medicalOpinion.enabled} onChange={(v) => patchRider('medicalOpinion', { enabled: v })}>
              <div className="flex gap-2">
                <button type="button" onClick={() => patchRider('medicalOpinion', { variant: 'individual' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.medicalOpinion.variant === 'individual' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Indywidualna</button>
                <button type="button" onClick={() => patchRider('medicalOpinion', { variant: 'family' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.medicalOpinion.variant === 'family' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Rodzinna</button>
              </div>
            </Toggle>

            <Toggle label="E-konsultacje medyczne" description="5 e-konsultacji/rok (POZ + 17 specjalizacji + psycholog). Od ~25 zł/mies." enabled={inputs.riders.eConsultations.enabled} onChange={(v) => patchRider('eConsultations', { enabled: v })}>
              <div className="flex gap-2">
                <button type="button" onClick={() => patchRider('eConsultations', { variant: 'individual' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.eConsultations.variant === 'individual' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Indywidualne</button>
                <button type="button" onClick={() => patchRider('eConsultations', { variant: 'family' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.eConsultations.variant === 'family' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Rodzinne</button>
              </div>
            </Toggle>

            <Toggle label="Assistance medyczny" description="Wizyta domowa po wypadku, transport medyczny, opieka nad dziećmi. Od ~3-5 zł/mies." enabled={inputs.riders.medicalAssistance.enabled} onChange={(v) => patchRider('medicalAssistance', { enabled: v })}>
              <div className="flex gap-2">
                <button type="button" onClick={() => patchRider('medicalAssistance', { variant: 'standard' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.medicalAssistance.variant === 'standard' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Standard</button>
                <button type="button" onClick={() => patchRider('medicalAssistance', { variant: 'premium' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.medicalAssistance.variant === 'premium' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Premium</button>
              </div>
            </Toggle>

            <Toggle label="Twoje Zdrowie" description="2 wizyty POZ + 1 specjalista + RTG + USG + pakiet 18 badań lab./rok. ~70 zł/mies." enabled={inputs.riders.yourHealth.enabled} onChange={(v) => patchRider('yourHealth', { enabled: v })}>
              <div className="flex gap-2">
                <button type="button" onClick={() => patchRider('yourHealth', { variant: 'individual' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.yourHealth.variant === 'individual' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Indywidualny</button>
                <button type="button" onClick={() => patchRider('yourHealth', { variant: 'family' })} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${inputs.riders.yourHealth.variant === 'family' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Rodzinny</button>
              </div>
            </Toggle>

            <Toggle label="Przejęcie opłacania składki" description="Po poważnym zachorowaniu TU przejmuje opłacanie składek (maks. 30 lat). ~54 zł/mies." enabled={inputs.riders.premiumWaiver.enabled} onChange={(v) => patchRider('premiumWaiver', { enabled: v })} />
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
            <p className="text-brand-100 text-sm font-semibold uppercase tracking-wide mb-2">Twoja orientacyjna składka</p>
            <div className="text-5xl md:text-6xl font-bold mb-2">{formatCurrency(result.totalMonthly)}</div>
            <p className="text-brand-100">/ miesiąc</p>
            {result.annualSavings > 0 && (
              <p className="mt-4 text-gold-300 font-semibold text-sm">
                Oszczędność za częstotliwość: {formatCurrency(result.annualSavings)} / rok
              </p>
            )}
          </div>

          <div className="card space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Umowa główna ({formatCurrency(inputs.sumInsured)})</span>
              <span className="font-semibold">{formatCurrency(result.mainPremium)}/mies.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Umowy dodatkowe</span>
              <span className="font-semibold">{formatCurrency(result.ridersPremium)}/mies.</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-base">
              <span className="font-bold text-brand-700">Łącznie</span>
              <span className="font-bold text-brand-700">{formatCurrency(result.totalMonthly)}/mies.</span>
            </div>
          </div>

          {result.coverageSummary.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-brand-700 mb-3">Zakres wybranej ochrony</h3>
              <ul className="space-y-2 text-sm">
                {result.coverageSummary.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-gold-500">✓</span><span>{item}</span></li>
                ))}
              </ul>
            </div>
          )}

          <CalculatorDisclaimer />

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">← Zmień parametry</button>
            <Link
              href={{ pathname: '/wniosek', query: { product: 'life_a', data: btoa(unescape(encodeURIComponent(JSON.stringify(inputs)))) } }}
              className="btn-primary flex-1"
            >
              Chcę złożyć wniosek →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
