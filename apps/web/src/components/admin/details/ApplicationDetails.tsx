import { CONSENT_LABELS, formatYesNo } from '@/lib/labels'

interface Props {
  formData: Record<string, any> | null | undefined
  productType: string
}

interface Personal {
  first_name?: string; middle_name?: string; last_name?: string
  pesel?: string; pesel_type?: string
  birth_date?: string; gender?: string
  id_number?: string; id_expiry?: string
  citizenship?: string; occupation?: string
  street?: string; house_number?: string; apartment_number?: string
  postal_code?: string; city?: string
  same_correspondence?: boolean
  corr_street?: string; corr_house_number?: string; corr_apartment_number?: string
  corr_postal_code?: string; corr_city?: string
  email?: string; phone?: string
  policyholder_is_insured?: boolean
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-600 md:col-span-1">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 md:col-span-2 md:text-right">{value || '—'}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wide text-brand-600 mb-2 pb-1 border-b border-brand-100">
        {title}
      </h3>
      <dl>{children}</dl>
    </section>
  )
}

function formatAddress(p: Personal): string {
  if (!p.street) return ''
  const apt = p.apartment_number ? `/${p.apartment_number}` : ''
  return `${p.street} ${p.house_number ?? ''}${apt}, ${p.postal_code ?? ''} ${p.city ?? ''}`.trim()
}

function formatCorrAddress(p: Personal): string {
  if (!p.corr_street) return ''
  const apt = p.corr_apartment_number ? `/${p.corr_apartment_number}` : ''
  return `${p.corr_street} ${p.corr_house_number ?? ''}${apt}, ${p.corr_postal_code ?? ''} ${p.corr_city ?? ''}`.trim()
}

function renderCalculatorData(productType: string, data: any): React.ReactNode {
  if (!data) return null

  // Wariant A — pełne parametry + umowy dodatkowe
  if (productType === 'life_a') {
    const enabledRiders = Object.entries(data.riders ?? {})
      .filter(([_, r]: any) => r?.enabled)
      .map(([key, r]: any) => {
        const labelMap: Record<string, string> = {
          accidentalDeath: 'Śmierć w wyniku wypadku',
          surgery: 'Operacja chirurgiczna',
          permanentDisabilityAccident: 'Trwały uszczerbek (wypadek) + Wsparcie+',
          hospitalization: 'Pobyt w szpitalu',
          disabilityPension: 'Renta wypadkowa',
          permanentIncapacity: 'Trwała niezdolność do pracy',
          cancerDiagnosis: 'Nowotwór – zdiagnozowanie',
          cancerTreatment: 'Nowotwór złośliwy – leczenie',
          seriousIllness: 'Poważne zachorowanie',
          treatmentAbroad: 'Leczenie za granicą',
          medicalOpinion: 'Ekspercka Opinia Medyczna',
          eConsultations: 'E-konsultacje medyczne',
          medicalAssistance: 'Assistance medyczny',
          yourHealth: 'Twoje Zdrowie',
          premiumWaiver: 'Przejęcie opłacania składki',
        }
        const params: string[] = []
        if (r.sum) params.push(`SU: ${r.sum.toLocaleString('pl-PL')} PLN`)
        if (r.dailyBenefit) params.push(`${r.dailyBenefit} PLN/dzień`)
        if (r.monthlyBenefit) params.push(`${r.monthlyBenefit} PLN/mies.`)
        if (r.variant) params.push(`Wariant: ${r.variant}`)
        return { label: labelMap[key] ?? key, params: params.join(' · ') }
      })

    return (
      <>
        <Section title="Parametry umowy głównej">
          <Row label="Suma ubezpieczenia" value={data.sumInsured ? `${data.sumInsured.toLocaleString('pl-PL')} PLN` : '—'} />
          <Row label="Okres ubezpieczenia" value={data.term === 'whole_life' ? 'Na całe życie' : `${data.term} lat`} />
          <Row label="Wariant sumy" value={data.sumVariant === 'fixed' ? 'Stała' : 'Malejąca'} />
          <Row label="Choroba śmiertelna w zakresie" value={formatYesNo(data.terminalIllness)} />
          <Row label="Częstotliwość składki" value={({ monthly: 'Miesięczna', quarterly: 'Kwartalna', 'semi-annual': 'Półroczna', annual: 'Roczna' } as any)[data.frequency] ?? data.frequency} />
        </Section>
        <Section title="Dane do oceny ryzyka">
          <Row label="Wiek" value={`${data.age} lat`} />
          <Row label="Płeć" value={data.gender === 'M' ? 'Mężczyzna' : 'Kobieta'} />
          <Row label="Wzrost / waga" value={`${data.height} cm · ${data.weight} kg`} />
          <Row label="Palenie tytoniu (ostatni rok)" value={formatYesNo(data.smoker)} />
          <Row label="Zawód" value={data.occupation} />
        </Section>
        {enabledRiders.length > 0 && (
          <Section title={`Wybrane umowy dodatkowe (${enabledRiders.length})`}>
            {enabledRiders.map((r, i) => (
              <Row key={i} label={`✓ ${r.label}`} value={r.params || '—'} />
            ))}
          </Section>
        )}
      </>
    )
  }

  // Wariant B — 4 filary
  if (productType === 'life_b') {
    const filars = ['filar1', 'filar2', 'filar3', 'filar4']
    const filarLabels: Record<string, string> = {
      filar1: 'Filar 1 – Życie', filar2: 'Filar 2 – Uszkodzenie ciała / niezdolność',
      filar3: 'Filar 3 – Poważne zachorowanie', filar4: 'Filar 4 – Zdrowie dziecka',
    }
    return (
      <Section title="Wybrane filary">
        <Row label="Wiek" value={`${data.age} lat`} />
        {filars.map((f) => {
          const filar = data[f]
          if (!filar?.enabled) return null
          return (
            <Row
              key={f}
              label={`✓ ${filarLabels[f]}`}
              value={`SU: ${filar.sum?.toLocaleString('pl-PL')} PLN · Wariant: ${filar.variant}`}
            />
          )
        })}
      </Section>
    )
  }

  // OC/AC
  if (productType.startsWith('oc') || productType === 'ac') {
    return (
      <Section title="Parametry OC/AC">
        <Row label="Marka i model" value={`${data.brand ?? ''} ${data.model ?? ''}`.trim()} />
        <Row label="Rok produkcji" value={data.year} />
        <Row label="Pojemność silnika" value={data.engineCapacity ? `${data.engineCapacity} cm³` : '—'} />
        <Row label="Wartość pojazdu" value={data.vehicleValue ? `${data.vehicleValue.toLocaleString('pl-PL')} PLN` : '—'} />
        <Row label="Numer rejestracyjny" value={data.registrationNumber} />
        <Row label="VIN" value={data.vin} />
        <Row label="Wiek kierowcy / staż" value={`${data.driverAge ?? '—'} lat · staż ${data.licenseYears ?? '—'} lat`} />
        <Row label="Szkody w ostatnich 3 latach" value={data.claimsLast3Years === 3 ? '3+' : data.claimsLast3Years} />
        <Row label="Aktualna zniżka BM" value={data.bmDiscount !== undefined ? `${data.bmDiscount}%` : '—'} />
        <Row label="Zakres" value={({ oc: 'Tylko OC', oc_ac: 'OC + AC', oc_ac_assistance: 'OC + AC + Assistance', full: 'Pełny pakiet' } as any)[data.scope] ?? data.scope} />
        {data.deductible !== undefined && <Row label="Udział własny AC" value={`${data.deductible} PLN`} />}
        <Row label="Ubezpieczenie szyb" value={formatYesNo(data.windowsCoverage)} />
        <Row label="NNW kierowcy" value={formatYesNo(data.nnwDriver)} />
      </Section>
    )
  }

  // Majątek
  if (productType === 'property') {
    return (
      <Section title="Parametry – majątek">
        <Row label="Typ nieruchomości" value={({ apartment: 'Mieszkanie', house: 'Dom', house_under_construction: 'Dom w budowie' } as any)[data.propertyType] ?? data.propertyType} />
        <Row label="Kod pocztowy" value={data.postalCode} />
        <Row label="Metraż" value={data.area ? `${data.area} m²` : '—'} />
        <Row label="Rok budowy" value={data.buildYear} />
        <Row label="Wartość nieruchomości" value={data.propertyValue ? `${data.propertyValue.toLocaleString('pl-PL')} PLN` : '—'} />
        <Row label="Wartość wyposażenia" value={data.furnitureValue ? `${data.furnitureValue.toLocaleString('pl-PL')} PLN` : '—'} />
        <Row label="Zakres" value={({ walls: 'Mury', walls_furniture: 'Mury + wyposażenie', full: 'Pełny pakiet' } as any)[data.scope] ?? data.scope} />
      </Section>
    )
  }

  return null
}

export function ApplicationDetails({ formData, productType }: Props) {
  if (!formData) return <p className="text-sm text-gray-500 italic">Brak danych wniosku.</p>

  const p: Personal = formData.personal ?? {}
  const beneficiaries: any[] = formData.beneficiaries ?? []
  const consents = formData.consents ?? {}
  const calc = formData.calculatorData

  const fullName = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <Section title="Dane osobowe wnioskodawcy">
        <Row label="Imię i nazwisko" value={fullName} />
        <Row label="PESEL" value={`${p.pesel ?? '—'}${p.pesel_type ? ` (${p.pesel_type === 'UA' ? 'Ukraiński ID' : 'PESEL PL'})` : ''}`} />
        <Row label="Data urodzenia" value={p.birth_date} />
        <Row label="Płeć" value={p.gender === 'M' ? 'Mężczyzna' : p.gender === 'K' ? 'Kobieta' : '—'} />
        <Row label="Dokument tożsamości" value={p.id_number} />
        <Row label="Ważność dokumentu" value={p.id_expiry} />
        <Row label="Obywatelstwo" value={p.citizenship} />
        <Row label="Zawód" value={p.occupation} />
      </Section>

      <Section title="Kontakt">
        <Row label="Email" value={p.email} />
        <Row label="Telefon" value={p.phone} />
      </Section>

      <Section title="Adres zamieszkania">
        <Row label="Adres" value={formatAddress(p)} />
        {!p.same_correspondence && (
          <Row label="Adres korespondencyjny" value={formatCorrAddress(p)} />
        )}
        {p.same_correspondence && (
          <Row label="Adres korespondencyjny" value={<span className="text-gray-500 italic">taki sam jak zamieszkania</span>} />
        )}
      </Section>

      <Section title="Role na polisie">
        <Row
          label="Ubezpieczający = ubezpieczony"
          value={p.policyholder_is_insured === false
            ? <span className="text-orange-700">⚠ Nie – wymagane dane drugiej osoby</span>
            : 'Tak'}
        />
      </Section>

      {(productType === 'life_a' || productType === 'life_b') && (
        <Section title="Uposażeni">
          {beneficiaries.length === 0 ? (
            <p className="text-sm text-gray-600 italic py-2">
              Brak wskazanych uposażonych — świadczenie wypłacane wg dziedziczenia ustawowego (kodeks cywilny art. 922).
            </p>
          ) : (
            beneficiaries.map((b: any, i: number) => (
              <Row
                key={i}
                label={`Uposażony ${i + 1}`}
                value={
                  <>
                    <div>{b.first_name} {b.last_name} ({b.share}%)</div>
                    <div className="text-xs text-gray-500">{b.relation}{b.pesel ? ` · PESEL: ${b.pesel}` : ''}{b.birth_date ? ` · ur. ${b.birth_date}` : ''}</div>
                  </>
                }
              />
            ))
          )}
        </Section>
      )}

      {calc && renderCalculatorData(productType, calc)}

      <Section title="Zgody">
        {Object.entries(consents).map(([k, v]) => (
          <Row key={k} label={CONSENT_LABELS[k] ?? k} value={formatYesNo(v)} />
        ))}
      </Section>
    </div>
  )
}
