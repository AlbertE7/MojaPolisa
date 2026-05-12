import { PRODUCT_LABELS, type ProductType } from '@mojapolisa/shared'
import { sendEmail, AGENT_EMAIL } from './resend'
import { shell, fieldRow, fieldTable, button } from './templates'
import {
  ANK_QUESTIONS,
  MEDICAL_QUESTIONS,
  CONSENT_LABELS,
  formatYesNo,
  formatValue,
} from '@/lib/labels'

interface SendOpts {
  clientId: string
  applicationId: string
  product: ProductType
  personal: any
  beneficiaries?: any[]
  ank: any
  medical?: any
  calculatorData?: any
  consents?: any
}

// ============================================================
// HELPERS — formatowanie sekcji do HTML
// ============================================================

function section(title: string, rows: string): string {
  if (!rows.trim()) return ''
  return `
    <h2 style="font-size:14px;color:#1e3a8a;margin:24px 0 6px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e0e7ff;padding-bottom:4px">
      ${title}
    </h2>
    ${fieldTable(rows)}
  `
}

function formatMedicalValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return formatYesNo(value)
  if (key === 'weight_change') {
    return ({ none: 'Brak zmiany', gain: 'Wzrost wagi', loss: 'Spadek wagi' } as Record<string, string>)[String(value)] ?? String(value)
  }
  return String(value)
}

function formatAddress(p: any): string {
  if (!p?.street) return '—'
  const apt = p.apartment_number ? `/${p.apartment_number}` : ''
  return `${p.street} ${p.house_number ?? ''}${apt}, ${p.postal_code ?? ''} ${p.city ?? ''}`.trim()
}

function formatCorrAddress(p: any): string {
  if (!p?.corr_street) return '—'
  const apt = p.corr_apartment_number ? `/${p.corr_apartment_number}` : ''
  return `${p.corr_street} ${p.corr_house_number ?? ''}${apt}, ${p.corr_postal_code ?? ''} ${p.corr_city ?? ''}`.trim()
}

// ============================================================
// SEKCJE
// ============================================================

function personalSection(p: any): string {
  const fullName = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')
  const rows =
    fieldRow('Imię i nazwisko', fullName) +
    fieldRow('PESEL', `${p.pesel ?? '—'} (${p.pesel_type === 'UA' ? 'Ukraiński ID' : 'PESEL PL'})`) +
    fieldRow('Data urodzenia', p.birth_date) +
    fieldRow('Płeć', p.gender === 'M' ? 'Mężczyzna' : p.gender === 'K' ? 'Kobieta' : '—') +
    fieldRow('Dokument tożsamości', p.id_number) +
    fieldRow('Ważność dokumentu', p.id_expiry) +
    fieldRow('Obywatelstwo', p.citizenship) +
    fieldRow('Zawód', p.occupation)
  return section('Dane osobowe', rows)
}

function contactSection(p: any): string {
  const rows =
    fieldRow('Email', p.email) +
    fieldRow('Telefon', p.phone)
  return section('Kontakt', rows)
}

function addressSection(p: any): string {
  const rows =
    fieldRow('Adres zamieszkania', formatAddress(p)) +
    fieldRow('Adres korespondencyjny', p.same_correspondence ? '(taki sam jak zamieszkania)' : formatCorrAddress(p))
  return section('Adres', rows)
}

function roleSection(p: any): string {
  if (p.policyholder_is_insured === false) {
    return section('Role na polisie',
      fieldRow('Ubezpieczający = ubezpieczony', '⚠️ NIE – wymagane dane drugiej osoby')
    )
  }
  return section('Role na polisie', fieldRow('Ubezpieczający = ubezpieczony', 'Tak'))
}

function beneficiarySection(beneficiaries: any[] | undefined, productType: string): string {
  if (productType !== 'life_a' && productType !== 'life_b') return ''
  if (!beneficiaries || beneficiaries.length === 0) {
    return section('Uposażeni',
      fieldRow('Uposażeni', 'Brak — wypłata wg dziedziczenia ustawowego (kodeks cywilny art. 922)')
    )
  }
  const rows = beneficiaries
    .map((b: any, i: number) => fieldRow(
      `Uposażony ${i + 1}`,
      `${b.first_name} ${b.last_name} (${b.relation}, ${b.share}%)${b.pesel ? `<br><span style="font-size:11px;color:#6b7280">PESEL: ${b.pesel}</span>` : ''}${b.birth_date ? `<br><span style="font-size:11px;color:#6b7280">ur. ${b.birth_date}</span>` : ''}`
    ))
    .join('')
  return section('Uposażeni', rows)
}

function calculatorSection(productType: string, data: any): string {
  if (!data) return ''

  if (productType === 'life_a') {
    const main =
      fieldRow('Suma ubezpieczenia', data.sumInsured ? `${data.sumInsured.toLocaleString('pl-PL')} PLN` : '—') +
      fieldRow('Okres ubezpieczenia', data.term === 'whole_life' ? 'Na całe życie' : `${data.term} lat`) +
      fieldRow('Wariant sumy', data.sumVariant === 'fixed' ? 'Stała' : 'Malejąca') +
      fieldRow('Choroba śmiertelna w zakresie', formatYesNo(data.terminalIllness)) +
      fieldRow('Częstotliwość składki', ({ monthly: 'Miesięczna', quarterly: 'Kwartalna', 'semi-annual': 'Półroczna', annual: 'Roczna' } as Record<string, string>)[data.frequency] ?? data.frequency)

    const risk =
      fieldRow('Wiek', `${data.age} lat`) +
      fieldRow('Płeć', data.gender === 'M' ? 'Mężczyzna' : 'Kobieta') +
      fieldRow('Wzrost / waga', `${data.height} cm · ${data.weight} kg`) +
      fieldRow('Palenie tytoniu', formatYesNo(data.smoker)) +
      fieldRow('Zawód', data.occupation)

    const riderLabels: Record<string, string> = {
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
    const ridersRows = Object.entries(data.riders ?? {})
      .filter(([_, r]: any) => r?.enabled)
      .map(([key, r]: any) => {
        const params: string[] = []
        if (r.sum) params.push(`SU: ${r.sum.toLocaleString('pl-PL')} PLN`)
        if (r.dailyBenefit) params.push(`${r.dailyBenefit} PLN/dzień`)
        if (r.monthlyBenefit) params.push(`${r.monthlyBenefit} PLN/mies.`)
        if (r.variant) params.push(`Wariant: ${r.variant}`)
        return fieldRow(`✓ ${riderLabels[key] ?? key}`, params.join(' · ') || '—')
      })
      .join('')

    return section('Parametry umowy głównej', main) +
           section('Dane do oceny ryzyka', risk) +
           (ridersRows ? section(`Wybrane umowy dodatkowe`, ridersRows) : '')
  }

  if (productType === 'life_b') {
    const filarLabels: Record<string, string> = {
      filar1: 'Filar 1 – Życie',
      filar2: 'Filar 2 – Uszkodzenie ciała / niezdolność do pracy',
      filar3: 'Filar 3 – Poważne zachorowanie',
      filar4: 'Filar 4 – Zdrowie dziecka',
    }
    const rows = ['filar1', 'filar2', 'filar3', 'filar4']
      .filter((k) => data[k]?.enabled)
      .map((k) => fieldRow(`✓ ${filarLabels[k]}`, `SU: ${data[k].sum?.toLocaleString('pl-PL') ?? '—'} PLN · Wariant: ${data[k].variant ?? '—'}`))
      .join('')
    return section('Wybrane filary', fieldRow('Wiek', `${data.age} lat`) + rows)
  }

  if (productType.startsWith('oc') || productType === 'ac') {
    const rows =
      fieldRow('Marka i model', `${data.brand ?? ''} ${data.model ?? ''}`.trim() || '—') +
      fieldRow('Rok produkcji', data.year) +
      fieldRow('Pojemność silnika', data.engineCapacity ? `${data.engineCapacity} cm³` : '—') +
      fieldRow('Wartość pojazdu', data.vehicleValue ? `${data.vehicleValue.toLocaleString('pl-PL')} PLN` : '—') +
      fieldRow('Numer rejestracyjny', data.registrationNumber) +
      fieldRow('VIN', data.vin) +
      fieldRow('Wiek / staż kierowcy', `${data.driverAge ?? '—'} lat · staż ${data.licenseYears ?? '—'} lat`) +
      fieldRow('Szkody (3 lata)', data.claimsLast3Years === 3 ? '3+' : data.claimsLast3Years) +
      fieldRow('Zniżka BM', data.bmDiscount !== undefined ? `${data.bmDiscount}%` : '—') +
      fieldRow('Zakres', ({ oc: 'Tylko OC', oc_ac: 'OC + AC', oc_ac_assistance: 'OC + AC + Assistance', full: 'Pełny pakiet' } as Record<string, string>)[data.scope] ?? data.scope) +
      (data.deductible !== undefined ? fieldRow('Udział własny AC', `${data.deductible} PLN`) : '') +
      fieldRow('Szyby', formatYesNo(data.windowsCoverage)) +
      fieldRow('NNW kierowcy', formatYesNo(data.nnwDriver))
    return section('Parametry OC/AC', rows)
  }

  if (productType === 'property') {
    const rows =
      fieldRow('Typ nieruchomości', ({ apartment: 'Mieszkanie', house: 'Dom', house_under_construction: 'Dom w budowie' } as Record<string, string>)[data.propertyType] ?? data.propertyType) +
      fieldRow('Kod pocztowy', data.postalCode) +
      fieldRow('Metraż', data.area ? `${data.area} m²` : '—') +
      fieldRow('Rok budowy', data.buildYear) +
      fieldRow('Wartość nieruchomości', data.propertyValue ? `${data.propertyValue.toLocaleString('pl-PL')} PLN` : '—') +
      fieldRow('Wartość wyposażenia', data.furnitureValue ? `${data.furnitureValue.toLocaleString('pl-PL')} PLN` : '—') +
      fieldRow('Zakres', ({ walls: 'Mury', walls_furniture: 'Mury + wyposażenie', full: 'Pełny pakiet' } as Record<string, string>)[data.scope] ?? data.scope)
    return section('Parametry – majątek', rows)
  }

  return ''
}

function ankSection(ank: any): string {
  if (!ank || Object.keys(ank).length === 0) return ''
  const rows = Object.entries(ank)
    .filter(([k, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      const label = ANK_QUESTIONS[k] ?? k
      return fieldRow(label, formatValue(k, v))
    })
    .join('')
  return section('Analiza Potrzeb Klienta (ANK)', rows)
}

function medicalSection(medical: any): string {
  if (!medical || Object.keys(medical).length === 0) return ''
  // Pokazuj tylko "Tak"-i i niepuste wartości (ukryj nudne "Nie")
  const rows = Object.entries(medical)
    .filter(([k, v]) => {
      if (v === undefined || v === null || v === '') return false
      // Pokazuj wszystko, ale ukryj false (Nie) bo nie wnosi informacji
      if (v === false && !k.includes('truthful')) return false
      return true
    })
    .map(([k, v]) => {
      const label = MEDICAL_QUESTIONS[k]?.label ?? k
      const isWarning = v === true && !k.includes('truthful')
      const marker = isWarning ? '⚠️ ' : ''
      return fieldRow(`${marker}${label}`, formatMedicalValue(k, v))
    })
    .join('')
  return section('Ankieta medyczna', rows || fieldRow('Status', 'Wszystkie odpowiedzi „Nie" — brak czerwonych flag'))
}

function consentsSection(consents: any): string {
  if (!consents) return ''
  const rows = Object.entries(consents)
    .map(([k, v]) => fieldRow(CONSENT_LABELS[k] ?? k, formatYesNo(v)))
    .join('')
  return section('Zgody', rows)
}

// ============================================================
// MAIN
// ============================================================

export async function sendApplicationEmails(opts: SendOpts) {
  const { personal, product, applicationId, beneficiaries, ank, medical, calculatorData } = opts
  const productLabel = PRODUCT_LABELS[product]
  const fullName = [personal.first_name, personal.middle_name, personal.last_name].filter(Boolean).join(' ')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://finvita.pl'

  // === EMAIL DO KLIENTA ===
  const clientBody = `
    <h1 style="font-size:22px;color:#1e3a8a;margin:0 0 12px">Dziękujemy za złożenie wniosku</h1>
    <p style="font-size:14px;color:#374151">Cześć ${personal.first_name},</p>
    <p style="font-size:14px;color:#374151">
      Otrzymaliśmy Twój wniosek o ubezpieczenie <strong>${productLabel}</strong>.
      Agent prowadzący skontaktuje się z Tobą w ciągu 24 godzin roboczych.
      Status możesz śledzić w aplikacji.
    </p>
    <div style="margin:24px 0">${button(`${appUrl}/dashboard`, 'Sprawdź status w aplikacji')}</div>
    <h2 style="font-size:14px;color:#1e3a8a;margin:24px 0 6px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e0e7ff;padding-bottom:4px">Podsumowanie wniosku</h2>
    ${fieldTable(
      fieldRow('Numer wniosku', applicationId.slice(0, 8).toUpperCase()) +
      fieldRow('Produkt', productLabel) +
      fieldRow('Wnioskodawca', fullName) +
      fieldRow('Email', personal.email) +
      fieldRow('Telefon', personal.phone) +
      fieldRow('ANK zaakceptowana', new Date().toLocaleString('pl-PL'))
    )}
    <p style="font-size:12px;color:#6b7280;margin-top:24px">
      Twoje dane są szyfrowane (AES-256) i przechowywane zgodnie z RODO oraz IDD.
      Archiwizacja ANK: 5 lat. Możesz w dowolnym momencie zażądać usunięcia danych
      kontaktując się z IOD: iod@epropolska.pl.
    </p>
  `

  await sendEmail({
    to: personal.email,
    subject: `Potwierdzenie wniosku – ${productLabel}`,
    html: shell('Potwierdzenie wniosku', clientBody),
  })

  // === EMAIL DO AGENTA (czytelne sekcje) ===
  const agentBody = `
    <h1 style="font-size:22px;color:#1e3a8a;margin:0 0 4px">📋 Nowy wniosek</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 16px">
      <strong>${fullName}</strong> · ${productLabel}
      <br><span style="font-size:11px">ID: ${applicationId.slice(0, 8).toUpperCase()} · ${new Date().toLocaleString('pl-PL')}</span>
    </p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;border-radius:0 6px 6px 0;font-size:13px;margin-bottom:24px">
      <strong>Dane do przepisania do systemu TU</strong> — wszystkie pola poniżej.
    </div>

    ${personalSection(personal)}
    ${contactSection(personal)}
    ${addressSection(personal)}
    ${roleSection(personal)}
    ${beneficiarySection(beneficiaries, product)}
    ${calculatorSection(product, calculatorData)}
    ${ankSection(ank)}
    ${medicalSection(medical)}
    ${consentsSection(opts.consents)}

    <p style="font-size:12px;color:#6b7280;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px">
      Otwórz w panelu admina: <a href="${appUrl}/admin/klienci/${opts.clientId}?tab=wnioski" style="color:#1e3a8a">${appUrl}/admin/klienci/${opts.clientId}?tab=wnioski</a>
    </p>
  `

  await sendEmail({
    to: AGENT_EMAIL,
    subject: `[Wniosek ${applicationId.slice(0, 8).toUpperCase()}] ${productLabel} – ${fullName}`,
    html: shell(`Nowy wniosek – ${fullName}`, agentBody),
    replyTo: personal.email,
  })
}
