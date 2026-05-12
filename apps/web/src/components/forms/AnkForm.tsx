'use client'

import { useState } from 'react'

export interface AnkAnswers {
  q1?: 'individual' | 'company'
  q2?: boolean
  q3?: 'health' | 'savings' | 'investment'
  q4_health_close?: boolean
  q4_health_illness?: boolean
  q4_health_illness_benefits?: string[]
  q4_health_accident?: boolean
  q4_health_accident_benefits?: string[]
  q4_health_disability?: boolean
  q4_health_disability_benefits?: string[]
  q4_health_children?: boolean
  q4_health_children_benefits?: string[]
  q5?: 'regular' | 'lump_sum'
  q6?: boolean
  q7?: boolean
  q8?: 'under_10' | '10_19' | '20_plus'
  q9?: '1' | '2' | '3' | '4'
  pep_current?: boolean
  pep_current_desc?: string
  pep_past?: boolean
  pep_past_desc?: string
  consent_rodo?: boolean
  consent_marketing_email?: boolean
  consent_marketing_phone?: boolean
  consent_ank?: boolean
}

interface Props {
  onSubmit: (answers: AnkAnswers, meta: { acceptedAt: string }) => void
  productType?: 'life' | 'oc_ac' | 'property' | 'investment'
}

export function AnkForm({ onSubmit, productType = 'life' }: Props) {
  const [a, setA] = useState<AnkAnswers>({})
  function set<K extends keyof AnkAnswers>(k: K, v: AnkAnswers[K]) {
    setA((s) => ({ ...s, [k]: v }))
  }
  function toggleArr(k: keyof AnkAnswers, val: string) {
    const arr = (a[k] as string[] | undefined) ?? []
    set(k, (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]) as never)
  }

  const showQ5 = a.q3 === 'savings' || a.q3 === 'investment'
  const q4Valid = a.q4_health_close || a.q4_health_illness || a.q4_health_accident || a.q4_health_disability || a.q4_health_children
  const canSubmit = a.q1 && a.q2 !== undefined && a.q3 && q4Valid && a.q6 !== undefined && a.q7 !== undefined && a.q8 && a.q9 && a.pep_current !== undefined && a.pep_past !== undefined && a.consent_rodo && a.consent_ank && (!showQ5 || a.q5)

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit(a, { acceptedAt: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      <div className="card bg-brand-50 border-brand-200">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">Ankieta potrzeb klienta | APK</h1>
        <p className="text-xs text-gray-600 leading-relaxed">
          Podstawa prawna: art. 8 Ustawy z dnia 15 grudnia 2017 o dystrybucji ubezpieczeń oraz
          art. 12 rozporządzenia delegowanego Komisji (UE) 2017/2358. Wszystkie informacje są
          objęte tajemnicą ubezpieczeniową.
        </p>
      </div>

      {/* Q1 */}
      <Question n={1} title="Czy jest Pan/Pani zainteresowana ubezpieczeniem indywidualnym?">
        <Radio name="q1" value="individual" checked={a.q1 === 'individual'} onChange={() => set('q1', 'individual')} label="Tak" />
        <Radio name="q1" value="company" checked={a.q1 === 'company'} onChange={() => set('q1', 'company')} label="Nie, firmowym" />
      </Question>

      {/* Q2 */}
      <Question n={2} title="Czy posiada Pani/Pan stałe źródło dochodu, interesuje Panią/Pana regularne, długoterminowe gromadzenie oszczędności i posiada Pani/Pan możliwość regularnych wpłat?">
        <Radio name="q2" checked={a.q2 === true} onChange={() => set('q2', true)} label="Tak" />
        <Radio name="q2" checked={a.q2 === false} onChange={() => set('q2', false)} label="Nie" />
      </Question>

      {/* Q3 */}
      <Question n={3} title="Jaką potrzebę chce Pan/Pani zabezpieczyć?">
        <Radio name="q3" checked={a.q3 === 'health'} onChange={() => set('q3', 'health')} label="Przede wszystkim ochrona życia lub zdrowia" />
        <Radio name="q3" checked={a.q3 === 'savings'} onChange={() => set('q3', 'savings')} label="Przede wszystkim oszczędzanie na przyszłość" />
        <Radio name="q3" checked={a.q3 === 'investment'} onChange={() => set('q3', 'investment')} label="Przede wszystkim inwestowanie posiadanych środków" />
      </Question>

      {/* Q4 - sekcja życie/zdrowie */}
      <Question n={4} title="Na wypadek jakich zdarzeń chciałaby Pani/chciałby Pan zabezpieczyć siebie lub swoich bliskich?" hint='Wymagana minimum 1 odpowiedź „Szukam"'>
        <Check checked={a.q4_health_close === true} onChange={(v) => set('q4_health_close', v)} label="Szukam zabezpieczenia moich bliskich na wypadek gdyby mnie zabrakło" />

        <Check checked={a.q4_health_illness === true} onChange={(v) => set('q4_health_illness', v)} label="Szukam zabezpieczenia zdrowia na wypadek poważnej choroby" />
        {a.q4_health_illness && (
          <SubGroup title="Jakich świadczeń oczekuje Pan/Pani?" required>
            {['wsparcie finansowe w przypadku poważnych zachorowań', 'wsparcie organizacyjne w procesie leczenia', 'wsparcie finansowe na wypadek operacji i zabiegów', 'wsparcie finansowe na wypadek pobytu w szpitalu', 'korzystanie z usług prywatnej opieki medycznej'].map((b) => (
              <Check key={b} checked={(a.q4_health_illness_benefits ?? []).includes(b)} onChange={() => toggleArr('q4_health_illness_benefits', b)} label={b} />
            ))}
          </SubGroup>
        )}

        <Check checked={a.q4_health_accident === true} onChange={(v) => set('q4_health_accident', v)} label="Szukam zabezpieczenia zdrowia przed konsekwencjami wypadków" />
        {a.q4_health_accident && (
          <SubGroup title="Jakich świadczeń oczekuje Pan/Pani?">
            {['wsparcie finansowe na wypadek drobnych urazów', 'wsparcie finansowe na wypadek poważnych urazów', 'wsparcie finansowe na wypadek operacji i zabiegów', 'wsparcie finansowe na wypadek pobytu w szpitalu', 'korzystanie z usług prywatnej opieki medycznej'].map((b) => (
              <Check key={b} checked={(a.q4_health_accident_benefits ?? []).includes(b)} onChange={() => toggleArr('q4_health_accident_benefits', b)} label={b} />
            ))}
          </SubGroup>
        )}

        <Check checked={a.q4_health_disability === true} onChange={(v) => set('q4_health_disability', v)} label="Szukam zabezpieczenia finansowego na wypadek niezdolności do pracy" />
        {a.q4_health_disability && (
          <SubGroup title="Jakich świadczeń oczekuje Pan/Pani?">
            {['środki pieniężne na wypadek utraty zdolności do samodzielnej egzystencji', 'środki pieniężne na wypadek całkowitej niezdolności do jakiejkolwiek pracy'].map((b) => (
              <Check key={b} checked={(a.q4_health_disability_benefits ?? []).includes(b)} onChange={() => toggleArr('q4_health_disability_benefits', b)} label={b} />
            ))}
          </SubGroup>
        )}

        <Check checked={a.q4_health_children === true} onChange={(v) => set('q4_health_children', v)} label="Szukam zabezpieczenia na wypadek utraty zdrowia moich dzieci" />
        {a.q4_health_children && (
          <SubGroup title="Jakich świadczeń oczekuje Pan/Pani?">
            {['wsparcie finansowe w przypadku poważnych zachorowań dziecka', 'dostęp do organizacji procesów leczenia dziecka', 'wsparcie finansowe na wypadek urazów dziecka', 'wsparcie finansowe na wypadek poważnych urazów dziecka', 'wsparcie finansowe na wypadek operacji dziecka', 'wsparcie finansowe na wypadek pobytu w szpitalu dziecka', 'prywatna opieka medyczna dla dziecka'].map((b) => (
              <Check key={b} checked={(a.q4_health_children_benefits ?? []).includes(b)} onChange={() => toggleArr('q4_health_children_benefits', b)} label={b} />
            ))}
          </SubGroup>
        )}
      </Question>

      {showQ5 && (
        <Question n={5} title="Wybierając umowę z elementem oszczędnościowym lub inwestycyjnym chce Pani/Pan?">
          <Radio name="q5" checked={a.q5 === 'regular'} onChange={() => set('q5', 'regular')} label="Uiszczać składki ubezpieczeniowe regularnie" />
          <Radio name="q5" checked={a.q5 === 'lump_sum'} onChange={() => set('q5', 'lump_sum')} label="Wpłacić środki jednorazowo" />
        </Question>
      )}

      <Question n={6} title="Czy rozumie Pani/Pan, że w przypadku rozwiązania umowy przed upływem okresu jej obowiązywania może Pan/Pani otrzymać mniejszą kwotę niż suma ubezpieczenia?">
        <Radio name="q6" checked={a.q6 === true} onChange={() => set('q6', true)} label="Tak" />
        <Radio name="q6" checked={a.q6 === false} onChange={() => set('q6', false)} label="Nie" />
      </Question>

      <Question n={7} title="Czy rozumie Pani/Pan, że w przypadku rozwiązania umowy przed upływem okresu jej obowiązywania może Pan/Pani otrzymać mniejszą kwotę niż suma zapłaconych składek?">
        <Radio name="q7" checked={a.q7 === true} onChange={() => set('q7', true)} label="Tak" />
        <Radio name="q7" checked={a.q7 === false} onChange={() => set('q7', false)} label="Nie" />
      </Question>

      <Question n={8} title="Przez jaki okres chce Pani/Pan oszczędzać/inwestować?">
        <Radio name="q8" checked={a.q8 === 'under_10'} onChange={() => set('q8', 'under_10')} label="Mniej niż 10 lat" />
        <Radio name="q8" checked={a.q8 === '10_19'} onChange={() => set('q8', '10_19')} label="Od 10 do 19 lat" />
        <Radio name="q8" checked={a.q8 === '20_plus'} onChange={() => set('q8', '20_plus')} label="20 lat lub więcej" />
      </Question>

      <Question n={9} title="Które stwierdzenie jest dla Pani/Pana prawdziwe?">
        <Radio name="q9" checked={a.q9 === '1'} onChange={() => set('q9', '1')} label="Ważniejsza jest najwyższa ochrona wpłaconych środków. Nie akceptuję zmienności wartości wpłaconych środków." />
        <Radio name="q9" checked={a.q9 === '2'} onChange={() => set('q9', '2')} label="Poza kosztami ubezpieczenia zależy mi, aby nie więcej niż 50% składki było inwestowane. Mogę podjąć pewne ryzyko." />
        <Radio name="q9" checked={a.q9 === '3'} onChange={() => set('q9', '3')} label="Poza kosztami ubezpieczenia zależy mi, aby co najmniej 50% składki było inwestowane. Akceptuję wyższe ryzyko dla wyższego zysku." />
        <Radio name="q9" checked={a.q9 === '4'} onChange={() => set('q9', '4')} label="Zależy mi, aby jak największa część składki była inwestowana. Dążę do wysokiego zysku i akceptuję znaczne wahania wartości." />
      </Question>

      {/* PEP / AML */}
      <div className="card border-l-4 border-l-orange-400">
        <h2 className="font-bold text-brand-700 mb-3">Oświadczenia AML (PEP)</h2>

        <div className="space-y-3 mb-4">
          <p className="font-medium text-sm">Czy jest Pan/Pani osobą posiadającą Status PEP?</p>
          <div className="space-y-1">
            <Radio name="pep_current" checked={a.pep_current === true} onChange={() => set('pep_current', true)} label="Tak" />
            <Radio name="pep_current" checked={a.pep_current === false} onChange={() => set('pep_current', false)} label="Nie" />
          </div>
          {a.pep_current && (
            <input type="text" className="input-field" placeholder="Rodzaj stanowiska / stopień pokrewieństwa" value={a.pep_current_desc ?? ''} onChange={(e) => set('pep_current_desc', e.target.value)} />
          )}
        </div>

        <div className="space-y-3">
          <p className="font-medium text-sm">Czy przez ostatnie 12 miesięcy był(a) Pan/Pani osobą PEP?</p>
          <div className="space-y-1">
            <Radio name="pep_past" checked={a.pep_past === true} onChange={() => set('pep_past', true)} label="Tak" />
            <Radio name="pep_past" checked={a.pep_past === false} onChange={() => set('pep_past', false)} label="Nie" />
          </div>
          {a.pep_past && (
            <input type="text" className="input-field" placeholder="Opisz krótko" value={a.pep_past_desc ?? ''} onChange={(e) => set('pep_past_desc', e.target.value)} />
          )}
        </div>
      </div>

      {/* Zgody */}
      <div className="card border-l-4 border-l-brand-600 space-y-3">
        <h2 className="font-bold text-brand-700">Zgody</h2>

        <Check checked={a.consent_rodo === true} onChange={(v) => set('consent_rodo', v)} required label="Wiem, że mogę wycofać zgodę w każdym momencie. Mam prawo do dostępu, sprostowania, usunięcia i przeniesienia danych. Dane przetwarzane są do momentu zgłoszenia sprzeciwu. Administratorem danych jest EPRO Sp. z o.o., ul. Mikołajska 25, 02-455 Warszawa. Kontakt z IOD: iod@epropolska.pl" />

        <Check checked={a.consent_marketing_email === true} onChange={(v) => set('consent_marketing_email', v)} label="Wyrażam dobrowolną zgodę na przekazanie danych (imię, nazwisko, email) do Phinance S.A., Poznań, ul. Ratajczaka 19, w celach marketingowych (email)." />

        <Check checked={a.consent_marketing_phone === true} onChange={(v) => set('consent_marketing_phone', v)} label="Wyrażam dobrowolną zgodę na przekazanie danych (imię, nazwisko, telefon) do Phinance S.A. w celach marketingowych (telefon/SMS)." />

        <div className="border-t pt-3">
          <Check checked={a.consent_ank === true} onChange={(v) => set('consent_ank', v)} required label="Akceptuję Analizę Potrzeb Klienta" />
          <p className="text-xs text-gray-500 mt-1 ml-8">Twoja akceptacja zostanie zarchiwizowana wraz z datą i adresem IP (wymóg ustawy IDD, archiwizacja min. 5 lat).</p>
        </div>
      </div>

      <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="btn-primary w-full text-lg py-4">
        Akceptuję i przechodzę do wniosku →
      </button>

      {!canSubmit && <p className="text-xs text-gray-500 text-center">Uzupełnij wszystkie wymagane pola.</p>}
    </div>
  )
}

function Question({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="flex gap-3 mb-3">
        <span className="text-brand-600 font-bold text-lg">{n}.</span>
        <h2 className="font-semibold text-gray-900 flex-1">{title}</h2>
      </div>
      {hint && <p className="text-xs text-gray-500 mb-3 ml-8">{hint}</p>}
      <div className="space-y-2 ml-8">{children}</div>
    </div>
  )
}

function SubGroup({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-3 ml-6 pl-4 border-l-2 border-brand-200 space-y-2 animate-fade-in">
      <p className="text-sm font-semibold text-brand-700">{title} {required && <span className="text-red-500">*</span>}</p>
      {children}
    </div>
  )
}

function Radio({ name, value, checked, onChange, label }: { name: string; value?: string; checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex gap-3 items-start cursor-pointer">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 accent-brand-600" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function Check({ checked, onChange, label, required }: { checked: boolean; onChange: (v: boolean) => void; label: string; required?: boolean }) {
  return (
    <label className="flex gap-3 items-start cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-brand-600 w-5 h-5 flex-shrink-0" />
      <span className="text-sm text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
    </label>
  )
}
