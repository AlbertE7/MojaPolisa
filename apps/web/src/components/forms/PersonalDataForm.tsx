'use client'

import { useState } from 'react'
import { validatePeselPL, validatePeselUA, calculateAge } from '@mojapolisa/shared'

export interface PersonalData {
  pesel_type: 'PL' | 'UA'
  pesel: string
  first_name: string
  middle_name: string
  last_name: string
  birth_date: string
  gender: 'M' | 'K'
  id_number: string
  id_expiry: string
  citizenship: string
  occupation: string
  street: string
  house_number: string
  apartment_number: string
  postal_code: string
  city: string
  same_correspondence: boolean
  corr_street?: string
  corr_house_number?: string
  corr_apartment_number?: string
  corr_postal_code?: string
  corr_city?: string
  email: string
  phone: string
  policyholder_is_insured: boolean
}

interface Props {
  initial?: Partial<PersonalData>
  onSubmit: (data: PersonalData) => void
}

export function PersonalDataForm({ initial, onSubmit }: Props) {
  const [d, setD] = useState<PersonalData>({
    pesel_type: 'PL', pesel: '', first_name: '', middle_name: '', last_name: '',
    birth_date: '', gender: 'M', id_number: '', id_expiry: '',
    citizenship: 'polskie', occupation: '',
    street: '', house_number: '', apartment_number: '',
    postal_code: '', city: '', same_correspondence: true,
    email: '', phone: '', policyholder_is_insured: true,
    ...initial,
  })
  const [peselError, setPeselError] = useState<string | null>(null)

  function set<K extends keyof PersonalData>(k: K, v: PersonalData[K]) {
    setD((s) => ({ ...s, [k]: v }))
  }

  function handlePeselChange(value: string) {
    set('pesel', value)
    setPeselError(null)
    if (d.pesel_type === 'PL' && value.length === 11) {
      const parsed = validatePeselPL(value)
      if (!parsed) {
        setPeselError('Nieprawidłowy PESEL (suma kontrolna)')
      } else {
        set('birth_date', parsed.birthDate.toISOString().slice(0, 10))
        set('gender', parsed.gender)
        if (calculateAge(parsed.birthDate) < 18) setPeselError('Wymagana pełnoletność')
      }
    } else if (d.pesel_type === 'UA' && value.length > 0) {
      if (!validatePeselUA(value)) setPeselError('Numer ID musi mieć 10 cyfr')
    }
  }

  const requiredFilled =
    d.first_name && d.last_name && d.pesel && d.birth_date && d.email && d.phone &&
    d.street && d.house_number && d.postal_code && d.city && !peselError

  function handleSubmit() {
    if (requiredFilled) onSubmit(d)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Dane osobowe</h2>

        <div>
          <label className="label">Typ dokumentu</label>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => set('pesel_type', 'PL')} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${d.pesel_type === 'PL' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>🇵🇱 Polski PESEL</button>
            <button type="button" onClick={() => set('pesel_type', 'UA')} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${d.pesel_type === 'UA' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>🇺🇦 Ukraiński nr identyfikacyjny</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{d.pesel_type === 'PL' ? 'PESEL' : 'Numer identyfikacyjny UA'}</label>
            <input type="text" inputMode="numeric" maxLength={d.pesel_type === 'PL' ? 11 : 10} className={`input-field ${peselError ? 'input-error' : ''}`} value={d.pesel} onChange={(e) => handlePeselChange(e.target.value.replace(/\D/g, ''))} />
            {peselError && <p className="error-text">{peselError}</p>}
          </div>
          <div>
            <label className="label">Data urodzenia</label>
            <input type="date" className="input-field" value={d.birth_date} onChange={(e) => set('birth_date', e.target.value)} disabled={d.pesel_type === 'PL'} />
          </div>
          <div>
            <label className="label">Imię</label>
            <input type="text" className="input-field" value={d.first_name} onChange={(e) => set('first_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Drugie imię (opcjonalne)</label>
            <input type="text" className="input-field" value={d.middle_name} onChange={(e) => set('middle_name', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Nazwisko</label>
            <input type="text" className="input-field" value={d.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </div>
          {d.pesel_type === 'UA' && (
            <div>
              <label className="label">Płeć</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => set('gender', 'M')} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${d.gender === 'M' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Mężczyzna</button>
                <button type="button" onClick={() => set('gender', 'K')} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${d.gender === 'K' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Kobieta</button>
              </div>
            </div>
          )}
          <div>
            <label className="label">Seria i nr dowodu/paszportu</label>
            <input type="text" className="input-field uppercase" value={d.id_number} onChange={(e) => set('id_number', e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="label">Data ważności dokumentu</label>
            <input type="date" className="input-field" value={d.id_expiry} onChange={(e) => set('id_expiry', e.target.value)} />
          </div>
          <div>
            <label className="label">Obywatelstwo</label>
            <input type="text" className="input-field" value={d.citizenship} onChange={(e) => set('citizenship', e.target.value)} />
          </div>
          <div>
            <label className="label">Zawód</label>
            <input type="text" className="input-field" value={d.occupation} onChange={(e) => set('occupation', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Adres zamieszkania</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Ulica</label>
            <input type="text" className="input-field" value={d.street} onChange={(e) => set('street', e.target.value)} />
          </div>
          <div>
            <label className="label">Nr domu</label>
            <input type="text" className="input-field" value={d.house_number} onChange={(e) => set('house_number', e.target.value)} />
          </div>
          <div>
            <label className="label">Nr lokalu</label>
            <input type="text" className="input-field" value={d.apartment_number} onChange={(e) => set('apartment_number', e.target.value)} />
          </div>
          <div>
            <label className="label">Kod pocztowy</label>
            <input type="text" className="input-field" value={d.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="00-000" />
          </div>
          <div>
            <label className="label">Miasto</label>
            <input type="text" className="input-field" value={d.city} onChange={(e) => set('city', e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input type="checkbox" checked={d.same_correspondence} onChange={(e) => set('same_correspondence', e.target.checked)} className="accent-brand-600 w-5 h-5" />
          <span className="text-sm">Adres korespondencyjny taki sam jak zamieszkania</span>
        </label>

        {!d.same_correspondence && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4 animate-fade-in">
            <div className="sm:col-span-2"><label className="label">Ulica</label><input type="text" className="input-field" value={d.corr_street ?? ''} onChange={(e) => set('corr_street', e.target.value)} /></div>
            <div><label className="label">Nr domu</label><input type="text" className="input-field" value={d.corr_house_number ?? ''} onChange={(e) => set('corr_house_number', e.target.value)} /></div>
            <div><label className="label">Nr lokalu</label><input type="text" className="input-field" value={d.corr_apartment_number ?? ''} onChange={(e) => set('corr_apartment_number', e.target.value)} /></div>
            <div><label className="label">Kod pocztowy</label><input type="text" className="input-field" value={d.corr_postal_code ?? ''} onChange={(e) => set('corr_postal_code', e.target.value)} /></div>
            <div><label className="label">Miasto</label><input type="text" className="input-field" value={d.corr_city ?? ''} onChange={(e) => set('corr_city', e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Kontakt</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={d.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input type="tel" className="input-field" value={d.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+48 ..." />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-brand-700 mb-4">Role na polisie</h2>
        <p className="text-sm mb-3">Czy ubezpieczający = ubezpieczony?</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => set('policyholder_is_insured', true)} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${d.policyholder_is_insured ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Tak</button>
          <button type="button" onClick={() => set('policyholder_is_insured', false)} className={`flex-1 py-3 rounded-lg border-2 font-semibold ${!d.policyholder_is_insured ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Nie, inna osoba</button>
        </div>
        {!d.policyholder_is_insured && (
          <p className="text-xs text-gray-500 mt-3 italic">Dane drugiej osoby zostaną zebrane przez agenta w kolejnym kroku procesu.</p>
        )}
      </div>

      <button type="button" onClick={handleSubmit} disabled={!requiredFilled} className="btn-primary w-full text-lg py-4">
        Dalej – uposażony i ankieta medyczna →
      </button>
    </div>
  )
}
