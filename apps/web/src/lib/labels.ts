// Mapowanie techniczne klucze → polskie etykiety dla ANK i ankiety medycznej

export const ANK_QUESTIONS: Record<string, string> = {
  q1: 'Czy jest Pan/Pani zainteresowana ubezpieczeniem indywidualnym?',
  q2: 'Czy posiada Pani/Pan stałe źródło dochodu i interesuje Panią/Pana regularne, długoterminowe oszczędzanie?',
  q3: 'Jaką potrzebę chce Pan/Pani zabezpieczyć?',
  q4_health_close: 'Szukam zabezpieczenia bliskich na wypadek gdyby mnie zabrakło',
  q4_health_illness: 'Szukam zabezpieczenia zdrowia na wypadek poważnej choroby',
  q4_health_illness_benefits: 'Oczekiwane świadczenia (poważna choroba)',
  q4_health_accident: 'Szukam zabezpieczenia zdrowia przed konsekwencjami wypadków',
  q4_health_accident_benefits: 'Oczekiwane świadczenia (wypadek)',
  q4_health_disability: 'Szukam zabezpieczenia na wypadek niezdolności do pracy',
  q4_health_disability_benefits: 'Oczekiwane świadczenia (niezdolność)',
  q4_health_children: 'Szukam zabezpieczenia na wypadek utraty zdrowia dzieci',
  q4_health_children_benefits: 'Oczekiwane świadczenia (dziecko)',
  q5: 'Sposób uiszczania składki przy umowie oszczędnościowej/inwestycyjnej',
  q6: 'Rozumiem, że przy rozwiązaniu umowy mogę otrzymać mniej niż sumę ubezpieczenia',
  q7: 'Rozumiem, że przy rozwiązaniu umowy mogę otrzymać mniej niż sumę zapłaconych składek',
  q8: 'Planowany okres oszczędzania/inwestowania',
  q9: 'Profil ryzyka inwestycyjnego',
  pep_current: 'Czy posiada Pan/Pani status PEP?',
  pep_current_desc: 'Opis (PEP – aktualnie)',
  pep_past: 'Czy przez ostatnie 12 miesięcy był(a) Pan/Pani osobą PEP?',
  pep_past_desc: 'Opis (PEP – ostatnie 12 mies.)',
  consent_rodo: 'Zgoda RODO i administrator danych',
  consent_marketing_email: 'Zgoda na marketing email (Phinance S.A.)',
  consent_marketing_phone: 'Zgoda na marketing telefoniczny (Phinance S.A.)',
  consent_ank: 'Akceptacja Analizy Potrzeb Klienta',
}

export const ANK_VALUE_LABELS: Record<string, Record<string, string>> = {
  q1: { individual: 'Tak (indywidualne)', company: 'Nie, firmowe' },
  q3: {
    health: 'Przede wszystkim ochrona życia lub zdrowia',
    savings: 'Przede wszystkim oszczędzanie na przyszłość',
    investment: 'Przede wszystkim inwestowanie posiadanych środków',
  },
  q5: {
    regular: 'Regularne składki',
    lump_sum: 'Jednorazowa wpłata',
  },
  q8: {
    under_10: 'Mniej niż 10 lat',
    '10_19': 'Od 10 do 19 lat',
    '20_plus': '20 lat lub więcej',
  },
  q9: {
    '1': '1 – Najwyższa ochrona środków, brak akceptacji wahań',
    '2': '2 – Maks. 50% składki inwestowane, umiarkowane ryzyko',
    '3': '3 – Min. 50% składki inwestowane, wyższe ryzyko',
    '4': '4 – Maks. inwestycji, dążenie do zysku, akceptacja wahań',
  },
}

export const MEDICAL_QUESTIONS: Record<string, { label: string; group?: string }> = {
  height_cm: { label: 'Wzrost (cm)', group: '1. Wymiary' },
  weight_kg: { label: 'Waga (kg)', group: '1. Wymiary' },
  weight_change: { label: '2. Zmiana wagi w ostatnim roku' },
  weight_change_kg: { label: '— o ile kg' },
  weight_change_diet: { label: '— czy skutek diety odchudzającej' },
  hazardous_work: { label: '3. Praca z czynnikami szkodliwymi/niebezpiecznymi' },
  hazardous_work_desc: { label: '— opis' },
  risky_sports: { label: '4. Sporty ekstremalne' },
  risky_sports_desc: { label: '— opis' },
  alcohol: { label: '5. Spożycie alkoholu' },
  alcohol_beer: { label: '— piwo (l/mies.)' },
  alcohol_wine: { label: '— wino (l/mies.)' },
  alcohol_spirits: { label: '— wysokoprocentowe (l/mies.)' },
  smoking_year: { label: '6. Palenie tytoniu w ostatnim roku' },
  drugs: { label: '7. Narkotyki / środki odurzające / nadużywanie alkoholu' },
  drugs_desc: { label: '— opis' },
  hospital_10y: { label: '8. Leczenie szpitalne / operacje w ciągu 10 lat' },
  hospital_10y_desc: { label: '— opis' },
  abnormal_labs: { label: '9. Nieprawidłowe wyniki badań laboratoryjnych (10 lat)' },
  abnormal_labs_desc: { label: '— opis' },
  specialist_tests: { label: '10. Badania specjalistyczne wymagające dalszej diagnostyki' },
  specialist_tests_desc: { label: '— opis' },
  long_meds: { label: '11. Leki przyjmowane >14 dni w ciągu 10 lat' },
  long_meds_desc: { label: '— opis' },
  cond_cancer: { label: 'Choroby nowotworowe', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_cancer_desc: { label: '— opis' },
  cond_cardio: { label: 'Choroby układu krążenia', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_cardio_desc: { label: '— opis' },
  cond_respiratory: { label: 'Choroby układu oddechowego', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_respiratory_desc: { label: '— opis' },
  cond_digestive: { label: 'Choroby przewodu pokarmowego', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_digestive_desc: { label: '— opis' },
  cond_urinary: { label: 'Choroby układu moczowego / płciowego', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_urinary_desc: { label: '— opis' },
  cond_metabolic: { label: 'Zaburzenia metaboliczne / hormonalne / cukrzyca / tarczyca', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_metabolic_desc: { label: '— opis' },
  cond_infectious: { label: 'Choroby zakaźne / WZW', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_infectious_desc: { label: '— opis' },
  cond_hiv: { label: 'AIDS / HIV', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_hiv_desc: { label: '— opis' },
  cond_neuro: { label: 'Choroby układu nerwowego / psychiczne', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_neuro_desc: { label: '— opis' },
  cond_musculo: { label: 'Choroby układu kostno-mięśniowego / kręgosłupa', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_musculo_desc: { label: '— opis' },
  cond_eyes_ears: { label: 'Choroby oczu / uszu / wzroku / słuchu', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_eyes_ears_desc: { label: '— opis' },
  cond_other: { label: 'Inne dolegliwości', group: '12. Dolegliwości / choroby (ostatnie 10 lat)' },
  cond_other_desc: { label: '— opis' },
  sick_leave_14d: { label: '13. Zwolnienie lekarskie >14 dni w ostatnich 5 latach' },
  sick_leave_desc: { label: '— opis' },
  disability_pension: { label: '14. Renta chorobowa / inwalidzka / stopień niepełnosprawności' },
  disability_pension_desc: { label: '— opis' },
  family_history: { label: '15. Choroby w najbliższej rodzinie przed 65. rokiem życia' },
  family_history_desc: { label: '— opis' },
  refused_life_insurance: { label: '16. Czy odmówiono kiedykolwiek ubezpieczenia na życie' },
  refused_desc: { label: '— powód' },
  family_doctor: { label: '17. Placówka medyczna / lekarz pierwszego kontaktu' },
  truthful_declaration: { label: 'Oświadczenie o prawdziwości danych' },
}

export const CONSENT_LABELS: Record<string, string> = {
  rodo: 'Zgoda RODO (art. 6) – przetwarzanie danych osobowych',
  health_data: 'Zgoda RODO (art. 9) – przetwarzanie danych zdrowotnych',
  contact_email: 'Kontakt mailowy',
  contact_phone: 'Kontakt telefoniczny',
  truthful: 'Oświadczenie o prawdziwości danych',
}

export const RELATION_PL: Record<string, string> = {
  Małżonek: 'Małżonek/małżonka',
  'Małżonek/małżonka': 'Małżonek/małżonka',
  Dziecko: 'Dziecko',
  Rodzic: 'Rodzic',
  Rodzeństwo: 'Rodzeństwo',
}

export function formatYesNo(v: unknown): string {
  if (v === true) return 'Tak'
  if (v === false) return 'Nie'
  return '—'
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return formatYesNo(value)
  if (Array.isArray(value)) return value.length === 0 ? '—' : value.join(' · ')
  if (typeof value === 'string') {
    // sprawdź czy są value labels (np. q1, q3, q5, q8, q9)
    const labels = ANK_VALUE_LABELS[key]
    if (labels && labels[value]) return labels[value]
    return value
  }
  if (typeof value === 'number') return String(value)
  return JSON.stringify(value)
}
