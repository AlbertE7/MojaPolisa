'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { AnkForm, type AnkAnswers } from './AnkForm'
import { PersonalDataForm, type PersonalData } from './PersonalDataForm'
import { BeneficiaryForm, type Beneficiary } from './BeneficiaryForm'
import { MedicalQuestionnaire, type MedicalAnswers } from './MedicalQuestionnaire'
import { Stepper } from '@/components/calculator/Stepper'

type FlowStep = 'ank' | 'personal' | 'beneficiary' | 'medical' | 'consents' | 'review' | 'registration' | 'submitted'

interface ApplicationState {
  product?: ProductType
  calculatorData?: unknown
  ank?: AnkAnswers
  ankMeta?: { acceptedAt: string }
  personal?: PersonalData
  beneficiaries?: Beneficiary[]
  medical?: MedicalAnswers
  consents?: {
    rodo: boolean
    health_data: boolean
    contact_email: boolean
    contact_phone: boolean
    truthful: boolean
  }
}

export function ApplicationFlow() {
  const sp = useSearchParams()
  const router = useRouter()
  const productParam = (sp.get('product') as ProductType | null) ?? 'life_a'
  const dataParam = sp.get('data')

  const [step, setStep] = useState<FlowStep>('ank')
  const [state, setState] = useState<ApplicationState>(() => {
    let calc: unknown
    if (dataParam) {
      try { calc = JSON.parse(decodeURIComponent(escape(atob(dataParam)))) } catch {}
    }
    return { product: productParam, calculatorData: calc }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLife = state.product === 'life_a' || state.product === 'life_b'

  const visibleSteps = isLife
    ? ['ANK', 'Dane', 'Uposażony', 'Ankieta med.', 'Zgody', 'Podsumowanie']
    : ['ANK', 'Dane', 'Zgody', 'Podsumowanie']
  const stepIndex = (() => {
    const map: Record<FlowStep, number> = isLife
      ? { ank: 0, personal: 1, beneficiary: 2, medical: 3, consents: 4, review: 5, registration: 5, submitted: 5 }
      : { ank: 0, personal: 1, beneficiary: 1, medical: 1, consents: 2, review: 3, registration: 3, submitted: 3 }
    return map[step]
  })()

  async function submit() {
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      if (!res.ok) throw new Error(await res.text())
      setStep('submitted')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wysłać wniosku')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gold-500 uppercase tracking-wide mb-1">Wniosek</p>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-700">{PRODUCT_LABELS[state.product ?? 'life_a']}</h1>
      </div>

      {step !== 'submitted' && <Stepper steps={visibleSteps} current={stepIndex} />}

      {step === 'ank' && (
        <AnkForm
          productType={isLife ? 'life' : state.product === 'investment' ? 'investment' : state.product?.startsWith('oc') ? 'oc_ac' : 'property'}
          onSubmit={(answers, meta) => {
            setState((s) => ({ ...s, ank: answers, ankMeta: meta }))
            setStep('personal')
          }}
        />
      )}

      {step === 'personal' && (
        <PersonalDataForm
          onSubmit={(p) => {
            setState((s) => ({ ...s, personal: p }))
            setStep(isLife ? 'beneficiary' : 'consents')
          }}
        />
      )}

      {step === 'beneficiary' && isLife && (
        <BeneficiaryForm
          onSubmit={(b) => {
            setState((s) => ({ ...s, beneficiaries: b }))
            setStep('medical')
          }}
          onSkip={() => {
            setState((s) => ({ ...s, beneficiaries: [] }))
            setStep('medical')
          }}
        />
      )}

      {step === 'medical' && isLife && (
        <MedicalQuestionnaire
          onSubmit={(m) => {
            setState((s) => ({ ...s, medical: m }))
            setStep('consents')
          }}
        />
      )}

      {step === 'consents' && (
        <ConsentsStep
          isLife={isLife}
          onSubmit={(c) => {
            setState((s) => ({ ...s, consents: c }))
            setStep('review')
          }}
        />
      )}

      {step === 'review' && (
        <Review state={state} onBack={() => setStep('consents')} onConfirm={submit} submitting={submitting} error={error} />
      )}

      {step === 'submitted' && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-brand-700 mb-3">Wniosek złożony!</h2>
          <p className="text-gray-600 mb-6">
            Dziękujemy. Kopia wniosku trafiła na Twój email. Skontaktuje się z Tobą agent prowadzący.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={() => router.push('/dashboard')} className="btn-primary">Sprawdź status polisy</button>
            <button type="button" onClick={() => router.push('/')} className="btn-secondary">Wróć do strony głównej</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ConsentsStep({ isLife, onSubmit }: { isLife: boolean; onSubmit: (c: ApplicationState['consents']) => void }) {
  const [c, setC] = useState({ rodo: false, health_data: false, contact_email: false, contact_phone: false, truthful: false })
  const requiredConsents = isLife
    ? c.rodo && c.health_data && c.truthful
    : c.rodo && c.truthful

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Wymagane zgody</h2>
        <div className="space-y-3">
          <ConsentCheck checked={c.rodo} onChange={(v) => setC({ ...c, rodo: v })} required label="Zgoda na przetwarzanie danych osobowych (RODO art. 6) zgodnie z polityką prywatności EPRO Sp. z o.o." />
          {isLife && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <ConsentCheck checked={c.health_data} onChange={(v) => setC({ ...c, health_data: v })} required label="Wyrażam wyraźną zgodę na przetwarzanie danych dotyczących zdrowia (RODO art. 9). Ta zgoda jest wymagana do oceny ryzyka ubezpieczeniowego." />
            </div>
          )}
          <ConsentCheck checked={c.contact_email} onChange={(v) => setC({ ...c, contact_email: v })} label="Zgoda na kontakt email" />
          <ConsentCheck checked={c.contact_phone} onChange={(v) => setC({ ...c, contact_phone: v })} label="Zgoda na kontakt telefoniczny" />
          {isLife && (
            <ConsentCheck checked={c.truthful} onChange={(v) => setC({ ...c, truthful: v })} required label="Oświadczam, że wszystkie powyższe informacje (dane osobowe i ankieta medyczna) są zgodne z prawdą. Jestem świadomy(a) skutków podania nieprawdziwych danych." />
          )}
          {!isLife && (
            <ConsentCheck checked={c.truthful} onChange={(v) => setC({ ...c, truthful: v })} required label="Oświadczam, że wszystkie podane dane są zgodne z prawdą." />
          )}
        </div>
      </div>

      <button type="button" onClick={() => requiredConsents && onSubmit(c)} disabled={!requiredConsents} className="btn-primary w-full text-lg py-4">
        Pokaż podsumowanie →
      </button>
    </div>
  )
}

function ConsentCheck({ checked, onChange, label, required }: { checked: boolean; onChange: (v: boolean) => void; label: string; required?: boolean }) {
  return (
    <label className="flex gap-3 items-start cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-brand-600 w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{label} {required && <span className="text-red-600">*</span>}</span>
    </label>
  )
}

function Review({ state, onBack, onConfirm, submitting, error }: { state: ApplicationState; onBack: () => void; onConfirm: () => void; submitting: boolean; error: string | null }) {
  const isLife = state.product === 'life_a' || state.product === 'life_b'
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Podsumowanie wniosku</h2>
        <div className="space-y-3 text-sm">
          <Row label="Produkt" value={PRODUCT_LABELS[state.product ?? 'life_a']} />
          <Row label="Imię i nazwisko" value={`${state.personal?.first_name} ${state.personal?.last_name}`} />
          <Row label="PESEL" value={state.personal?.pesel ?? '-'} />
          <Row label="Email" value={state.personal?.email ?? '-'} />
          <Row label="Telefon" value={state.personal?.phone ?? '-'} />
          {isLife && (
            state.beneficiaries && state.beneficiaries.length > 0 ? (
              <Row label="Uposażeni" value={state.beneficiaries.map((b) => `${b.first_name} ${b.last_name} (${b.share}%)`).join(', ')} />
            ) : (
              <Row label="Uposażeni" value={<span className="text-gray-500 italic">brak — wypłata wg prawa spadkowego (kodeks cywilny)</span>} />
            )
          )}
          <Row label="ANK zaakceptowana" value={state.ankMeta?.acceptedAt ? new Date(state.ankMeta.acceptedAt).toLocaleString('pl-PL') : '-'} />
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-800 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">← Wstecz</button>
        <button type="button" onClick={onConfirm} disabled={submitting} className="btn-primary flex-1">
          {submitting ? 'Wysyłam...' : 'Złóż wniosek'}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
